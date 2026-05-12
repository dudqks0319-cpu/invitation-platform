import { vi } from "vitest";

const { createServerSupabaseClientMock, notFoundMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  notFoundMock: vi.fn(),
  redirectMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
  usePathname: () => "/dashboard/invitations/inv-1/publish-recovery",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserClient: () => null
}));

import PublishRecoveryPage from "@/app/dashboard/invitations/[id]/publish-recovery/page";

describe("PublishRecoveryPage", () => {
  it("filters the invitation by the authenticated owner", async () => {
    const eqCalls: Array<[string, string]> = [];
    createServerSupabaseClientMock.mockResolvedValue({
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
          eq(column: string, value: string) {
            eqCalls.push([column, value]);
            return this;
          },
          maybeSingle() {
            return Promise.resolve({
              data: {
                id: "inv-1",
                slug: "paid-invite",
                status: "paid",
                title: "민준 수아 결혼식 초대장",
                payload: {
                  title: "민준 수아 결혼식 초대장",
                  eventDateTime: "2026-05-10T14:00",
                  venueName: "더파인 웨딩홀",
                  venueAddress: "서울 강남구 논현로 456",
                  groomName: "민준",
                  brideName: "수아"
                }
              },
              error: null
            });
          }
        };
      }
    });

    await PublishRecoveryPage({ params: Promise.resolve({ id: "inv-1" }) });

    expect(eqCalls).toContainEqual(["id", "inv-1"]);
    expect(eqCalls).toContainEqual(["user_id", "user-1"]);
  });
});
