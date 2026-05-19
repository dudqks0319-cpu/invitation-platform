import { vi } from "vitest";

const { createSupabaseAdminClientMock, listUsersMock, createUserMock, rpcMock, insertSelectSingleMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  listUsersMock: vi.fn(),
  createUserMock: vi.fn(),
  rpcMock: vi.fn(),
  insertSelectSingleMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/public/guest-publish/route";

function createRequest(payload: Record<string, unknown>) {
  return new Request("https://invitehub.test/api/public/guest-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify({
      payload,
      website: ""
    })
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

const insertMock = vi.fn();

function createAdminDouble() {
  return {
    auth: {
      admin: {
        listUsers: listUsersMock,
        createUser: createUserMock
      }
    },
    rpc: rpcMock,
    from(table: string) {
      if (table !== "invitations") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        insert(payload: unknown) {
          insertMock(payload);
          return {
            select() {
              return {
                single: insertSelectSingleMock
              };
            }
          };
        }
      };
    }
  };
}

describe("POST /api/public/guest-publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SUPABASE_GUEST_PUBLISHER_USER_ID;
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble());
    listUsersMock.mockResolvedValue({
      data: { users: [{ id: "guest-user-1", email: "guest-publisher@invitehub.app" }] },
      error: null
    });
    createUserMock.mockResolvedValue({
      data: { user: { id: "guest-user-1" } },
      error: null
    });
    rpcMock.mockResolvedValue({
      data: [{ allowed: true, remaining: 9, reset_at: new Date(Date.now() + 60000).toISOString() }],
      error: null
    });
    insertSelectSingleMock.mockResolvedValue({
      data: { id: "inv-1" },
      error: null
    });
  });

  it("publishes a free guest invitation", async () => {
    const response = await POST(createRequest(createFreePayload()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.invitationId).toBe("inv-1");
  });

  it("uses a configured guest publisher user id without listing auth users", async () => {
    process.env.SUPABASE_GUEST_PUBLISHER_USER_ID = "00000000-0000-4000-8000-000000000001";

    const response = await POST(createRequest(createFreePayload()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(listUsersMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "00000000-0000-4000-8000-000000000001"
    }));
  });

  it("rejects an invalid configured guest publisher user id", async () => {
    process.env.SUPABASE_GUEST_PUBLISHER_USER_ID = "guest-publisher";

    const response = await POST(createRequest(createFreePayload()));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.message).toBe("게스트 발행 계정 설정이 올바르지 않습니다.");
    expect(listUsersMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("blocks guest publish when paid options are included", async () => {
    const response = await POST(
      createRequest({
        ...createFreePayload(),
        mainImageUrl: "https://example.com/main.jpg"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("유료 옵션");
  });
});
