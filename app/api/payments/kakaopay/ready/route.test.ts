import { vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  createServerSupabaseClientMock,
  requestKakaoPayReadyMock,
  generateApproveNonceMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  requestKakaoPayReadyMock: vi.fn(),
  generateApproveNonceMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/payments/kakaopay", () => ({
  getCheckoutPrice: () => ({
    amount: 4900,
    currency: "KRW",
    itemName: "InviteHub 초대장 발행"
  }),
  requestKakaoPayReady: requestKakaoPayReadyMock
}));

vi.mock("@/lib/payments/nonce", () => ({
  generateApproveNonce: generateApproveNonceMock
}));

import { POST } from "@/app/api/payments/kakaopay/ready/route";

function createRequest() {
  return new Request("https://invitehub.test/api/payments/kakaopay/ready", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      invitationId: "invitation-1",
      buyerName: "홍길동",
      buyerEmail: "hong@example.com",
      buyerPhone: "010-1234-5678"
    })
  });
}

function createServerClient(userId: string | null) {
  return {
    auth: {
      async getUser() {
        return {
          data: {
            user: userId ? { id: userId } : null
          }
        };
      }
    }
  };
}

function createAdminClient() {
  const insertedRows: unknown[] = [];

  return {
    insertedRows,
    client: {
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
                  user_id: "user-1",
                  title: "초대장"
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

        if (table === "payments") {
          return {
            insert(row: unknown) {
              insertedRows.push(row);
              return {
                select() {
                  return {
                    async single() {
                      return {
                        data: {
                          id: "payment-1",
                          provider_order_id: "order-1"
                        },
                        error: null
                      };
                    }
                  };
                }
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

        if (table === "payment_audit_logs") {
          return {
            insert() {
              return Promise.resolve({ error: null });
            }
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("POST /api/payments/kakaopay/ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateApproveNonceMock.mockReturnValue("a".repeat(64));
    requestKakaoPayReadyMock.mockResolvedValue({
      tid: "tid-1",
      next_redirect_pc_url: "https://pay.example/redirect"
    });
  });

  it("stores an approve nonce and forwards it in the approval URL", async () => {
    const adminDouble = createAdminClient();
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(adminDouble.insertedRows[0]).toMatchObject({
      approve_nonce: "a".repeat(64)
    });
    expect(requestKakaoPayReadyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalUrl: expect.stringContaining(`nonce=${"a".repeat(64)}`)
      })
    );
    expect(payload.redirectUrl).toBe("https://pay.example/redirect");
  });
});
