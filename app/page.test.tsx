import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("HomePage", () => {
  it("positions InviteHub as invitation creation and RSVP operations", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("모바일 초대장,");
    expect(markup).toContain("만들고 보내고 관리까지 한 번에");
    expect(markup).toContain("RSVP, 계좌, 지도, 방명록도 함께 관리하세요.");
    expect(markup).toContain("무료로 초대장 만들기");
    expect(markup).toContain("템플릿 먼저 보기");
  });
});
