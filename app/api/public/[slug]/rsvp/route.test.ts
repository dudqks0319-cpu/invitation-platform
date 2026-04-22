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
      "x-real-ip": "203.0.113.10"
    },
    body: JSON.stringify(body)
  });
}

function createAdminDouble(options?: {
  insertError?: { message: string } | null;
  existingRsvpId?: string | null;
}) {
  const insertError = options?.insertError ?? null;
  const insertMock = vi.fn(async () => ({ error: insertError }));
  const updateMock = vi.fn(() => ({
    eq: vi.fn(async () => ({ error: null }))
  }));

  return {
    insertMock,
    updateMock,
    client: {
      from(table: string) {
        if (table === "invitations") {
          return {
            select() {
              return this;
            },
            eq() {
              return this;
            },
            async maybeSingle() {
              return {
                data: {
                  id: "invitation-1",
                  status: "published"
                },
                error: null
              };
            }
          };
        }

        if (table === "rsvps") {
          return {
            insert: insertMock,
            update: updateMock,
            select() {
              return this;
            },
            eq() {
              return this;
            },
            is() {
              return this;
            },
            async maybeSingle() {
              return {
                data: options?.existingRsvpId
                  ? {
                      id: options.existingRsvpId
                    }
                  : null,
                error: null
              };
            }
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
    consumeRateLimitMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    getClientIdentifierMock.mockReturnValue("203.0.113.10");
  });

  it("returns 503 when the persistent rate-limit backend is unavailable", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);
    consumeRateLimitMock.mockResolvedValue({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(503);
    expect(result).toEqual({
      success: false,
      message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("does not expose raw database errors to the client", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ insertError: { message: "duplicate key value violates unique constraint" } }).client
    );

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "RSVP 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("updates an existing RSVP when the same guest submits again", async () => {
    const adminDouble = createAdminDouble({ existingRsvpId: "rsvp-1" });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      guestName: "박하객",
      guestPhone: "010-1111-2222",
      attending: "no",
      guests: 0,
      memo: "사정이 생겼어요",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
    expect(adminDouble.updateMock).toHaveBeenCalledWith({
      guest_phone: "010-1111-2222",
      attending: false,
      guests: 0,
      side: "shared",
      meal_preference: "undecided",
      shuttle_needed: false,
      companion_names: null,
      memo: "사정이 생겼어요"
    });
    expect(result).toEqual({
      success: true,
      message: "RSVP가 저장되었습니다."
    });
  });
});
