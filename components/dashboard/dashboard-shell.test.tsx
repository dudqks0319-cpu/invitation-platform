import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    const localStore = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => localStore.get(key) ?? null,
        removeItem: (key: string) => {
          localStore.delete(key);
        },
        setItem: (key: string, value: string) => {
          localStore.set(key, value);
        }
      }
    });
    document.body.innerHTML = "";
  });

  it("renders invitations as dense operation rows with metrics, status, and actions together", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<DashboardShell />);
    });

    await act(async () => {});

    const denseList = container.querySelector(".dashboard-dense-list");
    const firstRow = container.querySelector(".dashboard-invitation-row");

    expect(denseList).not.toBeNull();
    expect(firstRow).not.toBeNull();
    expect(firstRow?.querySelector(".dashboard-status-badge")?.textContent).toMatch(/발행됨|초안|결제/);
    expect(firstRow?.querySelector(".dashboard-row-metrics")?.textContent).toContain("조회");
    expect(firstRow?.querySelector(".dashboard-row-actions")?.textContent).toContain("편집");

    await act(async () => {
      root.unmount();
    });
  });
});
