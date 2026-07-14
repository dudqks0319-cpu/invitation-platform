import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/shared/site-header";

const pushMock = vi.fn();
const backMock = vi.fn();
const refreshMock = vi.fn();
const signOutMock = vi.fn();
const unsubscribeMock = vi.fn();
const getUserMock = vi.fn(async () => ({ data: { user: null } }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/invitations/kim-lee-demo",
  useRouter: () => ({
    back: backMock,
    push: pushMock,
    refresh: refreshMock
  })
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: getUserMock,
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: unsubscribeMock
          }
        }
      }),
      signOut: signOutMock
    }
  })
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    pushMock.mockClear();
    backMock.mockClear();
    refreshMock.mockClear();
    signOutMock.mockClear();
    unsubscribeMock.mockClear();
    getUserMock.mockClear();
  });

  it("shows the full navigation in default mode", () => {
    document.body.innerHTML = renderToStaticMarkup(<SiteHeader />);

    expect(document.body.innerHTML).toContain("오삼오삼 홈으로 이동");
    expect(document.body.textContent).toContain("53오삼오삼");
    expect(document.body.textContent).not.toContain("뒤로");
    expect(document.body.textContent).toContain("디자인");
    expect(document.body.textContent).toContain("만드는 방법");
    expect(document.body.textContent).toContain("오삼오삼 안내");
    expect(document.body.textContent).toContain("내 초대장");
    expect(document.body.textContent).toContain("로그인");
    expect(document.body.textContent).toContain("초대장 만들기");
    expect(document.body.innerHTML).toContain('aria-controls="site-mobile-menu"');
    expect(document.body.innerHTML).toContain('aria-label="주요 메뉴"');
  });

  it("hides navigation actions in focus mode", () => {
    document.body.innerHTML = renderToStaticMarkup(<SiteHeader mode="focus" />);

    expect(document.body.innerHTML).toContain("오삼오삼 홈으로 이동");
    expect(document.body.textContent).toContain("53오삼오삼");
    expect(document.body.textContent).toContain("뒤로");
    expect(document.body.innerHTML).toContain("이전 화면으로 돌아가기");
    expect(document.body.textContent).not.toContain("디자인");
    expect(document.body.textContent).not.toContain("만드는 방법");
    expect(document.body.textContent).not.toContain("오삼오삼 안내");
    expect(document.body.textContent).not.toContain("내 초대장");
    expect(document.body.textContent).not.toContain("로그인");
    expect(document.body.textContent).not.toContain("초대장 만들기");
  });
});
