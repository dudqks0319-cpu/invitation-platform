import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/payments/revenuecat/webhook/route";

function createRequest(body: Record<string, unknown>, token = "webhook-token") {
  return new Request("https://invitehub.test/api/payments/revenuecat/webhook", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function createTextRequest(token = "webhook-token") {
  return new Request("https://invitehub.test/api/payments/revenuecat/webhook", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain"
    },
    body: "not-json"
  });
}

describe("POST /api/payments/revenuecat/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN = "webhook-token";
  });

  it("grants a publish credit for a RevenueCat non-renewing purchase", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.publish.credit",
          purchased_at_ms: 1779858000000,
          store: "APP_STORE",
          transaction_id: "tx-1",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(payload).toEqual({ success: true, granted: true });
    expect(rpc).toHaveBeenCalledWith("grant_publish_credit", expect.objectContaining({
      p_entitlement: "publish_credit",
      p_platform: "ios",
      p_product_id: "com.invitehub.publish.credit",
      p_quantity: 1,
      p_transaction_id: "tx-1",
      p_user_id: "00000000-0000-4000-8000-000000000001"
    }));
  });

  it("grants an Android publish credit only from the Play Store", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "publish.credit.android",
          purchased_at_ms: 1779858000000,
          store: "PLAY_STORE",
          transaction_id: "gpa-1",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("grant_publish_credit", expect.objectContaining({
      p_platform: "android",
      p_product_id: "publish.credit.android",
      p_transaction_id: "gpa-1"
    }));
  });

  it("does not grant publish credits for subscription-style initial purchase events", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.publish.credit",
          store: "APP_STORE",
          transaction_id: "tx-initial",
          type: "INITIAL_PURCHASE"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true, ignored: true });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects webhooks without the shared bearer token", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(createRequest({ event: {} }, "wrong-token"));

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects webhooks when the shared token is not configured", async () => {
    const rpc = vi.fn();
    delete process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(createRequest({ event: { type: "TEST" } }));

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects non-json webhook requests before creating the service-role client", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(createTextRequest());

    expect(response.status).toBe(415);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects oversized webhook bodies before creating the service-role client", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(createRequest({
      event: { type: "TEST" },
      padding: "x".repeat(90 * 1024)
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, message: "요청 본문이 너무 큽니다." });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects purchase events for unknown store product ids", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.unknown",
          store: "APP_STORE",
          transaction_id: "tx-unknown",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects purchase events from non-IAP RevenueCat stores", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.publish.credit",
          store: "STRIPE",
          transaction_id: "stripe-1",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, message: "지원하지 않는 RevenueCat store입니다." });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects purchase events without a store because the IAP platform cannot be proven", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.publish.credit",
          transaction_id: "missing-store-1",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects incomplete purchase events before creating the service-role client", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          store: "APP_STORE",
          transaction_id: "missing-user-1",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects purchase events that only include the RevenueCat event id", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          id: "event-id-is-not-a-store-transaction",
          product_id: "com.invitehub.publish.credit",
          store: "APP_STORE",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, message: "RevenueCat transaction_id가 필요합니다." });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["negative", -1],
    ["out-of-range", 8_640_000_000_000_001]
  ])("rejects %s purchase timestamps before creating the service-role client", async (_label, purchasedAtMs) => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.publish.credit",
          purchased_at_ms: purchasedAtMs,
          store: "APP_STORE",
          transaction_id: "bad-time-1",
          type: "NON_RENEWING_PURCHASE"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("accepts RevenueCat dashboard test events without granting credits", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(createRequest({ event: { type: "TEST" } }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(payload).toEqual({ success: true, test: true });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("ignores non-credit RevenueCat events without creating the service-role client", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          id: "event-1",
          type: "CUSTOMER_INFO_UPDATE"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(payload).toEqual({ success: true, ignored: true });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("revokes unused credits for RevenueCat cancellation events", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          app_user_id: "00000000-0000-4000-8000-000000000001",
          product_id: "com.invitehub.publish.credit",
          store: "APP_STORE",
          transaction_id: "tx-1",
          type: "CANCELLATION"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.revokedQuantity).toBe(1);
    expect(rpc).toHaveBeenCalledWith("revoke_publish_credit", expect.objectContaining({
      p_transaction_id: "tx-1"
    }));
  });

  it("revokes by transaction id even when cancellation events omit purchase metadata", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          store: "APP_STORE",
          transaction_id: "tx-1",
          type: "CANCELLATION"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("revoke_publish_credit", expect.objectContaining({
      p_transaction_id: "tx-1"
    }));
  });

  it("revokes by transaction id when cancellation events include product id but omit store", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          product_id: "com.invitehub.publish.credit",
          transaction_id: "tx-1",
          type: "CANCELLATION"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("revoke_publish_credit", expect.objectContaining({
      p_transaction_id: "tx-1"
    }));
  });

  it("rejects cancellation events with unknown product ids even when store is omitted", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          product_id: "com.invitehub.unknown",
          transaction_id: "tx-unknown-product",
          type: "CANCELLATION"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, message: "허용되지 않은 RevenueCat 상품입니다." });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects cancellation events from unsupported stores before creating the service-role client", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          product_id: "com.invitehub.publish.credit",
          store: "STRIPE",
          transaction_id: "tx-1",
          type: "CANCELLATION"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects cancellation events that only include the RevenueCat event id", async () => {
    const rpc = vi.fn();
    createSupabaseAdminClientMock.mockReturnValue({ rpc });

    const response = await POST(
      createRequest({
        event: {
          id: "cancel-event-id-is-not-a-store-transaction",
          type: "CANCELLATION"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, message: "RevenueCat transaction_id가 필요합니다." });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
