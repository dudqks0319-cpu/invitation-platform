import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BuilderStudio } from "@/components/builder/builder-studio";

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock
  })
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("BuilderStudio publish flow", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    };
    const localStore = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => localStore.get(key) ?? null,
        removeItem: (key: string) => {
          localStore.delete(key);
        },
        setItem: (key: string, value: string) => {
          localStore.set(key, value);
        }
      }
    });
    document.body.innerHTML = "";
  });

  it("groups the final publish checklist and sharing CTAs in one panel", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<BuilderStudio />);
    });

    const nextButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "다음 단계"
    );
    expect(nextButton).not.toBeUndefined();

    for (let index = 0; index < 4; index += 1) {
      await act(async () => {
        nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }

    const publishPanel = container.querySelector('[aria-label="발행 준비 체크리스트"]');
    expect(publishPanel).not.toBeNull();
    expect(publishPanel?.textContent).toContain("초안 저장");
    expect(publishPanel?.textContent).toContain("무료 발행");
    expect(publishPanel?.textContent).toContain("공유 준비");
    expect(publishPanel?.textContent).toContain("공개 전 아직");
    expect(publishPanel?.textContent).toContain("신랑 이름");
    expect(publishPanel?.textContent).toContain("부족한 항목 수정하기");
    expect(publishPanel?.querySelectorAll("a,button").length).toBeGreaterThanOrEqual(3);

    await act(async () => {
      root.unmount();
    });
  });

  it("starts required user fields empty instead of showing demo values as real input", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<BuilderStudio />);
    });

    expect((container.querySelector('input[placeholder="예: 민준 수아 결혼식 초대장"]') as HTMLInputElement | null)?.value).toBe("");
    expect((container.querySelector('input[placeholder="예: 서울 더파인 웨딩홀"]') as HTMLInputElement | null)?.value).toBe("");
    expect(container.textContent).not.toContain("홍길동 ♡ 김부인");
    expect(container.textContent).toContain("신랑 ♡ 신부");

    await act(async () => {
      root.unmount();
    });
  });

  it("scrolls the active step header into view when moving between steps", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<BuilderStudio />);
    });

    const nextButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "다음 단계"
    );

    await act(async () => {
      nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start"
    });

    await act(async () => {
      root.unmount();
    });
  });

  it("explains the photo paid publishing policy before upload and on the publish panel", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<BuilderStudio />);
    });

    const nextButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "다음 단계"
    );

    for (let index = 0; index < 2; index += 1) {
      await act(async () => {
        nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }

    expect(container.textContent).toContain("사진을 넣지 않으면 무료로 발행할 수 있습니다.");
    expect(container.textContent).toContain("사진 포함 발행권 3,300원이 필요합니다.");

    for (let index = 0; index < 2; index += 1) {
      await act(async () => {
        nextButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }

    expect(container.textContent).toContain("현재 구성은 사진 없는 무료 발행입니다.");

    await act(async () => {
      root.unmount();
    });
  });
});
