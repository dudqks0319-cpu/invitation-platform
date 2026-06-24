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
    expect(container.textContent).toContain("RSVP CSV 내보내기");
    expect(container.textContent).toContain("방명록 CSV 내보내기");
    expect(container.textContent).toContain("QR 저장");
    expect(container.innerHTML).toContain("/api/qr/kim-lee-demo");
    expect(container.innerHTML).toContain("/api/qr/kim-lee-demo-friends");

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
