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

import { POST } from "@/app/api/public/[slug]/rsvp/route";

function createRequest(body: object) {
  return new Request("https://invitehub.test/api/public/demo/rsvp", {
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

        if (table === "rsvps") {
          return {
            insert: insertMock
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("POST /api/public/[slug]/rsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    getClientIdentifierMock.mockReturnValue("127.0.0.1");
  });

  it("creates an RSVP for a published invitation", async () => {
    const adminDouble = createAdminDouble("published");
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      guestName: "박하객",
      guestPhone: "010-1111-2222",
      attending: "yes",
      guests: 2,
      memo: "축하드립니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(201);
    expect(adminDouble.insertMock).toHaveBeenCalledWith({
      invitation_id: "invitation-1",
      guest_name: "박하객",
      guest_phone: "010-1111-2222",
      attending: true,
      guests: 2,
      memo: "축하드립니다"
    });
  });

  it("rejects rate-limited requests", async () => {
    const adminDouble = createAdminDouble("published");
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);
    consumeRateLimitMock.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000
    });

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(429);
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
  });
});
