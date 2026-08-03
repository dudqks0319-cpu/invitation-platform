import { vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  consumeRateLimitsMock,
  getClientIdentifierMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  consumeRateLimitsMock: vi.fn(),
  getClientIdentifierMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: consumeRateLimitsMock,
  getClientIdentifier: getClientIdentifierMock
}));

import { POST } from "@/app/api/public/[slug]/guestbook/route";
import { hashPublicWrite } from "@/lib/supabase/public-write";

function createRequest(body: object, idempotencyKey = "guestbook-request:123456") {
  return new Request("https://invitehub.test/api/public/demo/guestbook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": "203.0.113.10",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify(body)
  });
}

function createAdminDouble(
  insertError: { message: string } | null = null,
  invitation: { id: string; status: string } | null = {
    id: "invitation-1",
    status: "published"
  },
  existingWrite: { id: string; request_hash: string } | null = null
) {
  const insertMock = vi.fn(async () => ({ error: insertError }));

  return {
    insertMock,
    client: {
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
                data: invitation,
                error: null
              };
            }
          };
        }

        if (table === "guestbook_entries") {
          return {
            insert: insertMock,
            select() {
              return this;
            },
            eq() {
              return this;
            },
            async maybeSingle() {
              return { data: existingWrite, error: null };
            }
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("POST /api/public/[slug]/guestbook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 2,
      resetAt: Date.now() + 60_000
    });
    getClientIdentifierMock.mockReturnValue("v1:fingerprint");
  });

  it("validates the slug and invitation before creating a durable limiter row", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "%5cinvalid" })
    });

    expect(response.status).toBe(404);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });

  it("does not create a limiter row for a missing published invitation", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble(null, null).client
    );

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "missing-invitation" })
    });

    expect(response.status).toBe(404);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the persistent rate-limit backend is unavailable", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);
    consumeRateLimitsMock.mockResolvedValue({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
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
      createAdminDouble({ message: "new row violates row-level security policy" }).client
    );

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "방명록 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("returns an idempotent replay without another quota charge or insert", async () => {
    const requestHash = hashPublicWrite("guestbook-request", JSON.stringify({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }));
    const adminDouble = createAdminDouble(null, undefined, {
      id: "guestbook-1",
      request_hash: requestHash
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(200);
    expect(consumeRateLimitsMock).toHaveBeenCalled();
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
  });

  it("requires idempotency before database or quota work", async () => {
    const response = await POST(createRequest({
      nickname: "친구1",
      message: "축하합니다",
      website: ""
    }, ""), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(400);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });
});
