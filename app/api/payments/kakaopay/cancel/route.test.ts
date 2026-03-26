import { vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  createServerSupabaseClientMock,
  requestKakaoPayCancelMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  requestKakaoPayCancelMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/payments/kakaopay", () => ({
  getCheckoutPrice: () => ({ amount: 30000 }),
  requestKakaoPayCancel: requestKakaoPayCancelMock
}));

import { POST } from "@/app/api/payments/kakaopay/cancel/route";

type PaymentStatus = "payment_pending" | "paid" | "payment_failed" | "refund_pending" | "refunded";

function createRequest(body: object) {
  return new Request("https://invitehub.test/api/payments/kakaopay/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function createAuthClient(userId: string | null) {
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

function createAdminDouble(options?: {
  paymentStatus?: PaymentStatus;
  providerTid?: string | null;
}) {
  const paymentStatus = options?.paymentStatus ?? "paid";
  const providerTid = options && "providerTid" in options ? options.providerTid : "tid-1";

  return {
    client: {
      from(table: string) {
        if (table === "payments") {
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
                  id: "payment-1",
                  invitation_id: "invitation-1",
                  user_id: "user-1",
                  amount: 30000,
                  provider_tid: providerTid,
                  status: paymentStatus
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

        if (table === "payment_audit_logs") {
          return {
            insert() {
              return Promise.resolve({ error: null });
            }
          };
        }

        if (table === "invitations") {
          return {
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
    }
  };
}

describe("POST /api/payments/kakaopay/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("user-1"));
    requestKakaoPayCancelMock.mockResolvedValue({ tid: "tid-1" });
  });

  it("rejects refund attempts for payments that are not paid", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ paymentStatus: "refunded" }).client
    );

    const response = await POST(createRequest({
      paymentId: "payment-1",
      reason: "duplicate"
    }));
    const result = await response.json();

    expect(response.status).toBe(409);
    expect(result).toEqual({
      success: false,
      message: "환불 가능한 결제 상태가 아닙니다."
    });
    expect(requestKakaoPayCancelMock).not.toHaveBeenCalled();
  });

  it("rejects refund attempts when provider tid is missing", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ providerTid: null }).client
    );

    const response = await POST(createRequest({
      paymentId: "payment-1",
      reason: "duplicate"
    }));
    const result = await response.json();

    expect(response.status).toBe(409);
    expect(result).toEqual({
      success: false,
      message: "환불 가능한 결제 상태가 아닙니다."
    });
    expect(requestKakaoPayCancelMock).not.toHaveBeenCalled();
  });
});
