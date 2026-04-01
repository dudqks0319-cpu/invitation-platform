import { vi } from "vitest";

const { createSupabaseAdminClientMock, createClientMock, deleteUserMock, getUserMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  createClientMock: vi.fn(),
  deleteUserMock: vi.fn(),
  getUserMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

import { POST } from "@/app/api/account/delete/route";

function createRequest(token = "token-1") {
  return new Request("https://invitehub.test/api/account/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    deleteUserMock.mockResolvedValue({ data: { user: null }, error: null });
    createClientMock.mockReturnValue({
      auth: {
        getUser: getUserMock
      }
    });
    createSupabaseAdminClientMock.mockReturnValue({
      auth: {
        admin: {
          deleteUser: deleteUserMock
        }
      }
    });
  });

  it("deletes the authenticated user", async () => {
    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(deleteUserMock).toHaveBeenCalledWith("user-1", false);
    expect(payload.success).toBe(true);
  });

  it("rejects requests without a bearer token", async () => {
    const response = await POST(new Request("https://invitehub.test/api/account/delete", { method: "POST" }));
    expect(response.status).toBe(401);
  });
});
