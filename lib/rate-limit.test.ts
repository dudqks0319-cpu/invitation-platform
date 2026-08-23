import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  consumeRateLimit,
  consumeRateLimitPolicies,
  getClientFingerprint,
  hashRateLimitIdempotencyKey
} from "@/lib/rate-limit";

const TEST_SECRET = "test-rate-limit-fingerprint-secret-32-bytes-minimum";

describe("rate limit helpers", () => {
  it("creates an opaque daily fingerprint without exposing the raw IP", () => {
    const request = new Request("https://invitehub.test/api/public/demo/rsvp", {
      headers: {
        "x-real-ip": "203.0.113.20",
        "x-forwarded-for": "198.51.100.10, 198.51.100.11"
      }
    });
    const options = {
      secret: TEST_SECRET,
      now: new Date("2026-08-11T10:00:00.000Z"),
      productionLike: true
    };

    const first = getClientFingerprint(request, options);
    const sameDay = getClientFingerprint(request, options);
    const nextDay = getClientFingerprint(request, {
      ...options,
      now: new Date("2026-08-12T10:00:00.000Z")
    });

    expect(first.ok).toBe(true);
    expect(sameDay).toEqual(first);
    expect(nextDay).not.toEqual(first);
    if (first.ok) {
      expect(first.fingerprint).toMatch(/^fp1_\d{8}_[a-f0-9]{32}$/);
      expect(first.fingerprint).not.toContain("203.0.113.20");
      expect(first.fingerprint).not.toContain("198.51.100.10");
    }
  });

  it("changes the fingerprint when the identifier rotates", () => {
    const options = {
      secret: TEST_SECRET,
      now: new Date("2026-08-11T10:00:00.000Z"),
      productionLike: true
    };
    const first = getClientFingerprint(new Request("https://invitehub.test", {
      headers: { "x-real-ip": "203.0.113.20" }
    }), options);
    const rotated = getClientFingerprint(new Request("https://invitehub.test", {
      headers: { "x-real-ip": "203.0.113.21" }
    }), options);

    expect(first.ok).toBe(true);
    expect(rotated.ok).toBe(true);
    expect(rotated).not.toEqual(first);
  });

  it("fails closed in production-like environments without a strong secret", () => {
    const request = new Request("https://invitehub.test", {
      headers: { "x-real-ip": "203.0.113.20" }
    });

    expect(getClientFingerprint(request, {
      secret: "",
      productionLike: true,
      now: new Date("2026-08-11T10:00:00.000Z")
    })).toEqual({ ok: false, message: "rate_limit_fingerprint_unavailable" });

    expect(hashRateLimitIdempotencyKey("guest-publish-1234567890", {
      secret: "short",
      productionLike: true
    })).toEqual({ ok: false, message: "rate_limit_fingerprint_unavailable" });
  });

  it("fails closed for an unverifiable production-like client IP", () => {
    const request = new Request("https://invitehub.test", {
      headers: { "x-real-ip": "not-an-ip" }
    });

    expect(getClientFingerprint(request, {
      secret: TEST_SECRET,
      productionLike: true,
      now: new Date("2026-08-11T10:00:00.000Z")
    })).toEqual({ ok: false, message: "rate_limit_client_unverifiable" });
  });

  it("uses the persistent rpc backend with only an opaque bucket key", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          allowed: true,
          remaining: 4,
          reset_at: "2026-08-11T10:00:00.000Z"
        }
      ],
      error: null
    });

    const result = await consumeRateLimit({
      admin: { rpc } as unknown as SupabaseClient<Database>,
      key: "rsvp:demo:fp1_20260811_0123456789abcdef0123456789abcdef",
      limit: 5,
      windowMs: 60_000
    });

    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      bucket_key: "rsvp:demo:fp1_20260811_0123456789abcdef0123456789abcdef",
      max_hits: 5,
      window_seconds: 60
    });
    expect(result).toEqual({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.parse("2026-08-11T10:00:00.000Z")
    });
  });

  it("fails the policy set closed when the persistent backend is unavailable", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "offline" } });

    const result = await consumeRateLimitPolicies({
      admin: { rpc } as unknown as SupabaseClient<Database>,
      policies: [
        { name: "burst", key: "guest_publish:burst:fp1_test", limit: 3, windowMs: 60_000 },
        { name: "daily", key: "guest_publish:daily:fp1_test", limit: 25, windowMs: 86_400_000 }
      ]
    });

    expect(result).toEqual({
      ok: false,
      message: "rate_limit_backend_unavailable",
      policy: "burst"
    });
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
