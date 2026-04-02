import { vi } from "vitest";

const { createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { GET } from "@/app/api/public/assets/route";

function createAdminDouble() {
  return {
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
        async maybeSingle() {
          return {
            data: {
              payload: {
                mainImagePath: "user-1/main.jpg"
              }
            },
            error: null
          };
        }
      };
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
});
