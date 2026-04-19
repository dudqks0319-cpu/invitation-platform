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
        insert() {
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
    const response = await POST(
      createRequest({
        title: "결혼식 초대장",
        eventDateTime: "2026-05-10T14:00",
        venueName: "더파인 웨딩홀",
        venueAddress: "서울 강남구 테헤란로 123",
        groomName: "민준",
        brideName: "수아",
        templateId: "wedding-classic",
        category: "wedding"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.invitationId).toBe("inv-1");
  });

  it("blocks guest publish when paid options are included", async () => {
    const response = await POST(
      createRequest({
        title: "결혼식 초대장",
        eventDateTime: "2026-05-10T14:00",
        venueName: "더파인 웨딩홀",
        venueAddress: "서울 강남구 테헤란로 123",
        groomName: "민준",
        brideName: "수아",
        templateId: "wedding-classic",
        category: "wedding",
        mainImageUrl: "https://example.com/main.jpg"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("유료 옵션");
  });
});
