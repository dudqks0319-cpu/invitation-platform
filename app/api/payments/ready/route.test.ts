import { vi } from "vitest";

const { kakaoPayReadyMock, isKakaoPayEnabledMock, isPortOneEnabledMock } = vi.hoisted(() => ({
  kakaoPayReadyMock: vi.fn(),
  isKakaoPayEnabledMock: vi.fn(),
  isPortOneEnabledMock: vi.fn()
}));

vi.mock("@/app/api/payments/kakaopay/ready/route", () => ({
  POST: kakaoPayReadyMock
}));

vi.mock("@/lib/env", () => ({
  isKakaoPayEnabled: isKakaoPayEnabledMock,
  isPortOneEnabled: isPortOneEnabledMock
}));

import { POST } from "@/app/api/payments/ready/route";

function createRequest(provider?: string) {
  return new Request("https://invitehub.test/api/payments/ready", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      invitationId: "invitation-1",
      buyerName: "홍길동",
      buyerEmail: "hong@example.com",
      buyerPhone: "010-1234-5678"
    })
  });
}

describe("POST /api/payments/ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isKakaoPayEnabledMock.mockReturnValue(true);
    isPortOneEnabledMock.mockReturnValue(false);
    kakaoPayReadyMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true, redirectUrl: "https://pay.example/redirect" }), { status: 200 })
    );
  });

  it("delegates KakaoPay requests to the existing Kakao route", async () => {
    const response = await POST(createRequest("kakaopay"));
    expect(response.status).toBe(200);
    expect(kakaoPayReadyMock).toHaveBeenCalledTimes(1);
  });

  it("rejects app-store payment methods on the web route", async () => {
    const response = await POST(createRequest("apple_iap"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("앱 내 스토어 결제");
  });

  it("returns a setup message when portone-backed providers are not configured", async () => {
    const response = await POST(createRequest("naverpay"));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.message).toContain("PortOne 설정");
  });
});
