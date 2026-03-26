import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";

describe("rate limit helpers", () => {
  it("prefers trusted platform headers before x-forwarded-for", () => {
    const request = new Request("https://invitehub.test/api/public/demo/rsvp", {
      headers: {
        "x-real-ip": "203.0.113.20",
        "x-forwarded-for": "198.51.100.10, 198.51.100.11"
      }
    });

    expect(getClientIdentifier(request)).toBe("203.0.113.20");
  });

  it("falls back to x-forwarded-for only when no trusted header is present", () => {
    const request = new Request("https://invitehub.test/api/public/demo/rsvp", {
      headers: {
        "x-forwarded-for": "198.51.100.10, 198.51.100.11"
      }
    });

    expect(getClientIdentifier(request)).toBe("198.51.100.10");
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
      key: "rsvp:demo:203.0.113.20",
      limit: 5,
      windowMs: 60_000
    });

    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      bucket_key: "rsvp:demo:203.0.113.20",
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
});
