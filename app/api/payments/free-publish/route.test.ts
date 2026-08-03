import { vi } from "vitest";

const {
  adminGetUserMock,
  consumeRateLimitsMock,
  createServerSupabaseClientMock,
  createSupabaseAdminClientMock,
  getClientIdentifierMock
} = vi.hoisted(() => ({
  adminGetUserMock: vi.fn(),
  consumeRateLimitsMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  getClientIdentifierMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: consumeRateLimitsMock,
  getClientIdentifier: getClientIdentifierMock
}));

import { POST } from "@/app/api/payments/free-publish/route";

function createRequest(invitationId = "invitation-1", accessToken = "") {
  return new Request("https://invitehub.test/api/payments/free-publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": "203.0.113.10",
      "Idempotency-Key": `free-publish:${invitationId}`,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify({ invitationId })
  });
}

function createTextRequest() {
  return new Request("https://invitehub.test/api/payments/free-publish", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "invitation-1"
  });
}

function createServerClient(userId: string | null, isAnonymous = false) {
  return {
    auth: {
      async getUser() {
        return { data: { user: userId ? { id: userId, is_anonymous: isAnonymous } : null } };
      }
    }
  };
}

function createAdminClient(pricey = false, status = "draft") {
  return {
    auth: {
      getUser: adminGetUserMock
    },
    from(table: string) {
      if (table === "invitations") {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return {
              data: {
                id: "invitation-1",
                slug: "invite-123",
                title: "초대장",
                user_id: "user-1",
                payload: pricey
                  ? { mainImageUrl: "https://example.com/a.jpg" }
                  : {},
                status
              },
              error: null
            };
          },
          update() {
            const query = {
              eq() {
                return query;
              },
              then(resolve: (value: { error: null }) => unknown) {
                return Promise.resolve(resolve({ error: null }));
              }
            };
            return query;
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };
}

describe("POST /api/payments/free-publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminGetUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null
    });
    getClientIdentifierMock.mockReturnValue("v1:fingerprint");
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
  });

  it("publishes when the current draft is free", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.slug).toBe("invite-123");
  });

  it("authenticates a mobile Bearer session before publishing", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient(null));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createRequest("invitation-1", "mobile-access-token"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(adminGetUserMock).toHaveBeenCalledWith("mobile-access-token");
  });

  it("fails closed when authentication returns a user together with an error", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient(null));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));
    adminGetUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: new Error("auth backend uncertain")
    });

    const response = await POST(createRequest("invitation-1", "mobile-access-token"));

    expect(response.status).toBe(401);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });

  it("blocks free publish when paid add-ons exist", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(true));

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("유료 항목");
  });

  it("does not republish a tombstoned account invitation", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false, "deletion_pending"));

    const response = await POST(createRequest());
    expect(response.status).toBe(404);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });

  it("does not let anonymous sessions bypass the guest publish boundary", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("anonymous-user", true));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createRequest());

    expect(response.status).toBe(403);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });

  it("rejects non-json publish requests", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createTextRequest());
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.message).toContain("JSON");
  });

  it("fails closed before publishing when durable quota state is unavailable", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));
    consumeRateLimitsMock.mockResolvedValueOnce({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(503);
  });
});
