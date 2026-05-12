import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutFlow } from "@/components/payments/checkout-flow";

const { createBrowserClientMock } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: createBrowserClientMock
}));

describe("CheckoutFlow", () => {
  beforeEach(() => {
    createBrowserClientMock.mockReturnValue(null);
    document.body.innerHTML = "";
  });

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

  it("renders the real public slug and links the publish policy before free publish", async () => {
    createBrowserClientMock.mockReturnValue({
      from(table: string) {
        if (table !== "invitations") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          maybeSingle() {
            return Promise.resolve({
              data: {
                id: "inv-1",
                title: "민준 수아 결혼식 초대장",
                slug: "minjun-sua",
                payload: {}
              },
              error: null
            });
          }
        };
      }
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<CheckoutFlow initialInvitationId="inv-1" />);
    });
    await act(async () => {});

    expect(container.textContent).toContain("예정 공개 링크: /invitations/minjun-sua");
    expect(container.textContent).not.toContain("{publicSlug}");
    expect(container.querySelector('a[href="/terms"]')?.textContent).toContain("발행 정책");

    await act(async () => {
      root.unmount();
    });
  });
});
