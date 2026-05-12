import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TemplateBrowser } from "@/components/landing/template-browser";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn()
}));
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock
}));

describe("TemplateBrowser", () => {
  const originalPaidPublishFlag = process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH;

  beforeEach(() => {
    pushMock.mockReset();
    trackEventMock.mockReset();
    document.body.innerHTML = "";
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = originalPaidPublishFlag;
  });

  it("shows only category and template sections with user-facing copy", () => {
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    expect(document.body.textContent).toContain("행사별 디자인");
    expect(document.body.textContent).toContain("인기 디자인");
    expect(document.body.textContent).not.toContain("FULL GENSPARK ARCHIVE");
    expect(document.body.textContent).not.toContain("ART DIRECTION");
    expect(document.body.textContent).not.toContain("Genspark");
  });

  it("keeps category switching sticky and presents larger real template results", () => {
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    expect(document.querySelector(".categories")?.className).not.toContain("sticky-template-categories");
    expect(document.querySelector(".cat-tabs")?.className).toContain("sticky-cat-tabs");
    expect(document.querySelector(".templates-grid")?.className).toContain("templates-grid-showcase");
    expect(document.querySelector(".template-thumb")?.className).toContain("template-thumb-showcase");
  });

  it("uses explicit template CTAs without nesting buttons inside a card button", () => {
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    const card = document.querySelector(".template-card");
    const useLink = document.querySelector('a[href="/builder?template=wedding-classic"]');

    expect(card?.getAttribute("role")).not.toBe("button");
    expect(card?.getAttribute("tabindex")).toBeNull();
    expect(useLink?.textContent).toContain("사용하기");
  });

  it("syncs template card photo policy with the paid publishing release flag", () => {
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "false";
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    expect(document.body.textContent).toContain("사진 없이 무료 발행");
    expect(document.body.textContent).toContain("사진 포함 발행은 준비 중");
    expect(document.body.textContent).not.toContain("사진 포함 발행권 3,300원");
    expect(document.body.textContent).toContain("RSVP · 지도 · 계좌 · 방명록 포함");

    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    expect(document.body.textContent).toContain("사진 포함 발행권 3,300원");
    expect(document.body.textContent).toContain("RSVP · 지도 · 계좌 · 방명록 포함");
  });

  it("opens preview without triggering builder navigation", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });

    const previewButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "미리보기"
    );
    expect(previewButton).not.toBeUndefined();

    await act(async () => {
      previewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(trackEventMock).toHaveBeenCalledWith("template_preview", {
      category: "wedding",
      template_id: "wedding-classic"
    });
    expect(container.textContent).toContain("로즈 프레임");
    expect(container.querySelector(".preview-modal-box")?.getAttribute("role")).toBe("dialog");
    expect(container.querySelector(".preview-modal-box")?.getAttribute("aria-modal")).toBe("true");

    await act(async () => {
      root.unmount();
    });
  });
});
