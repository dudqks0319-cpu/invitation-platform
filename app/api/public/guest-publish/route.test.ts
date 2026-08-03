import { vi } from "vitest";

const {
  authGetUserMock,
  consumeRateLimitsMock,
  createSupabaseAdminClientMock,
  existingInvitationMock,
  getClientIdentifierMock,
  insertMock,
  insertSelectSingleMock
} = vi.hoisted(() => ({
  authGetUserMock: vi.fn(),
  consumeRateLimitsMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  existingInvitationMock: vi.fn(),
  getClientIdentifierMock: vi.fn(),
  insertMock: vi.fn(),
  insertSelectSingleMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: consumeRateLimitsMock,
  getClientIdentifier: getClientIdentifierMock
}));

import { POST } from "@/app/api/public/guest-publish/route";

function createRequest(
  payload: Record<string, unknown>,
  options: { accessToken?: string; idempotencyKey?: string } = {}
) {
  const accessToken = options.accessToken ?? "anonymous-access-token";
  const idempotencyKey = options.idempotencyKey ?? "guest-publish:draft-12345678";

  return new Request("https://invitehub.test/api/public/guest-publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": "203.0.113.10",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify({ payload, website: "" })
  });
}

function createFreePayload() {
  return {
    title: "결혼식 초대장",
    eventDateTime: "2026-05-10T14:00",
    venueName: "더파인 웨딩홀",
    venueAddress: "서울 강남구 테헤란로 123",
    groomName: "민준",
    brideName: "수아",
    templateId: "wedding-classic",
    category: "wedding"
  };
}

function createAdminDouble() {
  const query = {
    select() {
      return query;
    },
    eq() {
      return query;
    },
    maybeSingle: existingInvitationMock,
    insert(payload: unknown) {
      insertMock(payload);
      return {
        select() {
          return { single: insertSelectSingleMock };
        }
      };
    }
  };

  return {
    auth: { getUser: authGetUserMock },
    from(table: string) {
      if (table !== "invitations") {
        throw new Error(`Unexpected table: ${table}`);
      }
      return query;
    }
  };
}

describe("POST /api/public/guest-publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble());
    authGetUserMock.mockResolvedValue({
      data: { user: { id: "anonymous-user-1", is_anonymous: true } },
      error: null
    });
    getClientIdentifierMock.mockReturnValue("v1:fingerprint");
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    existingInvitationMock.mockResolvedValue({ data: null, error: null });
    insertSelectSingleMock.mockResolvedValue({
      data: { id: "inv-1", slug: "invite-123" },
      error: null
    });
  });

  it("binds a free guest invitation to the verified anonymous user", async () => {
    const response = await POST(createRequest({
      ...createFreePayload(),
      shareUrl: "invite-123"
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(authGetUserMock).toHaveBeenCalledWith("anonymous-access-token");
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "anonymous-user-1",
      guest_publish_idempotency_key_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      guest_publish_request_hash: expect.stringMatching(/^[a-f0-9]{64}$/)
    }));
    expect(JSON.stringify(insertMock.mock.calls[0]?.[0])).not.toContain("anonymous-access-token");
    expect(payload).toEqual({ success: true, invitationId: "inv-1", slug: "invite-123" });
    expect(consumeRateLimitsMock).toHaveBeenCalledWith(expect.objectContaining({
      policies: expect.arrayContaining([
        expect.objectContaining({ key: "guest_publish:user:anonymous-user-1:burst" }),
        expect.objectContaining({ key: "guest_publish:client:v1:fingerprint:daily" }),
        expect.objectContaining({ key: "guest_publish:global:daily" })
      ])
    }));
  });

  it("fails closed without an authenticated anonymous session", async () => {
    const noToken = await POST(createRequest(createFreePayload(), { accessToken: "" }));
    expect(noToken.status).toBe(401);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();

    authGetUserMock.mockResolvedValueOnce({
      data: { user: { id: "full-user-1", is_anonymous: false } },
      error: null
    });
    const fullAccount = await POST(createRequest(createFreePayload()));
    expect(fullAccount.status).toBe(403);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("requires a bounded idempotency key before any durable work", async () => {
    const response = await POST(createRequest(createFreePayload(), { idempotencyKey: "" }));

    expect(response.status).toBe(400);
    expect(authGetUserMock).not.toHaveBeenCalled();
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects non-object JSON without invoking auth or storage", async () => {
    const response = await POST(new Request(
      "https://invitehub.test/api/public/guest-publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer anonymous-access-token",
          "Idempotency-Key": "guest-publish:draft-12345678",
          "x-real-ip": "203.0.113.10"
        },
        body: "null"
      }
    ));

    expect(response.status).toBe(400);
    expect(authGetUserMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects an idempotency key reused with different publish content", async () => {
    existingInvitationMock.mockResolvedValueOnce({
      data: {
        id: "inv-existing",
        slug: "invite-123",
        guest_publish_request_hash: expect.anything()
      },
      error: null
    });

    const firstAttempt = await POST(createRequest({
      ...createFreePayload(),
      shareUrl: "invite-123"
    }));

    expect(firstAttempt.status).toBe(409);
    expect(consumeRateLimitsMock).toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("returns the same guest-owned invitation for a matching replay", async () => {
    const requestPayload = {
      ...createFreePayload(),
      shareUrl: "invite-123"
    };
    const firstResponse = await POST(createRequest(requestPayload));
    expect(firstResponse.status).toBe(200);

    const inserted = insertMock.mock.calls[0]?.[0] as {
      guest_publish_request_hash: string;
    };
    existingInvitationMock.mockResolvedValueOnce({
      data: {
        id: "inv-1",
        slug: "invite-123",
        guest_publish_request_hash: inserted.guest_publish_request_hash
      },
      error: null
    });
    consumeRateLimitsMock.mockClear();
    insertMock.mockClear();

    const replayResponse = await POST(createRequest(requestPayload));
    await expect(replayResponse.json()).resolves.toEqual({
      success: true,
      invitationId: "inv-1",
      slug: "invite-123"
    });
    expect(consumeRateLimitsMock).toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects paid payloads before auth, quota, or storage work", async () => {
    const response = await POST(createRequest({
      ...createFreePayload(),
      mainImageUrl: "https://example.com/main.jpg"
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("유료 옵션");
    expect(authGetUserMock).not.toHaveBeenCalled();
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("fails closed when the durable quota backend is unavailable", async () => {
    consumeRateLimitsMock.mockResolvedValueOnce({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    const response = await POST(createRequest(createFreePayload()));

    expect(response.status).toBe(503);
    expect(insertMock).not.toHaveBeenCalled();
  });
});
