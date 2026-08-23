import { describe, expect, it, vi } from "vitest";

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

import { GET } from "@/app/api/payments/revenuecat/credits/route";

const userId = "00000000-0000-4000-8000-000000000001";

function createRequest(accessToken = "access-token") {
  return new Request("https://invitehub.test/api/payments/revenuecat/credits", {
    method: "GET",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
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

function createAdminDouble(credits: number | null = 2) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: credits === null ? null : { credits },
    error: null
  });
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { client: { from }, eq, from, maybeSingle, select };
}

describe("GET /api/payments/revenuecat/credits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the signed-in user's remaining publish credits", async () => {
    createClientMock.mockReturnValue(createAuthClient());
    const admin = createAdminDouble(3);
    createSupabaseAdminClientMock.mockReturnValue(admin.client);

    const response = await GET(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Vary")).toBe("Authorization");
    expect(payload).toEqual({ success: true, credits: 3 });
    expect(admin.from).toHaveBeenCalledWith("publish_credits");
    expect(admin.eq).toHaveBeenCalledWith("user_id", userId);
  });

  it("returns zero credits when the user has no credit row yet", async () => {
    createClientMock.mockReturnValue(createAuthClient());
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble(null).client);

    const response = await GET(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true, credits: 0 });
  });

  it("requires a logged-in user", async () => {
    createClientMock.mockReturnValue(createAuthClient(false));
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await GET(createRequest(""));

    expect(response.status).toBe(401);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });
});
