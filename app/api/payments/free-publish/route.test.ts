import { vi } from "vitest";

const { createClientMock, createServerSupabaseClientMock, createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/payments/free-publish/route";

function createRequest(invitationId = "invitation-1", headers: Record<string, string> = {}) {
  return new Request("https://invitehub.test/api/payments/free-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
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

function createServerClient(userId: string | null) {
  return {
    auth: {
      async getUser() {
        return { data: { user: userId ? { id: userId } : null } };
      }
    }
  };
}

const validPublishPayload = {
  title: "민준 수아 결혼식 초대장",
  eventDateTime: "2026-05-10T14:00",
  venueName: "더파인 웨딩홀",
  venueAddress: "서울 강남구 논현로 456",
  groomName: "민준",
  brideName: "수아"
};

function createAdminClient(pricey = false, payloadOverride: Record<string, unknown> = {}) {
  return {
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
                  ? { ...validPublishPayload, mainImageUrl: "https://example.com/a.jpg", ...payloadOverride }
                  : { ...validPublishPayload, ...payloadOverride },
                status: "draft"
              },
              error: null
            };
          },
          update() {
            return {
              eq() {
                return Promise.resolve({ error: null });
              }
            };
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
    createClientMock.mockReturnValue({
      auth: {
        async getUser() {
          return { data: { user: null }, error: null };
        }
      }
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

  it("rejects cross-origin browser publish requests before auth work", async () => {
    const response = await POST(
      createRequest("invitation-1", {
        host: "invitehub.test",
        origin: "https://evil.test"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.message).toContain("허용되지 않은 요청");
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("accepts mobile bearer sessions when cookie auth is unavailable", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.test";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    createServerSupabaseClientMock.mockResolvedValue(createServerClient(null));
    createClientMock.mockReturnValue({
      auth: {
        async getUser(token: string) {
          expect(token).toBe("mobile-token");
          return { data: { user: { id: "user-1" } }, error: null };
        }
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createRequest("invitation-1", { Authorization: "Bearer mobile-token" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(createClientMock).toHaveBeenCalledWith(
      "https://supabase.test",
      "anon-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: false
        })
      })
    );
  });

  it("blocks free publish when paid add-ons exist", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(true));

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("유료 항목");
  });

  it("rejects free publish when required public fields are empty", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminClient(false, {
        title: "",
        eventDateTime: "",
        venueName: "",
        venueAddress: "",
        groomName: "",
        brideName: ""
      })
    );

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("공개 전 입력");
    expect(payload.message).toContain("초대장 제목");
    expect(payload.message).toContain("신부 이름");
  });

  it("rejects free publish when normalized demo placeholder values remain", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminClient(false, {
        title: "결혼식 초대장",
        eventDateTime: "2026-04-12T14:00",
        venueName: "서울 더파인 웨딩홀",
        venueAddress: "서울 강남구 테헤란로 123",
        groomName: "홍길동",
        brideName: "김부인"
      })
    );

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("공개 전 입력");
    expect(payload.message).toContain("예식장 주소");
  });

  it("rejects non-json publish requests", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createTextRequest());
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.message).toContain("JSON");
  });
});
