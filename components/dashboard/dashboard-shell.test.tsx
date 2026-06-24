import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
    });
  });

  it("shows audience-specific links in demo mode", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<DashboardShell />);
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("대상별 링크");
    expect(container.textContent).toContain("친구용 복사");
    expect(container.textContent).toContain("직장용 복사");
    expect(container.textContent).toContain("/invitations/kim-lee-demo-friends");
    expect(container.textContent).toContain("/invitations/kim-lee-demo-coworkers");
    expect(container.textContent).toContain("신고 관리");
    expect(container.textContent).toContain("개인정보 노출");
    expect(container.textContent).toContain("검토 대기");
    expect(container.textContent).toContain("무료 공개 링크 사용 기간");
    expect(container.textContent).toContain("데이터 보관 기준");
    expect(container.textContent).toContain("업로드 사진과 갤러리 이미지");
    expect(container.textContent).toContain("사용 기간 별도 만료일 없이 제공");
    expect(container.textContent).toContain("수정 이력");
    expect(container.textContent).toContain("최근 수정");
    expect(container.textContent).toContain("무료 공개 링크 발행");
    expect(container.textContent).toContain("초안 생성");
    expect(container.textContent).toContain("RSVP CSV 내보내기");
    expect(container.textContent).toContain("방명록 CSV 내보내기");
    expect(container.textContent).toContain("QR 저장");
    expect(container.textContent).toContain("인스타 이미지");
    expect(container.textContent).toContain("A4 포스터");
    expect(container.textContent).toContain("iCal 저장");
    expect(container.textContent).toContain("복제");
    expect(container.textContent).toContain("무료 발행 준비");
    expect(container.innerHTML).toContain("/api/qr/kim-lee-demo");
    expect(container.innerHTML).toContain("/api/qr/kim-lee-demo-friends");
    expect(container.innerHTML).toContain("/api/share/instagram/kim-lee-demo");
    expect(container.innerHTML).toContain("/api/share/a4/kim-lee-demo");
    expect(container.innerHTML).toContain("/api/share/instagram/kim-lee-demo-friends");
    expect(container.innerHTML).toContain("/api/share/a4/kim-lee-demo-friends");
    expect(container.innerHTML).toContain("/api/calendar/kim-lee-demo");
    expect(container.innerHTML).toContain("/api/calendar/kim-lee-demo-friends");
    expect(container.innerHTML).not.toContain("/checkout");

    const duplicateButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "복제"
    );
    expect(duplicateButton).toBeTruthy();

    await act(async () => {
      duplicateButton?.click();
    });

    expect(container.textContent).toContain("로그인 후 실제 초대장을 새 초안으로 복제할 수 있습니다.");

    const exportButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "RSVP CSV 내보내기"
    );
    expect(exportButton).toBeTruthy();

    await act(async () => {
      exportButton?.click();
    });

    expect(container.textContent).toContain("로그인 후 실제 데이터를 CSV로 받을 수 있습니다.");

    await act(async () => {
      root.unmount();
    });
  });
});
