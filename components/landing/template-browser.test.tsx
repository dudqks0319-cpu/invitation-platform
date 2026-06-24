import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TemplateBrowser } from "@/components/landing/template-browser";

const pushMock = vi.fn();
let localStorageValues: Map<string, string>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("TemplateBrowser", () => {
  beforeEach(() => {
    pushMock.mockReset();
    localStorageValues = new Map();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => localStorageValues.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageValues.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          localStorageValues.delete(key);
        }),
        clear: vi.fn(() => {
          localStorageValues.clear();
        })
      }
    });
    document.body.innerHTML = "";
  });

  it("shows catalog filters and template sections with user-facing copy", () => {
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    expect(document.body.textContent).toContain("행사별 디자인");
    expect(document.body.textContent).toContain("상품군");
    expect(document.body.textContent).toContain("행사 목적");
    expect(document.body.textContent).toContain("사진 슬롯");
    expect(document.body.textContent).toContain("운영 기능");
    expect(document.body.textContent).toContain("찜한 템플릿");
    expect(document.body.textContent).toContain("최근 본 템플릿");
    expect(document.body.textContent).toContain("인기 디자인");
    expect(document.body.textContent).not.toContain("FULL GENSPARK ARCHIVE");
    expect(document.body.textContent).not.toContain("ART DIRECTION");
    expect(document.body.textContent).not.toContain("Genspark");
  });

  it("opens the builder when a template card is clicked", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const cardButton = container.querySelector('[aria-label="로즈 프레임 템플릿 선택"]');
    expect(cardButton).not.toBeNull();

    await act(async () => {
      cardButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(pushMock).toHaveBeenCalledWith("/builder?template=wedding-classic");

    await act(async () => {
      root.unmount();
    });
  });

  it("opens preview without triggering builder navigation", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const roseCard = container.querySelector('[aria-label="로즈 프레임 템플릿 선택"]');
    const previewButton = Array.from(roseCard?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent === "미리보기"
    );
    expect(previewButton).not.toBeUndefined();

    await act(async () => {
      previewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(container.textContent).toContain("로즈 프레임");
    expect(container.textContent).toContain("최근 로즈 프레임");

    await act(async () => {
      root.unmount();
    });
  });

  it("filters the catalog by product group", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const businessButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "비즈니스"
    );
    expect(businessButton).not.toBeUndefined();

    await act(async () => {
      businessButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("비즈니스 블루");
    expect(container.textContent).not.toContain("로즈 프레임");

    await act(async () => {
      root.unmount();
    });
  });

  it("stores favorite and recent template shortcuts", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("찜한 템플릿 0");
    expect(container.textContent).toContain("최근 본 템플릿 0");

    const favoriteButton = container.querySelector('[aria-label="로즈 프레임 찜 추가"]');
    expect(favoriteButton).not.toBeNull();

    await act(async () => {
      favoriteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector('[aria-label="로즈 프레임 찜 해제"]')).not.toBeNull();
    expect(container.textContent).toContain("찜한 템플릿 1");
    expect(container.textContent).toContain("찜 로즈 프레임");
    expect(localStorageValues.get("invitehub_favorite_template_ids")).toBe("[\"wedding-classic\"]");

    const roseCard = container.querySelector('[aria-label="로즈 프레임 템플릿 선택"]');
    const previewButton = Array.from(roseCard?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent === "미리보기"
    );
    expect(previewButton).not.toBeUndefined();

    await act(async () => {
      previewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("최근 본 템플릿 1");
    expect(container.textContent).toContain("최근 로즈 프레임");
    expect(localStorageValues.get("invitehub_recent_template_ids")).toBe("[\"wedding-classic\"]");

    const recentFilterButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "최근 본 템플릿 1"
    );
    expect(recentFilterButton).not.toBeUndefined();

    await act(async () => {
      recentFilterButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("현재 조건 1개");
    expect(container.textContent).toContain("로즈 프레임");

    await act(async () => {
      root.unmount();
    });
  });
});
