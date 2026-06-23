import { vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  consumeRateLimitMock,
  getClientIdentifierMock,
  hashClientIdentifierMock,
  checkPublicAbuseBlockMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  getClientIdentifierMock: vi.fn(),
  hashClientIdentifierMock: vi.fn(),
  checkPublicAbuseBlockMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  getClientIdentifier: getClientIdentifierMock,
  hashClientIdentifier: hashClientIdentifierMock
}));

vi.mock("@/lib/public-abuse", () => ({
  checkPublicAbuseBlock: checkPublicAbuseBlockMock
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
  invitationPayload?: Record<string, unknown>;
  variant?: {
    id: string;
    slug: string;
    audienceKey: string;
    audienceLabel: string;
    payloadPatch?: Record<string, unknown>;
    sectionPatch?: Record<string, unknown>;
  };
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

              return {
                data: {
                  id: "invitation-1",
                  slug: "demo",
                  title: "테스트 초대장",
                  category: "wedding",
                  template_id: "wedding-classic",
                  status: "published",
                  published_at: "2026-04-12T00:00:00.000Z",
                  payload: options?.invitationPayload ?? {}
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
                  payload_patch: options.variant.payloadPatch ?? {},
                  section_patch: options.variant.sectionPatch ?? {},
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
    hashClientIdentifierMock.mockReturnValue("client-hash");
    checkPublicAbuseBlockMock.mockResolvedValue({
      ok: true,
      blocked: false
    });
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
      memo: "사정이 생겼어요",
      client_hash: "client-hash"
    });
    expect(result).toEqual({
      success: true,
      message: "RSVP가 저장되었습니다."
    });
  });

  it("stores variant attribution when RSVP is submitted through a variant slug", async () => {
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
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo-friends" })
    });

    expect(response.status).toBe(200);
    expect(hashClientIdentifierMock).toHaveBeenCalledWith("203.0.113.10");
    expect(consumeRateLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      key: "rsvp:demo-friends:client-hash"
    }));
    expect(adminDouble.insertMock).toHaveBeenCalledWith({
      invitation_id: "invitation-1",
      variant_id: "variant-1",
      guest_name: "박하객",
      guest_phone: null,
      attending: true,
      guests: 1,
      memo: null,
      client_hash: "client-hash"
    });
  });

  it("blocks RSVP writes for clients blocked by moderation", async () => {
    const adminDouble = createAdminDouble();
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);
    checkPublicAbuseBlockMock.mockResolvedValue({
      ok: true,
      blocked: true
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

    expect(response.status).toBe(403);
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: "운영 정책에 따라 공개 응답 제출이 제한되었습니다."
    });
  });

  it("rejects RSVP writes when the invitation section policy disables RSVP", async () => {
    const adminDouble = createAdminDouble({
      invitationPayload: {
        sections: {
          rsvp: false
        }
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(403);
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
    expect(adminDouble.updateMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: "이 초대장은 RSVP 기능이 꺼져 있습니다."
    });
  });
});
