import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/payments/revenuecat/publish/route";

const invitationId = "00000000-0000-4000-8000-000000000010";
const userId = "00000000-0000-4000-8000-000000000001";

function createRequest(body: Record<string, unknown>, accessToken = "access-token") {
  return new Request("https://invitehub.test/api/payments/revenuecat/publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify(body)
  });
}

function createTextRequest(accessToken = "access-token") {
  return new Request("https://invitehub.test/api/payments/revenuecat/publish", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: "not-json"
  });
}

function createAuthClient(authenticated = true) {
  return {
    auth: {
      async getUser() {
        return authenticated
          ? { data: { user: { email: "user@invitehub.test", id: userId } }, error: null }
          : { data: { user: null }, error: new Error("invalid") };
      }
    }
  };
}

function createAdminDouble(options: { credits?: boolean; pricey?: boolean } = {}) {
  const rpc = vi.fn().mockResolvedValue({
    data: [{ remaining_credits: options.credits === false ? 0 : 1, success: options.credits !== false }],
    error: null
  });

  const client = {
    rpc,
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
              id: invitationId,
              payload: options.pricey === false ? {} : { mainImageUrl: "https://example.com/main.jpg" },
              slug: "invite-123",
              user_id: userId
            },
            error: null
          };
        }
      };
    }
  };

  return { client, rpc };
}

describe("POST /api/payments/revenuecat/publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "true";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH;
  });

  it("publishes a paid invitation by consuming a RevenueCat-backed credit", async () => {
    createClientMock.mockReturnValue(createAuthClient());
    const admin = createAdminDouble();
    createSupabaseAdminClientMock.mockReturnValue(admin.client);

    const response = await POST(createRequest({ invitationId }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(payload).toEqual(expect.objectContaining({
      invitationId,
      slug: "invite-123",
      success: true
    }));
    expect(admin.rpc).toHaveBeenCalledWith("publish_invitation_with_credit", expect.objectContaining({
      p_invitation_id: invitationId,
      p_user_id: userId
    }));
  });

  it("blocks publishing when no webhook-backed credit is available yet", async () => {
    createClientMock.mockReturnValue(createAuthClient());
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble({ credits: false }).client);

    const response = await POST(createRequest({ invitationId }));
    const payload = await response.json();

    expect(response.status).toBe(402);
    expect(payload.message).toContain("발행권");
  });

  it("requires a logged-in user", async () => {
    createClientMock.mockReturnValue(createAuthClient(false));
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createRequest({ invitationId }, ""));

    expect(response.status).toBe(401);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects non-JSON paid publish requests before creating the service-role client", async () => {
    createClientMock.mockReturnValue(createAuthClient());
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createTextRequest());

    expect(response.status).toBe(415);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects malformed invitation ids before creating the service-role client", async () => {
    createClientMock.mockReturnValue(createAuthClient());
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createRequest({ invitationId: "not-a-uuid" }));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });
});
