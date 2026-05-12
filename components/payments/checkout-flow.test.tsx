import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CheckoutFlow } from "@/components/payments/checkout-flow";

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("CheckoutFlow", () => {
  it("does not describe image publishing as part of the free plan", () => {
    const markup = renderToStaticMarkup(<CheckoutFlow />);

    expect(markup).toContain("사진을 추가하지 않은 무료 구성입니다");
    expect(markup).not.toContain("이미지, 교통 안내까지 무료");
  });

  it("does not request unused buyer personal information for free publish", () => {
    const markup = renderToStaticMarkup(<CheckoutFlow />);

    expect(markup).toContain("별도 결제 정보 없이 바로 공개 링크를 발행할 수 있습니다");
    expect(markup).not.toContain("발행 전 이름");
    expect(markup).not.toContain("010-0000-0000");
    expect(markup).not.toContain("name@example.com");
  });

  it("puts sharing actions first after publish completion", () => {
    const markup = renderToStaticMarkup(
      <CheckoutFlow initialInvitationId="inv-1" initialPaymentState="success" />
    );

    expect(markup).toContain("공개 링크가 준비됐습니다");
    expect(markup).toContain("이제 하객에게 초대장을 보낼 수 있어요.");
    expect(markup).toContain("카카오톡으로 공유");
    expect(markup).toContain("링크 복사");
    expect(markup).toContain("실제 화면 보기");
    expect(markup).toContain("다음에 할 수 있는 일");
  });
});
