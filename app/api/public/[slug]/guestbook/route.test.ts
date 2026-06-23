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
      "x-real-ip": "203.0.113.10"
    },
    body: JSON.stringify(body)
  });
}

function createAdminDouble(
  insertError: { message: string } | null = null,
  invitationPayload: Record<string, unknown> = {},
  variant?: {
    id: string;
    slug: string;
    audienceKey: string;
    audienceLabel: string;
    payloadPatch?: Record<string, unknown>;
    sectionPatch?: Record<string, unknown>;
  }
) {
  const insertMock = vi.fn(async () => ({ error: insertError }));

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
            eq(column: string, value: string) {
              filters[column] = value;
              return this;
            },
            async maybeSingle() {
              if (variant && filters.slug === variant.slug) {
                return {
                  data: null,
                  error: null
                };
              }

              return {
                data: {
                  id: "invitation-1",
                  slug: "demo",
                  title: "테스트 초대장",
                  category: "wedding",
                  template_id: "wedding-classic",
                  status: "published",
                  published_at: "2026-04-12T00:00:00.000Z",
                  payload: invitationPayload
                },
                error: null
              };
            }
          };
        }

        if (table === "invitation_variants") {
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
              if (!variant || filters.slug !== variant.slug || filters.status !== "active") {
                return {
                  data: null,
                  error: null
                };
              }

              return {
                data: {
                  id: variant.id,
                  invitation_id: "invitation-1",
                  audience_key: variant.audienceKey,
                  audience_label: variant.audienceLabel,
                  slug: variant.slug,
                  payload_patch: variant.payloadPatch ?? {},
                  section_patch: variant.sectionPatch ?? {},
                  share_image_path: null,
                  qr_image_path: null,
                  is_default: false,
                  status: "active",
                  created_at: "2026-04-12T00:00:00.000Z",
                  updated_at: "2026-04-12T00:00:00.000Z"
                },
                error: null
              };
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
    consumeRateLimitMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 2,
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
      nickname: "친구1",
      message: "축하합니다",
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
      createAdminDouble({ message: "new row violates row-level security policy" }).client
    );

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "방명록 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("stores variant attribution when guestbook is submitted through a variant slug", async () => {
    const adminDouble = createAdminDouble(null, {}, {
      id: "variant-1",
      slug: "demo-friends",
      audienceKey: "friends",
      audienceLabel: "친구용"
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo-friends" })
    });

    expect(response.status).toBe(200);
    expect(adminDouble.insertMock).toHaveBeenCalledWith({
      invitation_id: "invitation-1",
      variant_id: "variant-1",
      nickname: "친구1",
      message: "축하합니다",
      approved: false
    });
  });

  it("rejects guestbook writes when the invitation section policy disables guestbook", async () => {
    const adminDouble = createAdminDouble(null, {
      sections: {
        guestbook: false
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(403);
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: "이 초대장은 방명록 기능이 꺼져 있습니다."
    });
  });
});
