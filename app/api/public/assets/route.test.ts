import { vi } from "vitest";

const { createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { GET } from "@/app/api/public/assets/route";

function createAdminDouble(options?: {
  variant?: {
    id: string;
    slug: string;
  };
  payload?: Record<string, unknown>;
}) {
  return {
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
                slug: "invite-123",
                title: "테스트 초대장",
                category: "wedding",
                template_id: "wedding-classic",
                status: "published",
                published_at: "2026-04-12T00:00:00.000Z",
                payload: options?.payload ?? {
                  mainImagePath: "user-1/main.jpg"
                }
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
                audience_key: "friends",
                audience_label: "친구용",
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
        }
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from() {
        return {
          async createSignedUrl() {
            return {
              data: {
                signedUrl: "https://storage.example.com/signed"
              },
              error: null
            };
          }
        };
      }
    }
  };
}

describe("GET /api/public/assets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble());
  });

  it("redirects to a short-lived signed asset url for published invitations", async () => {
    const response = await GET(
      new Request("https://invitehub.test/api/public/assets?slug=invite-123&path=user-1/main.jpg")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://storage.example.com/signed");
  });

  it("allows slot photo assets through an active variant slug", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble({
      variant: {
        id: "variant-1",
        slug: "invite-123-friends"
      },
      payload: {
        photoPlacements: [
          {
            slotKey: "main",
            assetPath: "user-1/slot.webp",
            crop: { x: 0.5, y: 0.5, scale: 1 },
            fit: "cover"
          }
        ]
      }
    }));

    const response = await GET(
      new Request("https://invitehub.test/api/public/assets?slug=invite-123-friends&path=user-1/slot.webp")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://storage.example.com/signed");
  });
});
