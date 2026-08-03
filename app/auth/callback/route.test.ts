import { vi } from "vitest";

const { createServerSupabaseClientMock, ensureProfileRowMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  ensureProfileRowMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/profile", () => ({
  ensureProfileRow: ensureProfileRowMock
}));

import { GET } from "@/app/auth/callback/route";

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureProfileRowMock.mockResolvedValue(undefined);
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null
        })
      }
    });
  });

  it.each([
    "/%5cevil.example",
    "/\\evil.example"
  ])("falls back to the dashboard for unsafe backslash redirect %s", async (nextPath) => {
    const response = await GET(new Request(
      `https://invitehub.test/auth/callback?code=valid&next=${encodeURIComponent(nextPath)}`
    ));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://invitehub.test/dashboard");
  });

  it("fails closed when code exchange does not produce a verified user", async () => {
    createServerSupabaseClientMock.mockResolvedValueOnce({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "session unavailable" }
        })
      }
    });

    const response = await GET(new Request(
      "https://invitehub.test/auth/callback?code=valid&next=%2Fdashboard"
    ));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/sign-in?error=oauth_callback_failed");
    expect(ensureProfileRowMock).not.toHaveBeenCalled();
  });
});
