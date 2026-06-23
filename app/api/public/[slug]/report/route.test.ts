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

import { POST } from "@/app/api/public/[slug]/report/route";

function createRequest(body: object) {
  return new Request("https://invitehub.test/api/public/demo/report", {
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
  variant?: {
    id: string;
    slug: string;
    audienceKey: string;
    audienceLabel: string;
  };
}) {
  const insertMock = vi.fn(async () => ({ error: options?.insertError ?? null }));

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
              if (options?.variant && filters.slug === options.variant.slug) {
                return {
                  data: null,
                  error: null
                };
              }

              if (filters.slug !== "demo" && filters.id !== "invitation-1") {
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
                  payload: {}
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
              if (!options?.variant || filters.slug !== options.variant.slug || filters.status !== "active") {
                return {
                  data: null,
                  error: null
                };
              }

              return {
                data: {
                  id: options.variant.id,
                  invitation_id: "invitation-1",
                  audience_key: options.variant.audienceKey,
                  audience_label: options.variant.audienceLabel,
                  slug: options.variant.slug,
                  payload_patch: {},
                  section_patch: {},
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

        if (table === "content_reports") {
          return {
            insert: insertMock
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("POST /api/public/[slug]/report", () => {
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

  it("stores invitation reports with variant attribution", async () => {
    const adminDouble = createAdminDouble({
      variant: {
        id: "variant-1",
        slug: "demo-friends",
        audienceKey: "friends",
        audienceLabel: "친구용"
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      targetType: "invitation",
      reason: "privacy",
      detail: "사진에 연락처가 노출되어 있습니다.",
      reporterContact: "guest@example.com",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo-friends" })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({
      success: true,
      message: "신고가 접수되었습니다. 운영자가 확인하겠습니다."
    });
    expect(adminDouble.insertMock).toHaveBeenCalledWith({
      target_type: "invitation",
      target_id: "invitation-1",
      invitation_id: "invitation-1",
      variant_id: "variant-1",
      reason: "privacy",
      detail: "사진에 연락처가 노출되어 있습니다.",
      reporter_contact: "guest@example.com",
      status: "pending"
    });
  });

  it("returns 503 when the persistent rate-limit backend is unavailable", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);
    consumeRateLimitMock.mockResolvedValue({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    const response = await POST(createRequest({
      targetType: "invitation",
      reason: "spam",
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
      createAdminDouble({ insertError: { message: "permission denied for table content_reports" } }).client
    );

    const response = await POST(createRequest({
      targetType: "invitation",
      reason: "copyright",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("rejects non-invitation reports without a target id", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createRequest({
      targetType: "guestbook",
      reason: "spam",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(400);
  });
});
