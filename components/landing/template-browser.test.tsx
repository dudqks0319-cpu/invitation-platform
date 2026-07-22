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

    expect(document.body.textContent).toContain("행사별 초대장 컬렉션");
    expect(document.body.textContent).toContain("마음에 드는 템플릿을 골라보세요");
    expect(document.body.textContent).not.toContain("FULL GENSPARK ARCHIVE");
    expect(document.body.textContent).not.toContain("ART DIRECTION");
    expect(document.body.textContent).not.toContain("Genspark");
  });

  it("shows the newest doljanchi artwork first in the home dol tab", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });

    const dolTab = Array.from(container.querySelectorAll(".cat-tab")).find((button) =>
      button.textContent?.includes("돌잔치")
    );
    expect(dolTab).not.toBeUndefined();

    await act(async () => {
      dolTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const firstCard = container.querySelector(".template-card");
    expect(firstCard?.getAttribute("aria-label")).toBe("달토끼 첫별 템플릿 선택");

    await act(async () => {
      root.unmount();
    });
  });

  it("shows the new anime artwork first in housewarming and milestone birthday tabs", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });

    const expectations = [
      ["집들이", "빨간 지붕 화분집 템플릿 선택"],
      ["환갑잔치", "학과 붉은 모란 템플릿 선택"],
      ["칠순잔치", "칠순 라벤더 01 템플릿 선택"],
      ["팔순잔치", "팔순 로즈골드 01 템플릿 선택"]
    ] as const;

    for (const [tabLabel, firstCardLabel] of expectations) {
      const tab = Array.from(container.querySelectorAll(".cat-tab")).find((button) =>
        button.textContent?.includes(tabLabel)
      );
      expect(tab, `${tabLabel} tab should exist`).not.toBeUndefined();

      await act(async () => {
        tab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      const firstCard = container.querySelector(".template-card");
      expect(firstCard?.getAttribute("aria-label")).toBe(firstCardLabel);
    }

    await act(async () => {
      root.unmount();
    });
  });

  it("keeps preview and use as separate explicit actions", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });

    const card = container.querySelector('[aria-label="로즈 프레임 템플릿 선택"]');
    const links = Array.from(card?.querySelectorAll("a") ?? []);
    expect(links.some((link) => link.textContent === "미리보기" && link.getAttribute("href") === "/preview?template=wedding-classic")).toBe(true);
    expect(links.some((link) => link.textContent === "사용하기" && link.getAttribute("href") === "/builder?template=wedding-classic")).toBe(true);

    await act(async () => {
      root.unmount();
    });
  });

  it("opens the full-screen preview route for the selected template", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TemplateBrowser />);
    });

    const previewLink = Array.from(container.querySelectorAll("a")).find(
      (link) => link.textContent === "미리보기"
    );
    expect(previewLink?.getAttribute("href")).toBe("/preview?template=wedding-barunson-anime-25");

    await act(async () => {
      root.unmount();
    });
  });
});
