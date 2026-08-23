import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("HomePage", () => {
  it("renders the release sections in the requested order with the exact hero actions", async () => {
    const page = await HomePage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(page);
    const text = html.replace(/<[^>]+>/g, "");
    const sectionMarkers = [
      'id="hero"',
      'id="quick-events"',
      'id="featured-templates"',
      'id="create-methods"',
      'aria-label="오삼오삼 이용 안심 안내"',
      'id="templates"',
      'id="how-it-works"',
      'id="features"',
      'id="brand-story"',
      'aria-labelledby="final-cta-title"'
    ];
    const positions = sectionMarkers.map((marker) => html.indexOf(marker));
    const heroHtml = html.slice(html.indexOf('id="hero"'), html.indexOf('id="quick-events"'));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((first, second) => first - second));
    expect(text).toContain("초대는 짧지만, 기억은 오래 남으니까");
    expect(text).toContain("소중한 날의 첫인사,");
    expect(html).toContain('href="#featured-templates">디자인 먼저 보기');
    expect(html).toContain('href="/image-text">내 이미지로 만들기');
    expect(heroHtml).toContain("플로럴 세레모니 04");
    expect(heroHtml).toContain("웨딩 포토 콘셉트 01");
    expect(heroHtml).toContain("웨딩 포토 콘셉트 02");
    expect(heroHtml).not.toContain("한복의 품격");
    expect(heroHtml).not.toContain("다정한 첫걸음");
    expect(heroHtml).not.toContain("노란 꽃길");
    ["플로럴 세레모니 04", "플로럴 세레모니 05", "플로럴 세레모니 06", "플로럴 세레모니 07", "플로럴 세레모니 08"].forEach((name) => {
      expect(text).toContain(name);
    });
    ["웨딩 포토 콘셉트 01", "웨딩 포토 콘셉트 02", "웨딩 포토 콘셉트 03", "웨딩 포토 콘셉트 04", "웨딩 포토 콘셉트 05", "웨딩 포토 콘셉트 06", "웨딩 포토 콘셉트 07", "웨딩 포토 콘셉트 08", "웨딩 포토 콘셉트 09", "웨딩 포토 콘셉트 10"].forEach((name) => {
      expect(text).toContain(name);
    });
    ["초록 라인 약속", "한복의 품격", "다정한 첫걸음", "베리 보태니컬", "노란 꽃길", "푸른 백합 라인"].forEach((name) => {
      expect(text).toContain(name);
    });
    expect(html).toContain("ILLUSTRATION PICK");
    expect(html).toContain("FLORAL PICK");
    expect(html).toContain("PHOTO PICK");
    expect(html).not.toContain("제작은 1분이면 충분해요");
    expect(html).not.toContain("이미지 초대장 보조 제작");
    expect(html).not.toContain("실제 공유 화면 기준");
  });
});
