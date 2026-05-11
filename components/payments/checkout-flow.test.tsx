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
});
