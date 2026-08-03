import { vi } from "vitest";

const {
  consumeRateLimitsMock,
  createSignedUrlMock,
  createSupabaseAdminClientMock,
  getClientIdentifierMock,
  getPrivacySafeIdentifierMock
} = vi.hoisted(() => ({
  consumeRateLimitsMock: vi.fn(),
  createSignedUrlMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  getClientIdentifierMock: vi.fn(),
  getPrivacySafeIdentifierMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: consumeRateLimitsMock,
  getClientIdentifier: getClientIdentifierMock,
  getPrivacySafeIdentifier: getPrivacySafeIdentifierMock
}));

import { GET } from "@/app/api/public/assets/route";
import { INVITATION_ASSET_PUBLIC_TTL_SECONDS } from "@/lib/invitation-assets";

const ownerId = "11111111-1111-4111-8111-111111111111";
const digest = "a".repeat(64);
const path = `${ownerId}/${digest}.jpg`;

function createAdminDouble(payloadPath = path, invitationOwner = ownerId) {
  return {
    from(table: string) {
      if (table !== "invitations") throw new Error(`Unexpected table: ${table}`);
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: "22222222-2222-4222-8222-222222222222",
            user_id: invitationOwner,
            payload: { mainImagePath: payloadPath }
          },
          error: null
        })
      };
    },
    storage: {
      from() {
        return { createSignedUrl: createSignedUrlMock };
      }
    }
  };
}

function request(query = `slug=invite-123&path=${encodeURIComponent(path)}`) {
  return new Request(`https://invitehub.test/api/public/assets?${query}`, {
    headers: { "x-real-ip": "203.0.113.10" }
  });
}

describe("GET /api/public/assets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INVITATION_ASSET_ACCESS_ENABLED = "true";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble());
    getClientIdentifierMock.mockReturnValue("v1:client");
    getPrivacySafeIdentifierMock.mockImplementation((namespace: string) => `v1:${namespace}`);
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60_000
    });
    createSignedUrlMock.mockResolvedValue({
      data: { signedUrl: "https://example.supabase.co/storage/v1/object/sign/invitation-assets/file?token=test" },
      error: null
    });
  });

  afterEach(() => {
    delete process.env.INVITATION_ASSET_ACCESS_ENABLED;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("redirects one owner-bound published asset with a short TTL and redacted quotas", async () => {
    const response = await GET(request());

    expect(response.status).toBe(307);
    expect(createSignedUrlMock).toHaveBeenCalledWith(path, INVITATION_ASSET_PUBLIC_TTL_SECONDS);
    expect(consumeRateLimitsMock).toHaveBeenCalledWith(expect.objectContaining({
      policies: expect.arrayContaining([
        expect.objectContaining({ key: "public_asset:client:v1:client:burst" }),
        expect.objectContaining({ key: "public_asset:slug:v1:public_asset_slug:daily" }),
        expect.objectContaining({ key: "public_asset:global:daily", limit: 1_000 })
      ])
    }));
    expect(JSON.stringify(consumeRateLimitsMock.mock.calls)).not.toContain("invite-123");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("is disabled by default before database or provider work", async () => {
    delete process.env.INVITATION_ASSET_ACCESS_ENABLED;
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });

  it("rejects traversal, another owner's object, repeated parameters, and transform requests", async () => {
    const traversal = `${ownerId}/../${"b".repeat(64)}.jpg`;
    createSupabaseAdminClientMock.mockReturnValueOnce(createAdminDouble(traversal));
    expect((await GET(request(`slug=invite-123&path=${encodeURIComponent(traversal)}`))).status).toBe(400);

    const otherPath = `33333333-3333-4333-8333-333333333333/${digest}.jpg`;
    createSupabaseAdminClientMock.mockReturnValueOnce(createAdminDouble(otherPath));
    expect((await GET(request(`slug=invite-123&path=${encodeURIComponent(otherPath)}`))).status).toBe(404);

    expect((await GET(request(`slug=invite-123&slug=again&path=${encodeURIComponent(path)}`))).status).toBe(400);
    expect((await GET(request(`slug=invite-123&path=${encodeURIComponent(path)}&width=400`))).status).toBe(400);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });

  it("fails closed on quota uncertainty or exhaustion before signing", async () => {
    consumeRateLimitsMock.mockResolvedValueOnce({ ok: false, message: "quota unavailable" });
    expect((await GET(request())).status).toBe(503);
    expect(createSignedUrlMock).not.toHaveBeenCalled();

    consumeRateLimitsMock.mockResolvedValueOnce({
      ok: true,
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000
    });
    expect((await GET(request())).status).toBe(429);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });

  it("rejects a signed redirect outside the configured Storage origin", async () => {
    createSignedUrlMock.mockResolvedValueOnce({
      data: { signedUrl: "https://evil.example/signed" },
      error: null
    });
    expect((await GET(request())).status).toBe(503);
  });

  it("fails closed when the invitation lookup stalls", async () => {
    createSupabaseAdminClientMock.mockReturnValueOnce({
      ...createAdminDouble(),
      from: () => ({
        select() { return this; },
        eq() { return this; },
        maybeSingle: () => new Promise(() => undefined)
      })
    });
    vi.useFakeTimers();
    const responsePromise = GET(request());
    await vi.advanceTimersByTimeAsync(751);
    const response = await responsePromise;
    vi.useRealTimers();
    expect(response.status).toBe(503);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });
});
