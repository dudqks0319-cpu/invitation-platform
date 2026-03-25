import { vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  consumeRateLimitMock,
  getClientIdentifierMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  getClientIdentifierMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  getClientIdentifier: getClientIdentifierMock
}));

import { POST } from "@/app/api/public/[slug]/guestbook/route";

function createRequest(body: object) {
  return new Request("https://invitehub.test/api/public/demo/guestbook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1"
    },
    body: JSON.stringify(body)
  });
}

function createAdminDouble(invitationStatus: string | null) {
  const insertMock = vi.fn(async () => ({ error: null }));

  return {
    insertMock,
    client: {
      from(table: string) {
        if (table === "invitations") {
          const filters: Record<string, string> = {};

          return {
            select() {
              return this;
            },
            eq(key: string, value: string) {
              filters[key] = value;
              return this;
            },
            async maybeSingle() {
              if (
                filters.slug === "demo" &&
                filters.status === "published" &&
                invitationStatus === "published"
              ) {
                return {
                  data: {
                    id: "invitation-1",
                    slug: "demo",
                    status: "published"
                  },
                  error: null
                };
              }

              return { data: null, error: null };
            }
          };
        }

        if (table === "guestbook_entries") {
          return {
            insert: insertMock
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("POST /api/public/[slug]/guestbook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    getClientIdentifierMock.mockReturnValue("127.0.0.1");
  });

  it("creates a moderated guestbook entry for a published invitation", async () => {
    const adminDouble = createAdminDouble("published");
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "두 분 축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(201);
    expect(adminDouble.insertMock).toHaveBeenCalledWith({
      invitation_id: "invitation-1",
      nickname: "친구1",
      message: "두 분 축하합니다",
      approved: false
    });
  });

  it("returns 404 for unpublished invitations", async () => {
    const adminDouble = createAdminDouble(null);
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(404);
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
  });
});
