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

const invitationId = "00000000-0000-4000-8000-000000000010";

function createRequest(invitationIdValue = invitationId) {
  return new Request("https://invitehub.test/api/payments/free-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invitationId: invitationIdValue })
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

function createAdminClient(pricey = false) {
  const updateQuery = {
    eq: vi.fn(() => updateQuery),
    then(resolve: (value: { error: null }) => void) {
      return Promise.resolve({ error: null }).then(resolve);
    }
  };
  const selectQuery = {
    eq: vi.fn(() => selectQuery),
    async maybeSingle() {
      return {
        data: {
          id: invitationId,
          slug: "invite-123",
          title: "초대장",
          user_id: "user-1",
          payload: pricey
            ? { mainImageUrl: "https://example.com/a.jpg" }
            : {},
          status: "draft"
        },
        error: null
      };
    }
  };
  const update = vi.fn(() => ({
    eq: updateQuery.eq
  }));

  return {
    update,
    updateEq: updateQuery.eq,
    from(table: string) {
      if (table === "invitations") {
        return {
          select() {
            return selectQuery;
          },
          update,
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };
}

describe("POST /api/payments/free-publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH;
  });

  it("publishes when the current draft is free", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    const admin = createAdminClient(false);
    createSupabaseAdminClientMock.mockReturnValue(admin);

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.slug).toBe("invite-123");
    expect(admin.updateEq).toHaveBeenCalledWith("id", invitationId);
    expect(admin.updateEq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("blocks free publish when paid add-ons exist", async () => {
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(true));

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("유료 항목");
  });

  it("rejects non-json publish requests", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    createSupabaseAdminClientMock.mockReturnValue(createAdminClient(false));

    const response = await POST(createTextRequest());
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.message).toContain("JSON");
  });

  it("rejects malformed invitation ids before querying", async () => {
    createServerSupabaseClientMock.mockResolvedValue(createServerClient("user-1"));
    const admin = createAdminClient(false);
    createSupabaseAdminClientMock.mockReturnValue(admin);

    const response = await POST(createRequest("invitation-1"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("초대장");
    expect(admin.update).not.toHaveBeenCalled();
  });
});
