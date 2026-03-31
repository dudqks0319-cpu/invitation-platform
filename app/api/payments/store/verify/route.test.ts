import { vi } from "vitest";

const {
  isAppleStoreVerificationEnabledMock,
  isGooglePlayVerificationEnabledMock,
  verifyAppleTransactionMock,
  verifyGooglePlayPurchaseMock
} = vi.hoisted(() => ({
  isAppleStoreVerificationEnabledMock: vi.fn(),
  isGooglePlayVerificationEnabledMock: vi.fn(),
  verifyAppleTransactionMock: vi.fn(),
  verifyGooglePlayPurchaseMock: vi.fn()
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

function createRequest(body: Record<string, unknown>) {
  return new Request("https://invitehub.test/api/payments/store/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("POST /api/payments/store/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAppleStoreVerificationEnabledMock.mockReturnValue(false);
    isGooglePlayVerificationEnabledMock.mockReturnValue(false);
    verifyAppleTransactionMock.mockResolvedValue({
      transactionId: "tx-1",
      productId: "publish.credit.ios"
    });
    verifyGooglePlayPurchaseMock.mockResolvedValue({
      purchaseToken: "purchase-token",
      productId: "publish.credit.android"
    });
  });

  it("requires provider and product id", async () => {
    const response = await POST(createRequest({}));
    expect(response.status).toBe(400);
  });

  it("blocks apple verification when server config is missing", async () => {
    const response = await POST(
      createRequest({
        provider: "apple_iap",
        productId: "publish.credit.ios",
        transactionId: "tx-1"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.message).toContain("Apple 영수증 검증 서버 설정");
  });

  it("blocks google verification when server config is missing", async () => {
    const response = await POST(
      createRequest({
        provider: "google_play",
        productId: "publish.credit.android",
        purchaseToken: "purchase-token"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.message).toContain("Google Play 영수증 검증 서버 설정");
  });

  it("verifies apple transactions when server config is present", async () => {
    isAppleStoreVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        provider: "apple_iap",
        productId: "publish.credit.ios",
        transactionId: "tx-1",
        environment: "sandbox"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(verifyAppleTransactionMock).toHaveBeenCalledWith({
      transactionId: "tx-1",
      productId: "publish.credit.ios",
      environment: "sandbox"
    });
    expect(payload.success).toBe(true);
  });

  it("verifies google play purchases when server config is present", async () => {
    isGooglePlayVerificationEnabledMock.mockReturnValue(true);

    const response = await POST(
      createRequest({
        provider: "google_play",
        productId: "publish.credit.android",
        purchaseToken: "purchase-token"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(verifyGooglePlayPurchaseMock).toHaveBeenCalledWith({
      productId: "publish.credit.android",
      purchaseToken: "purchase-token"
    });
    expect(payload.success).toBe(true);
  });
});
