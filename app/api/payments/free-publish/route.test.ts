import { vi } from "vitest";

const { createServerSupabaseClientMock, createSupabaseAdminClientMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/payments/free-publish/route";

function createRequest(invitationId = "invitation-1") {
  return new Request("https://invitehub.test/api/payments/free-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invitationId })
  });
}

function createTextRequest() {
  return new Request("https://invitehub.test/api/payments/free-publish", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "invitation-1"
  });
}

function createServerClient(userId: string | null) {
  return {
    auth: {
      async getUser() {
        return { data: { user: userId ? { id: userId } : null } };
      }
    }
  };
}

const updateMock = vi.fn();

function createAdminClient(withPhotos = false) {
  return {
    from(table: string) {
      if (table === "invitations") {
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
                id: "invitation-1",
                slug: "invite-123",
                title: "초대장",
                user_id: "user-1",
                payload: withPhotos
                  ? { mainImageUrl: "https://example.com/a.jpg" }
                  : {},
                status: "draft"
              },
              error: null
            };
          },
          update(payload: unknown) {
            updateMock(payload);
            return {
              eq() {
                return Promise.resolve({ error: null });
              }
            };
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };
}

describe("POST /api/payments/free-publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMock.mockReset();
  });

  it("publishes when the current draft is free", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.slug).toBe("invite-123");
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        templateSnapshot: expect.objectContaining({
          templateAssetId: "wedding-classic",
          backgroundImageUrl: expect.stringContaining("/images/")
        })
      }),
      paid_payload_snapshot: expect.objectContaining({
        templateSnapshot: expect.objectContaining({
          templateAssetId: "wedding-classic"
        })
      })
    }));
  });

  it("publishes when the draft includes user photos", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(true));

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.slug).toBe("invite-123");
  });

  it("rejects non-json publish requests", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createTextRequest());
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.message).toContain("JSON");
  });
});
