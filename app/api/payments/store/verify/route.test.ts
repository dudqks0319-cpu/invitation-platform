import { vi } from "vitest";

const {
  createClientMock,
  createSupabaseAdminClientMock,
  isAppleStoreVerificationEnabledMock,
  isGooglePlayVerificationEnabledMock,
  verifyAppleTransactionMock,
  verifyGooglePlayPurchaseMock
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  isAppleStoreVerificationEnabledMock: vi.fn(),
  isGooglePlayVerificationEnabledMock: vi.fn(),
  verifyAppleTransactionMock: vi.fn(),
  verifyGooglePlayPurchaseMock: vi.fn()
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/env", () => ({
  isAppleStoreVerificationEnabled: isAppleStoreVerificationEnabledMock,
  isGooglePlayVerificationEnabled: isGooglePlayVerificationEnabledMock
}));

vi.mock("@/lib/payments/apple-store", () => ({
  verifyAppleTransaction: verifyAppleTransactionMock
}));

vi.mock("@/lib/payments/google-play", () => ({
  verifyGooglePlayPurchase: verifyGooglePlayPurchaseMock
}));

import { POST } from "@/app/api/payments/store/verify/route";

function createRequest(body: Record<string, unknown>, accessToken = "access-token") {
  return new Request("https://invitehub.test/api/payments/store/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify(body)
  });
}

function createTextRequest(accessToken = "access-token") {
  return new Request("https://invitehub.test/api/payments/store/verify", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: "not-json"
  });
}

function createAuthClient(userId: string | null) {
  return {
    auth: {
      async getUser(token: string) {
        if (!token || !userId) {
          return { data: { user: null }, error: new Error("invalid session") };
        }

        return {
          data: {
            user: {
              id: userId,
              email: `${userId}@invitehub.test`
            }
          },
          error: null
        };
      }
    }
  };
}

