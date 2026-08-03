import type { SupabaseClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import type { Database } from "@/lib/supabase/types";
import {
  consumeRateLimit,
  consumeRateLimits,
  getClientIdentifier,
  getPrivacySafeIdentifier
} from "@/lib/rate-limit";

describe("rate limit helpers", () => {
  beforeEach(() => {
    process.env.RATE_LIMIT_FINGERPRINT_KEY_V1 = "test-rate-limit-fingerprint-key-32";
  });

  afterEach(() => {
    delete process.env.RATE_LIMIT_FINGERPRINT_KEY_V1;
  });

  it("returns a versioned keyed fingerprint instead of a raw client IP", () => {
    const request = new Request("https://invitehub.test/api/public/demo/rsvp", {
      headers: {
        "x-real-ip": "203.0.113.20",
        "x-forwarded-for": "198.51.100.10, 198.51.100.11"
      }
    });

    const expected = createHmac("sha256", "test-rate-limit-fingerprint-key-32")
      .update("203.0.113.20")
      .digest("hex");

    expect(getClientIdentifier(request)).toBe(`v1:${expected}`);
    expect(getClientIdentifier(request)).not.toContain("203.0.113.20");
  });

  it("does not trust the caller-controlled x-forwarded-for header", () => {
    const request = new Request("https://invitehub.test/api/public/demo/rsvp", {
      headers: {
        "x-forwarded-for": "198.51.100.10, 198.51.100.11"
      }
    });

    expect(getClientIdentifier(request)).toBeNull();
  });

  it("creates namespaced keyed identifiers without retaining account or anonymous ids", () => {
    const subject = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const authenticated = getPrivacySafeIdentifier("view_authenticated", subject);
    const anonymous = getPrivacySafeIdentifier("view_anonymous_session", subject);

    expect(authenticated).toMatch(/^v1:[a-f0-9]{64}$/);
    expect(authenticated).not.toContain(subject);
    expect(anonymous).not.toBe(authenticated);
    expect(getPrivacySafeIdentifier("INVALID namespace", subject)).toBeNull();
  });

  it("fails closed when the fingerprint key is missing", () => {
    delete process.env.RATE_LIMIT_FINGERPRINT_KEY_V1;

    const request = new Request("https://invitehub.test/api/public/demo/rsvp", {
      headers: {
        "x-real-ip": "203.0.113.20"
      }
    });

    expect(getClientIdentifier(request)).toBeNull();
  });

  it("fails closed when the fingerprint key is too weak", () => {
    process.env.RATE_LIMIT_FINGERPRINT_KEY_V1 = "short-key";

    expect(getClientIdentifier(new Request("https://invitehub.test", {
      headers: { "x-real-ip": "203.0.113.20" }
    }))).toBeNull();
  });

  it("rejects malformed or conflicting trusted platform headers", () => {
    const malformed = new Request("https://invitehub.test", {
      headers: { "x-real-ip": "not-an-ip" }
    });
    const conflicting = new Request("https://invitehub.test", {
      headers: {
        "x-real-ip": "203.0.113.20",
        "cf-connecting-ip": "198.51.100.10"
      }
    });

    expect(getClientIdentifier(malformed)).toBeNull();
    expect(getClientIdentifier(conflicting)).toBeNull();
  });

  it("uses the persistent rpc backend for rate limiting", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          allowed: true,
          remaining: 4,
          reset_at: "2026-03-26T10:00:00.000Z"
        }
      ],
      error: null
    });

    const result = await consumeRateLimit({
      admin: { rpc } as unknown as SupabaseClient<Database>,
      key: "rsvp:demo:v1:fingerprint",
      limit: 5,
      windowMs: 60_000
    });

    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      bucket_key: "rsvp:demo:v1:fingerprint",
      max_hits: 5,
      window_seconds: 60
    });
    expect(result).toEqual({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.parse("2026-03-26T10:00:00.000Z")
    });
  });

  it("evaluates burst, rolling, and daily policies and fails closed as one decision", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ allowed: true, remaining: 1, reset_at: "2026-03-26T10:01:00.000Z" }],
        error: null
      })
      .mockResolvedValueOnce({
        data: [{ allowed: false, remaining: 0, reset_at: "2026-03-26T11:00:00.000Z" }],
        error: null
      })
      .mockResolvedValueOnce({
        data: [{ allowed: true, remaining: 9, reset_at: "2026-03-27T10:00:00.000Z" }],
        error: null
      });

    const result = await consumeRateLimits({
      admin: { rpc } as unknown as SupabaseClient<Database>,
      policies: [
        { key: "write:user:burst", limit: 2, windowMs: 60_000 },
        { key: "write:user:rolling", limit: 10, windowMs: 3_600_000 },
        { key: "write:user:daily", limit: 20, windowMs: 86_400_000 }
      ]
    });

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      ok: true,
      allowed: false,
      remaining: 0,
      resetAt: Date.parse("2026-03-26T11:00:00.000Z")
    });
  });

  it("fails closed when any durable policy result is unavailable", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ allowed: true, remaining: 1, reset_at: "2026-03-26T10:01:00.000Z" }],
        error: null
      })
      .mockResolvedValueOnce({ data: null, error: { message: "unavailable" } });

    await expect(consumeRateLimits({
      admin: { rpc } as unknown as SupabaseClient<Database>,
      policies: [
        { key: "write:user:burst", limit: 2, windowMs: 60_000 },
        { key: "write:user:daily", limit: 20, windowMs: 86_400_000 }
      ]
    })).resolves.toEqual({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });
  });

  it("fails closed when the RPC throws or returns an invalid reset timestamp", async () => {
    const throwingRpc = vi.fn().mockRejectedValue(new Error("network failed"));
    await expect(consumeRateLimit({
      admin: { rpc: throwingRpc } as unknown as SupabaseClient<Database>,
      key: "write:user:burst",
      limit: 2,
      windowMs: 60_000
    })).resolves.toEqual({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    const invalidRpc = vi.fn().mockResolvedValue({
      data: [{ allowed: true, remaining: 1, reset_at: "not-a-date" }],
      error: null
    });
    await expect(consumeRateLimit({
      admin: { rpc: invalidRpc } as unknown as SupabaseClient<Database>,
      key: "write:user:burst",
      limit: 2,
      windowMs: 60_000
    })).resolves.toEqual({
      ok: false,
      message: "rate_limit_backend_invalid_payload"
    });
  });

  it("aborts and fails closed when the durable limiter times out", async () => {
    const abortSignal = vi.fn(() => new Promise(() => undefined));
    const rpc = vi.fn(() => ({ abortSignal }));

    await expect(consumeRateLimit({
      admin: { rpc } as unknown as SupabaseClient<Database>,
      key: "write:user:burst",
      limit: 2,
      windowMs: 60_000,
      timeoutMs: 5
    })).resolves.toEqual({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });
    expect(abortSignal).toHaveBeenCalledTimes(1);
  });
});
