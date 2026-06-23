import { vi } from "vitest";

const {
  createServerSupabaseClientMock,
  createSupabaseAdminClientMock
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { GET } from "@/app/api/dashboard/invitations/[id]/export/route";

function createRequest(type: string) {
  return new Request(`https://invitehub.test/api/dashboard/invitations/invitation-1/export?type=${type}`, {
    method: "GET"
  });
}

function createServerClient(userId = "user-1") {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: userId ? { id: userId } : null
        }
      }))
    }
  };
}

function createAdminDouble(options?: {
  invitationFound?: boolean;
  rsvpError?: { message: string } | null;
  guestbookError?: { message: string } | null;
}) {
  return {
    client: {
      from(table: string) {
        if (table === "invitations") {
          const filters: Record<string, string> = {};
          return {
            select() {
              return this;
            },
            eq(column: string, value: string) {
              filters[column] = value;
              return this;
            },
            async maybeSingle() {
              if (options?.invitationFound === false || filters.id !== "invitation-1" || filters.user_id !== "user-1") {
                return {
                  data: null,
                  error: null
                };
              }

              return {
                data: {
                  id: "invitation-1",
                  slug: "kim-lee-demo",
                  title: "김 & 이 결혼식"
                },
                error: null
              };
            }
          };
        }

        if (table === "rsvps") {
          return {
            select() {
              return this;
            },
            eq() {
              return this;
            },
            async order() {
              return {
                data: [
                  {
                    created_at: "2026-03-04T10:00:00.000Z",
                    guest_name: "홍길동",
                    guest_phone: "010-1111-2222",
                    attending: true,
                    guests: 2,
                    memo: "축하드립니다",
                    variant_id: "variant-friends"
                  }
                ],
                error: options?.rsvpError ?? null
              };
            }
          };
        }

        if (table === "guestbook_entries") {
          return {
            select() {
              return this;
            },
            eq() {
              return this;
            },
            async order() {
              return {
                data: [
                  {
                    created_at: "2026-03-04T11:00:00.000Z",
                    nickname: "친구",
                    message: "축하해요, \"행복하세요\"",
                    approved: false,
                    variant_id: null
                  }
                ],
                error: options?.guestbookError ?? null
              };
            }
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("GET /api/dashboard/invitations/[id]/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue(createServerClient());
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);
  });

  it("exports owned RSVP rows as UTF-8 CSV", async () => {
    const response = await GET(createRequest("rsvps"), {
      params: Promise.resolve({ id: "invitation-1" })
    });
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="kim-lee-demo-rsvps.csv"');
    expect(csv).toContain("제출일");
    expect(csv).toContain("홍길동");
    expect(csv).toContain("variant-friends");
  });

  it("escapes guestbook CSV cells safely", async () => {
    const response = await GET(createRequest("guestbook"), {
      params: Promise.resolve({ id: "invitation-1" })
    });
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="kim-lee-demo-guestbook.csv"');
    expect(csv).toContain('"축하해요, ""행복하세요"""');
    expect(csv).toContain('"승인 대기"');
  });

  it("requires a logged-in owner", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient(""));

    const response = await GET(createRequest("rsvps"), {
      params: Promise.resolve({ id: "invitation-1" })
    });

    expect(response.status).toBe(401);
  });

  it("does not export another user's invitation data", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble({ invitationFound: false }).client);

    const response = await GET(createRequest("rsvps"), {
      params: Promise.resolve({ id: "invitation-1" })
    });

    expect(response.status).toBe(404);
  });

  it("rejects unsupported export types", async () => {
    const response = await GET(createRequest("payments"), {
      params: Promise.resolve({ id: "invitation-1" })
    });

    expect(response.status).toBe(400);
  });
});