function createAdminDouble(options?: {
  existingPayment?: boolean;
  invitationUserId?: string;
  pricey?: boolean;
}) {
  const state = {
    paymentInserts: [] as Array<Record<string, unknown>>,
    invitationUpdates: [] as Array<Record<string, unknown>>,
    auditInserts: [] as Array<Record<string, unknown>>
  };

  const invitationUserId = options?.invitationUserId ?? "user-1";
  const pricey = options?.pricey ?? true;
  const existingPayment = options?.existingPayment ?? false;

  const client = {
    from(table: string) {
      if (table === "invitations") {
        const filters = new Map<string, unknown>();

        return {
          select() {
            return this;
          },
          eq(column: string, value: unknown) {
            filters.set(column, value);
            return this;
          },
          async maybeSingle() {
            if (
              (filters.has("id") && filters.get("id") !== "invitation-1") ||
              (filters.has("user_id") && filters.get("user_id") !== invitationUserId)
            ) {
              return {
                data: null,
                error: null
              };
            }

            return {
              data: {
                id: "invitation-1",
                slug: "invite-123",
                title: "초대장",
                user_id: invitationUserId,
                payload: pricey
                  ? { mainImageUrl: "https://example.com/main.jpg" }
                  : {},
                status: "draft"
              },
              error: null
            };
          },
          update(payload: Record<string, unknown>) {
            state.invitationUpdates.push(payload);
            return {
              eq() {
                return Promise.resolve({ error: null });
              }
            };
          }
        };
      }

      if (table === "payments") {
        const filters = new Map<string, unknown>();

        return {
          select() {
            return this;
          },
          eq(column: string, value: unknown) {
            filters.set(column, value);
            return this;
          },
          async maybeSingle() {
            if (existingPayment && filters.get("provider_order_id") === "apple_iap:tx-1") {
              return {
                data: {
                  id: "payment-existing",
                  invitation_id: "invitation-1",
                  user_id: invitationUserId,
                  provider_order_id: "apple_iap:tx-1"
                },
                error: null
              };
            }

            return {
              data: null,
              error: null
            };
          },
          insert(payload: Record<string, unknown>) {
            state.paymentInserts.push(payload);
            return {
              select() {
                return this;
              },
              async single() {
                return {
                  data: {
                    id: "payment-1",
                    ...payload
                  },
                  error: null
                };
              }
            };
          }
        };
      }

      if (table === "payment_audit_logs") {
        return {
          insert(payload: Record<string, unknown>) {
            state.auditInserts.push(payload);
            return Promise.resolve({ error: null });
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };

  return {
    client,
    state
  };
}

describe("POST /api/payments/store/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockReturnValue(createAuthClient("user-1"));
    isAppleStoreVerificationEnabledMock.mockReturnValue(false);
    isGooglePlayVerificationEnabledMock.mockReturnValue(false);
    verifyAppleTransactionMock.mockResolvedValue({
      transactionId: "tx-1",
      productId: "publish.credit.ios"
    });
    verifyGooglePlayPurchaseMock.mockResolvedValue({
      orderId: "order-1",
      purchaseToken: "purchase-token",
      productId: "publish.credit.android",
      purchaseState: 0
    });
  });

  it("requires an access token", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(
      createRequest(
        {
          invitationId: "invitation-1",
          provider: "apple_iap",
          productId: "publish.credit.ios",
          transactionId: "tx-1"
        },
        ""
      )
    );

    expect(response.status).toBe(401);
  });

  it("blocks store verification when user photos are free", async () => {
    const admin = createAdminDouble();
    createSupabaseAdminClientMock.mockReturnValue(admin.client);
    isAppleStoreVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        invitationId: "invitation-1",
        provider: "apple_iap",
        productId: "publish.credit.ios",
        transactionId: "tx-1",
        environment: "sandbox"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("무료 구성");
    expect(verifyAppleTransactionMock).not.toHaveBeenCalled();
    expect(admin.state.paymentInserts).toHaveLength(0);
    expect(admin.state.invitationUpdates).toHaveLength(0);
    expect(payload).toEqual(
      expect.objectContaining({
        success: false
      })
    );
  });

  it("rejects verification when the invitation does not belong to the caller", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ invitationUserId: "someone-else" }).client
    );
    isGooglePlayVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        invitationId: "invitation-1",
        provider: "google_play",
        productId: "publish.credit.android",
        purchaseToken: "purchase-token"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.message).toContain("초대장");
  });

  it("blocks store publish when the invitation is already free", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ pricey: false }).client
    );
    isGooglePlayVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        invitationId: "invitation-1",
        provider: "google_play",
        productId: "publish.credit.android",
        purchaseToken: "purchase-token"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("무료");
  });

  it("rejects unapproved product ids before verification completes", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);
    isAppleStoreVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        invitationId: "invitation-1",
        provider: "apple_iap",
        productId: "unexpected.product",
        transactionId: "tx-1"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("상품");
    expect(verifyAppleTransactionMock).not.toHaveBeenCalled();
  });

  it("rejects non-json verification requests", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createTextRequest());
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.message).toContain("JSON");
  });

  it("rejects malformed verification payloads before store calls", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);
    isAppleStoreVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        invitationId: "invitation-1",
        provider: "apple_iap"
      })
    );

    expect(response.status).toBe(400);
    expect(verifyAppleTransactionMock).not.toHaveBeenCalled();
  });

  it("does not reuse store payments for invitations now covered by free publish", async () => {
    const admin = createAdminDouble({ existingPayment: true });
    createSupabaseAdminClientMock.mockReturnValue(admin.client);
    isAppleStoreVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        invitationId: "invitation-1",
        provider: "apple_iap",
        productId: "publish.credit.ios",
        transactionId: "tx-1",
        environment: "sandbox"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("무료 구성");
    expect(admin.state.paymentInserts).toHaveLength(0);
    expect(payload.success).toBe(false);
  });
});
