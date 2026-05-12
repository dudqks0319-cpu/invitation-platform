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
    expect(publishPanel?.querySelectorAll("a,button").length).toBeGreaterThanOrEqual(3);

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
