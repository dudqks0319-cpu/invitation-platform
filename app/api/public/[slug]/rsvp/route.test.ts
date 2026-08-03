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

import { POST } from "@/app/api/public/[slug]/rsvp/route";
import { hashPublicWrite } from "@/lib/supabase/public-write";

function createRequest(body: object, idempotencyKey = "rsvp-request:1234567890") {
  return new Request("https://invitehub.test/api/public/demo/rsvp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": "203.0.113.10",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify(body)
  });
}

function createAdminDouble(options?: {
  insertError?: { message: string } | null;
  existingWrite?: { id: string; request_hash: string } | null;
  invitation?: { id: string; status: string } | null;
}) {
  const insertError = options?.insertError ?? null;
  const insertMock = vi.fn(async () => ({ error: insertError }));
  const updateMock = vi.fn(() => ({
    eq: vi.fn(async () => ({ error: null }))
  }));

  return {
    insertMock,
    updateMock,
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
                data: options && "invitation" in options
                  ? options.invitation
                  : {
                      id: "invitation-1",
                      status: "published"
                    },
                error: null
              };
            }
          };
        }

        if (table === "rsvps") {
          return {
            insert: insertMock,
            update: updateMock,
            select() {
              return this;
            },
            eq() {
              return this;
            },
            is() {
              return this;
            },
            async maybeSingle() {
              return {
                data: options?.existingWrite ?? null,
                error: null
              };
            }
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("POST /api/public/[slug]/rsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    getClientIdentifierMock.mockReturnValue("v1:fingerprint");
  });

  it("validates the slug and invitation before creating a durable limiter row", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "../invalid" })
    });

    expect(response.status).toBe(404);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });

  it("does not create a limiter row for a missing published invitation", async () => {
    createSupabaseAdminClientMock.mockReturnValue(
      createAdminDouble({ invitation: null }).client
    );

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
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
      guestName: "박하객",
      attending: "yes",
      guests: 1,
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
      createAdminDouble({ insertError: { message: "duplicate key value violates unique constraint" } }).client
    );

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toEqual({
      success: false,
      message: "RSVP 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("never overwrites an existing RSVP based only on public identity fields", async () => {
    const adminDouble = createAdminDouble();
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      guestName: "박하객",
      guestPhone: "010-1111-2222",
      attending: "no",
      guests: 0,
      memo: "사정이 생겼어요",
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(adminDouble.updateMock).not.toHaveBeenCalled();
    expect(adminDouble.insertMock).toHaveBeenCalledWith(expect.objectContaining({
      invitation_id: "invitation-1",
      guest_name: "박하객",
      guest_phone: "010-1111-2222",
      attending: false,
      guests: 0,
      memo: "사정이 생겼어요",
      idempotency_key_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      request_hash: expect.stringMatching(/^[a-f0-9]{64}$/)
    }));
    expect(result).toEqual({
      success: true,
      message: "RSVP가 저장되었습니다."
    });
  });

  it("returns an idempotent replay without another quota charge or insert", async () => {
    const body = {
      guestName: "박하객",
      guestPhone: "",
      attending: "yes",
      guests: 1,
      memo: "",
      website: ""
    };
    const adminDouble = createAdminDouble({
      existingWrite: {
        id: "rsvp-1",
        request_hash: hashPublicWrite("rsvp-request", JSON.stringify({
          guestName: "박하객",
          guestPhone: "",
          attending: true,
          guests: 1,
          memo: "",
          website: ""
        }))
      }
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest(body), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(200);
    expect(consumeRateLimitsMock).toHaveBeenCalled();
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
  });

  it("rejects an idempotency key reused with different RSVP content", async () => {
    const adminDouble = createAdminDouble({
      existingWrite: { id: "rsvp-1", request_hash: "different-request" }
    });
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(409);
    expect(consumeRateLimitsMock).toHaveBeenCalled();
    expect(adminDouble.insertMock).not.toHaveBeenCalled();
  });

  it("requires idempotency before database or quota work", async () => {
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble().client);

    const response = await POST(createRequest({
      guestName: "박하객",
      attending: "yes",
      guests: 1,
      website: ""
    }, ""), {
      params: Promise.resolve({ slug: "demo" })
    });

    expect(response.status).toBe(400);
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
  });
});
