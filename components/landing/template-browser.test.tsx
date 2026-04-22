import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { TemplateBrowser } from "@/components/landing/template-browser";

describe("TemplateBrowser", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("shows only category and template sections with user-facing copy", () => {
    document.body.innerHTML = renderToStaticMarkup(<TemplateBrowser />);

    expect(document.body.textContent).toContain("핵심 카테고리");
    expect(document.body.textContent).toContain("대표 디자인");
    expect(document.body.textContent).toContain("브라이덜샤워");
    expect(document.body.textContent).toContain("참석 응답");
    expect(document.body.textContent).toContain("참석 확인");
    expect(document.body.textContent).toContain("집들이");
    expect(document.body.textContent).not.toContain(["R", "SVP"].join(""));
    expect(document.body.textContent).not.toContain("FULL GENSPARK ARCHIVE");
    expect(document.body.textContent).not.toContain("ART DIRECTION");
    expect(document.body.textContent).not.toContain("Genspark");
  });

  it("uses semantic links for template selection", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });

    const templateLink = container.querySelector<HTMLAnchorElement>('a[aria-label="플라워 보더 템플릿 선택"]');
    expect(templateLink).not.toBeNull();
    expect(templateLink?.getAttribute("href")).toBe("/builder?template=wedding-classic");
    expect(templateLink?.getAttribute("role")).toBeNull();

    const previewImage = templateLink?.querySelector<HTMLImageElement>("img.template-board-image");
    expect(previewImage?.getAttribute("width")).toBe("320");
    expect(previewImage?.getAttribute("height")).toBe("485");

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

    const previewButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "미리보기"
    );
    expect(previewButton).not.toBeUndefined();
    expect(previewButton?.closest("a")).toBeNull();

    await act(async () => {
      previewButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("플라워 보더");
    expect(container.querySelector('button[aria-label="미리보기 닫기"]')).not.toBeNull();

    await act(async () => {
      root.unmount();
    });
  });
});
