import { render, screen } from "@testing-library/react";
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
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "InviteHub 홈으로 이동" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "템플릿" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "초대장 만들기" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "대시보드" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "요금" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "시작하기" })).toBeInTheDocument();
  });

  it("hides navigation actions in focus mode", () => {
    render(<SiteHeader mode="focus" />);

    expect(screen.getByRole("link", { name: "InviteHub 홈으로 이동" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "템플릿" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "초대장 만들기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "대시보드" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "요금" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "시작하기" })).not.toBeInTheDocument();
  });
});
