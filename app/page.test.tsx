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

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((first, second) => first - second));
    expect(text).toContain("초대는 짧지만, 기억은 오래 남으니까");
    expect(text).toContain("소중한 날의 첫인사,");
    expect(html).toContain('href="#featured-templates">디자인 먼저 보기');
    expect(html).toContain('href="/image-text">내 이미지로 만들기');
    expect(html).toContain("ANIME PICK");
    expect(html).not.toContain("제작은 1분이면 충분해요");
    expect(html).not.toContain("이미지 초대장 보조 제작");
    expect(html).not.toContain("실제 공유 화면 기준");
  });
});
