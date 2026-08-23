import { vi } from "vitest";

const { createSupabaseAdminClientMock, fromMock, rpcMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  fromMock: vi.fn(),
  rpcMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { GET } from "@/app/api/public/assets/route";

function createAdminDouble() {
  return {
    rpc: rpcMock,
    from(table: string) {
      fromMock(table);
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
    process.env.RATE_LIMIT_FINGERPRINT_SECRET = "test-rate-limit-fingerprint-secret-32-bytes-minimum";
    rpcMock.mockResolvedValue({
      data: [{ allowed: true, remaining: 119, reset_at: new Date(Date.now() + 60_000).toISOString() }],
      error: null
    });
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble());
  });

  afterEach(() => {
    delete process.env.RATE_LIMIT_FINGERPRINT_SECRET;
  });

  it("redirects to a short-lived signed asset url for published invitations", async () => {
    const response = await GET(
      new Request("https://invitehub.test/api/public/assets?slug=invite-123&path=user-1/main.jpg", {
        headers: { "x-forwarded-for": "203.0.113.20" }
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://storage.example.com/signed");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
    const bucketKeys = rpcMock.mock.calls.map(([, args]) => String(args.bucket_key));
    expect(bucketKeys).toEqual(expect.arrayContaining([
      expect.stringMatching(/^public_asset:burst:fp1_/),
      "public_asset:global:daily"
    ]));
    expect(bucketKeys.join(" ")).not.toContain("203.0.113.20");
  });

  it("fails closed before storage lookup when persistent quota is unavailable", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "offline" } });

    const response = await GET(
      new Request("https://invitehub.test/api/public/assets?slug=invite-123&path=user-1/main.jpg", {
        headers: { "x-forwarded-for": "203.0.113.20" }
      })
    );

    expect(response.status).toBe(503);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
