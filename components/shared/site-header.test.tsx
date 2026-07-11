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
    expect(document.body.textContent).toContain("템플릿");
    expect(document.body.textContent).toContain("이미지 초대장");
    expect(document.body.textContent).toContain("템플릿 초대장");
    expect(document.body.textContent).toContain("대시보드");
    expect(document.body.textContent).toContain("로그인");
    expect(document.body.textContent).toContain("초대장 만들기");
  });

  it("hides navigation actions in focus mode", () => {
    document.body.innerHTML = renderToStaticMarkup(<SiteHeader mode="focus" />);

    expect(document.body.innerHTML).toContain("오삼오삼 홈으로 이동");
    expect(document.body.textContent).toContain("53오삼오삼");
    expect(document.body.textContent).toContain("뒤로");
    expect(document.body.innerHTML).toContain("이전 화면으로 돌아가기");
    expect(document.body.textContent).not.toContain("템플릿");
    expect(document.body.textContent).not.toContain("이미지 초대장");
    expect(document.body.textContent).not.toContain("템플릿 초대장");
    expect(document.body.textContent).not.toContain("대시보드");
    expect(document.body.textContent).not.toContain("로그인");
    expect(document.body.textContent).not.toContain("초대장 만들기");
  });
});
