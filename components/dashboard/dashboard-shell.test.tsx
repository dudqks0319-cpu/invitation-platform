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

    await act(async () => {
      root.unmount();
    });
  });
});
