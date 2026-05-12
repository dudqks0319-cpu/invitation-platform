import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DashboardShell,
  buildRsvpCsv,
  getDashboardPrimaryAction
} from "@/components/dashboard/dashboard-shell";

const { createBrowserClientMock } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: createBrowserClientMock
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    createBrowserClientMock.mockReturnValue(null);
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

  it("maps payment and refund statuses to clear primary actions", () => {
    expect(getDashboardPrimaryAction("draft")).toEqual({
      href: "/checkout?invitationId=inv-1",
      label: "발행하기"
    });
    expect(getDashboardPrimaryAction("payment_pending")).toEqual({
      href: "/checkout?invitationId=inv-1",
      label: "결제 재시도"
    });
    expect(getDashboardPrimaryAction("paid")).toEqual({
      href: "/dashboard/invitations/inv-1/publish-recovery",
      label: "발행 복구"
    });
    expect(getDashboardPrimaryAction("refund_pending")).toEqual({
      href: "/support",
      label: "환불 상태"
    });
    expect(getDashboardPrimaryAction("refunded")).toEqual({
      href: "/checkout?invitationId=inv-1",
      label: "재발행"
    });
    expect(getDashboardPrimaryAction("payment_failed")).toEqual({
      href: "/checkout?invitationId=inv-1",
      label: "결제 다시 시도"
    });
  });

  it("shows a creation CTA when a signed-in dashboard has no invitations", async () => {
    createBrowserClientMock.mockReturnValue({
      auth: {
        async getUser() {
          return { data: { user: { id: "user-1" } } };
        }
      },
      from(table: string) {
        if (table !== "invitations") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          order() {
            return Promise.resolve({ data: [], error: null });
          }
        };
      }
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<DashboardShell />);
    });
    await act(async () => {});

    expect(container.textContent).toContain("아직 저장된 초대장이 없습니다");
    expect(container.querySelector('a[href="/builder"]')?.textContent).toContain("초대장 만들기");
    expect(container.querySelector('a[href="/#templates"]')?.textContent).toContain("템플릿 보기");

    await act(async () => {
      root.unmount();
    });
  });

  it("shows today operations, RSVP full controls, and CSV export affordance", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<DashboardShell />);
    });

    await act(async () => {});

    expect(container.textContent).toContain("오늘 확인할 일");
    expect(container.textContent).toContain("새 RSVP");
    expect(container.textContent).toContain("승인 대기 방명록");
    expect(container.textContent).toContain("RSVP 전체 보기");
    expect(container.querySelector('input[aria-label="RSVP 이름 또는 전화번호 검색"]')).not.toBeNull();
    expect(container.querySelector('select[aria-label="RSVP 참석 여부 필터"]')).not.toBeNull();
    expect(container.textContent).toContain("CSV 다운로드");
    expect(container.textContent).toContain("RSVP CSV에는 하객 이름과 연락처가 포함됩니다.");

    await act(async () => {
      root.unmount();
    });
  });

  it("builds a CSV for every RSVP response", () => {
    const csv = buildRsvpCsv([
      {
        id: "rsvp-1",
        guestName: "박하객",
        guestPhone: "010-0000-0001",
        attending: true,
        guests: 2,
        memo: "축하, 참석합니다",
        createdAt: "2026-03-04T04:00:00.000Z"
      },
      {
        id: "rsvp-2",
        guestName: "김불참",
        guestPhone: "",
        attending: false,
        guests: 0,
        memo: "",
        createdAt: "2026-03-04T05:00:00.000Z"
      }
    ]);

    expect(csv).toContain("이름,연락처,참석 여부,동행 인원,메모,응답일");
    expect(csv).toContain("\"박하객\",\"010-0000-0001\",\"참석\",\"2\",\"축하, 참석합니다\"");
    expect(csv).toContain("\"김불참\",\"\",\"불참\",\"0\",\"\"");
  });
});
