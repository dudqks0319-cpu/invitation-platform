import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/shared/site-header";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signOutMock = vi.fn();
const unsubscribeMock = vi.fn();
const getUserMock = vi.fn(async () => ({ data: { user: null } }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/invitations/kim-lee-demo",
  useRouter: () => ({
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
    refreshMock.mockClear();
    signOutMock.mockClear();
    unsubscribeMock.mockClear();
    getUserMock.mockClear();
  });

  it("shows the full navigation in default mode", () => {
    document.body.innerHTML = renderToStaticMarkup(<SiteHeader />);

    expect(document.body.innerHTML).toContain("InviteHub 홈으로 이동");
    expect(document.body.textContent).toContain("템플릿");
    expect(document.body.textContent).toContain("초대장 만들기");
    expect(document.body.textContent).toContain("대시보드");
    expect(document.body.textContent).toContain("요금");
    expect(document.body.textContent).toContain("로그인");
    expect(document.body.textContent).toContain("시작하기");
  });

  it("hides navigation actions in focus mode", () => {
    document.body.innerHTML = renderToStaticMarkup(<SiteHeader mode="focus" />);

    expect(document.body.innerHTML).toContain("InviteHub 홈으로 이동");
    expect(document.body.textContent).not.toContain("템플릿");
    expect(document.body.textContent).not.toContain("초대장 만들기");
    expect(document.body.textContent).not.toContain("대시보드");
    expect(document.body.textContent).not.toContain("요금");
    expect(document.body.textContent).not.toContain("로그인");
    expect(document.body.textContent).not.toContain("시작하기");
  });
});
