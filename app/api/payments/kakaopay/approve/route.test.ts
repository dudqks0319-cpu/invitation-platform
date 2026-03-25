import { vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  createServerSupabaseClientMock,
  requestKakaoPayApproveMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  requestKakaoPayApproveMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/payments/kakaopay", () => ({
  requestKakaoPayApprove: requestKakaoPayApproveMock
}));

import { GET } from "@/app/api/payments/kakaopay/approve/route";

type PaymentStatus = "payment_pending" | "paid" | "payment_failed";

function createRequest(extraQuery = "") {
  return new Request(`https://invitehub.test/api/payments/kakaopay/approve?paymentId=payment-1&pg_token=pg-token${extraQuery}`);
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
  paymentUserId?: string;
  invitationUserId?: string;
  paymentStatus?: PaymentStatus;
  approveNonce?: string | null;
  nonceUsedAt?: string | null;
  createdAt?: string;
}) {
  const paymentStatus = options?.paymentStatus ?? "payment_pending";
  const paymentUserId = options?.paymentUserId ?? "user-1";
  const invitationUserId = options?.invitationUserId ?? paymentUserId;
  const approveNonce = options?.approveNonce ?? "a".repeat(64);
  const nonceUsedAt = options?.nonceUsedAt ?? null;
  const createdAt = options?.createdAt ?? new Date().toISOString();

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
                  user_id: paymentUserId,
                  provider_order_id: "order-1",
                  provider_tid: "tid-1",
                  status: paymentStatus,
                  approve_nonce: approveNonce,
                  nonce_used_at: nonceUsedAt,
                  created_at: createdAt
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
                  user_id: invitationUserId,
                  payload: {},
                  slug: "demo-card"
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

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("GET /api/payments/kakaopay/approve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestKakaoPayApproveMock.mockResolvedValue({
      tid: "tid-1",
      approved_at: "2026-03-26T00:00:00.000Z"
    });
  });

  it("rejects the callback when the authenticated user does not own the payment", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("intruder"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await GET(createRequest());

    expect(response.headers.get("location")).toBe("https://invitehub.test/checkout?payment=failed");
    expect(requestKakaoPayApproveMock).not.toHaveBeenCalled();
  });

  it("rejects callbacks for payments that are no longer pending", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ paymentStatus: "paid" }).client
    );

    const response = await GET(createRequest());

    expect(response.headers.get("location")).toBe("https://invitehub.test/checkout?payment=failed");
    expect(requestKakaoPayApproveMock).not.toHaveBeenCalled();
  });

  it("rejects the callback when the invitation owner and payment owner diverge", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ paymentUserId: "user-1", invitationUserId: "user-2" }).client
    );

    const response = await GET(createRequest());

    expect(response.headers.get("location")).toBe("https://invitehub.test/checkout?payment=failed");
    expect(requestKakaoPayApproveMock).not.toHaveBeenCalled();
  });

  it("rejects the callback when the nonce is mismatched", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ approveNonce: "b".repeat(64) }).client
    );

    const response = await GET(createRequest(`&nonce=${"a".repeat(64)}`));

    expect(response.headers.get("location")).toContain("payment=failed");
    expect(requestKakaoPayApproveMock).not.toHaveBeenCalled();
  });

  it("rejects the callback when the nonce was already used", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ nonceUsedAt: new Date().toISOString() }).client
    );

    const response = await GET(createRequest(`&nonce=${"a".repeat(64)}`));

    expect(response.headers.get("location")).toContain("payment=failed");
    expect(requestKakaoPayApproveMock).not.toHaveBeenCalled();
  });

  it("rejects expired nonces", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createAuthClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ createdAt: new Date(Date.now() - 31 * 60 * 1000).toISOString() }).client
    );

    const response = await GET(createRequest(`&nonce=${"a".repeat(64)}`));

    expect(response.headers.get("location")).toContain("payment=failed");
    expect(requestKakaoPayApproveMock).not.toHaveBeenCalled();
  });
});
