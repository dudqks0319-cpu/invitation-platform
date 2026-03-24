import { render, screen, waitFor } from "@testing-library/react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("DashboardShell", () => {
  it("shows demo mode guidance when supabase is unavailable", async () => {
    render(<DashboardShell />);

    await waitFor(() => {
      expect(screen.getByText("내 초대장")).toBeInTheDocument();
    });

    expect(screen.getByText("데모 모드입니다. 로그인하면 실제 데이터를 볼 수 있습니다.")).toBeInTheDocument();
    expect(screen.getByText("Supabase 환경변수를 설정하고 로그인하면 초대장을 관리할 수 있습니다.")).toBeInTheDocument();
  });
});
