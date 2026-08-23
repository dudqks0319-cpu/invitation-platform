import { vi } from "vitest";

const { createSupabaseAdminClientMock, getUserMock, listUsersMock, createUserMock, rpcMock, insertSelectSingleMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  getUserMock: vi.fn(),
  listUsersMock: vi.fn(),
  createUserMock: vi.fn(),
  rpcMock: vi.fn(),
  insertSelectSingleMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/public/guest-publish/route";

function createRequest(
  payload: Record<string, unknown>,
  options: { idempotencyKey?: string | null; ip?: string; token?: string } = {}
) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "x-forwarded-for": options.ip ?? "1.2.3.4"
  });
  if (options.idempotencyKey !== null) {
    headers.set("Idempotency-Key", options.idempotencyKey ?? "guest-publish-test-key-0001");
  }
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  return new Request("https://invitehub.test/api/public/guest-publish", {
    method: "POST",
    headers,
    body: JSON.stringify({
      payload,
      website: ""
    })
  });
}

function createFreePayload() {
  return {
    title: "결혼식 초대장",
    eventDateTime: "2026-05-10T14:00",
    venueName: "더파인 웨딩홀",
    venueAddress: "서울 강남구 테헤란로 123",
    groomName: "민준",
    brideName: "수아",
    templateId: "wedding-classic",
    category: "wedding"
  };
}

const insertMock = vi.fn();

function createAdminDouble() {
  return {
    auth: {
      getUser: getUserMock,
      admin: {
        listUsers: listUsersMock,
        createUser: createUserMock
      }
    },
    rpc: rpcMock,
    from(table: string) {
      if (table !== "invitations") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        insert(payload: unknown) {
          insertMock(payload);
          return {
            select() {
              return {
                single: insertSelectSingleMock
              };
            }
          };
        }
      };
    }
  };
}

describe("POST /api/public/guest-publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SUPABASE_GUEST_PUBLISHER_USER_ID;
    delete process.env.VERCEL_ENV;
    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "false";
    process.env.RATE_LIMIT_FINGERPRINT_SECRET = "test-rate-limit-fingerprint-secret-32-bytes-minimum";
    createSupabaseAdminClientMock.mockReturnValue(createAdminDouble());
    listUsersMock.mockResolvedValue({
      data: { users: [{ id: "guest-user-1", email: "guest-publisher@invitehub.app" }] },
      error: null
    });
    createUserMock.mockResolvedValue({
      data: { user: { id: "guest-user-1" } },
      error: null
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: "guest-owner-1" } },
      error: null
    });
    rpcMock.mockResolvedValue({
      data: [{ allowed: true, remaining: 9, reset_at: new Date(Date.now() + 60000).toISOString() }],
      error: null
    });
    insertSelectSingleMock.mockResolvedValue({
      data: { id: "inv-1" },
      error: null
    });
  });

  it("publishes a free guest invitation", async () => {
    const response = await POST(createRequest(createFreePayload()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.invitationId).toBe("inv-1");
    expect(payload.ownerToken).toMatch(/^[A-Za-z0-9_-]{32,160}$/);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      paid_payload_snapshot: null,
      guest_owner_token_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      guest_owner_created_at: expect.any(String)
    }));
    const bucketKeys = rpcMock.mock.calls.map(([, args]) => String(args.bucket_key));
    expect(bucketKeys).toEqual(expect.arrayContaining([
      expect.stringMatching(/^guest_publish:burst:fp1_/),
      expect.stringMatching(/^guest_publish:rolling_hour:fp1_/),
      expect.stringMatching(/^guest_publish:daily:fp1_/),
      "guest_publish:global:burst",
      "guest_publish:global:daily",
      expect.stringMatching(/^guest_publish:idempotency:[a-f0-9]{64}$/)
    ]));
    expect(bucketKeys.join(" ")).not.toContain("1.2.3.4");
    expect(bucketKeys.join(" ")).not.toContain("guest-publish-test-key-0001");
  });

  it("fails closed with 503 when the persistent quota backend is unavailable", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "offline" } });

    const response = await POST(createRequest(createFreePayload()));

    expect(response.status).toBe(503);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a missing idempotency key before quota or write work", async () => {
    const response = await POST(createRequest(createFreePayload(), { idempotencyKey: null }));

    expect(response.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("fails closed in a production-like environment without a fingerprint secret", async () => {
    delete process.env.RATE_LIMIT_FINGERPRINT_SECRET;
    process.env.VERCEL_ENV = "preview";

    const response = await POST(createRequest(createFreePayload()));

    expect(response.status).toBe(503);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("fails closed when a production-like trusted client IP is invalid", async () => {
    process.env.VERCEL_ENV = "preview";
    const request = createRequest(createFreePayload());
    request.headers.set("x-real-ip", "not-an-ip");

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects an oversized payload before quota or write work", async () => {
    const response = await POST(createRequest({
      ...createFreePayload(),
      oversized: "x".repeat(2 * 1024 * 1024)
    }));

    expect(response.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it.each([
    ["burst", "guest_publish:burst:"],
    ["rolling", "guest_publish:rolling_hour:"],
    ["daily", "guest_publish:daily:"],
    ["global", "guest_publish:global:daily"]
  ])("blocks a consumed %s ceiling without inserting", async (_label, deniedKey) => {
    rpcMock.mockImplementation(async (_name, args: { bucket_key: string }) => ({
      data: [{
        allowed: !args.bucket_key.startsWith(deniedKey),
        remaining: 0,
        reset_at: new Date(Date.now() + 60_000).toISOString()
      }],
      error: null
    }));

    const response = await POST(createRequest(createFreePayload()));

    expect(response.status).toBe(429);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a duplicate idempotency ticket as replay", async () => {
    rpcMock.mockImplementation(async (_name, args: { bucket_key: string }) => ({
      data: [{
        allowed: !args.bucket_key.startsWith("guest_publish:idempotency:"),
        remaining: 0,
        reset_at: new Date(Date.now() + 60_000).toISOString()
      }],
      error: null
    }));

    const response = await POST(createRequest(createFreePayload()));

    expect(response.status).toBe(409);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("shares global ceilings when the client identifier rotates", async () => {
    await POST(createRequest(createFreePayload(), {
      idempotencyKey: "guest-publish-rotation-key-0001",
      ip: "203.0.113.20"
    }));
    const firstKeys = rpcMock.mock.calls.map(([, args]) => String(args.bucket_key));
    rpcMock.mockClear();

    await POST(createRequest(createFreePayload(), {
      idempotencyKey: "guest-publish-rotation-key-0002",
      ip: "203.0.113.21"
    }));
    const rotatedKeys = rpcMock.mock.calls.map(([, args]) => String(args.bucket_key));

    expect(firstKeys.filter((key) => key.startsWith("guest_publish:global:"))).toEqual([
      "guest_publish:global:burst",
      "guest_publish:global:daily"
    ]);
    expect(rotatedKeys.filter((key) => key.startsWith("guest_publish:global:"))).toEqual([
      "guest_publish:global:burst",
      "guest_publish:global:daily"
    ]);
    expect(firstKeys.find((key) => key.startsWith("guest_publish:daily:fp1_")))
      .not.toBe(rotatedKeys.find((key) => key.startsWith("guest_publish:daily:fp1_")));
  });

  it("uses a configured guest publisher user id without listing auth users", async () => {
    process.env.SUPABASE_GUEST_PUBLISHER_USER_ID = "00000000-0000-4000-8000-000000000001";

    const response = await POST(createRequest(createFreePayload()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(listUsersMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "00000000-0000-4000-8000-000000000001"
    }));
  });

  it("rejects an invalid configured guest publisher user id", async () => {
    process.env.SUPABASE_GUEST_PUBLISHER_USER_ID = "guest-publisher";

    const response = await POST(createRequest(createFreePayload()));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.message).toBe("게스트 발행 계정 설정이 올바르지 않습니다.");
    expect(listUsersMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("publishes server-uploaded photos for their authenticated guest owner in the free release", async () => {
    const ownedPath = `guest-owner-1/guest/${"a".repeat(64)}.jpg`;
    const response = await POST(
      createRequest({
        ...createFreePayload(),
        mainImagePath: ownedPath
      }, { token: "guest-access-token" })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(getUserMock).toHaveBeenCalledWith("guest-access-token");
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        mainImagePath: ownedPath,
        mainImageUrl: expect.stringContaining("/api/public/assets")
      })
    }));
  });

  it("rejects missing or foreign photo ownership before quota or insert", async () => {
    const ownedPath = `guest-owner-1/guest/${"a".repeat(64)}.jpg`;
    expect((await POST(createRequest({ ...createFreePayload(), mainImagePath: ownedPath }))).status).toBe(401);

    const foreignPath = `another-user/guest/${"b".repeat(64)}.jpg`;
    expect((await POST(createRequest(
      { ...createFreePayload(), mainImagePath: foreignPath },
      { token: "guest-access-token" }
    ))).status).toBe(403);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects unbound external photos and preserves the future paid gate when explicitly enabled", async () => {
    expect((await POST(createRequest({
      ...createFreePayload(),
      mainImageUrl: "https://example.com/main.jpg"
    }))).status).toBe(400);

    process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    const ownedPath = `guest-owner-1/guest/${"a".repeat(64)}.jpg`;
    const response = await POST(createRequest(
      { ...createFreePayload(), mainImagePath: ownedPath },
      { token: "guest-access-token" }
    ));
    expect(response.status).toBe(409);
  });

  it("accepts image text overlay inline image payloads over the default JSON limit", async () => {
    const response = await POST(
      createRequest({
        ...createFreePayload(),
        templateId: "image-text-overlay",
        mainImageUrl: `data:image/jpeg;base64,${"a".repeat(70 * 1024)}`
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
  });

  it("ignores unsafe guest supplied shareUrl values", async () => {
    const response = await POST(
      createRequest({
        ...createFreePayload(),
        shareUrl: "https://evil.example/<script>alert(1)</script>"
      })
    );

    expect(response.status).toBe(200);
    const inserted = insertMock.mock.calls[0]?.[0] as { slug?: string; payload?: { shareUrl?: string } };
    expect(inserted.slug).toMatch(/^iv-[a-z0-9]{10}$/);
    expect(inserted.slug).not.toContain("evil");
    expect(inserted.payload?.shareUrl).toBe(inserted.slug);
  });

  it("replaces legacy Korean guest supplied slugs with a short public slug", async () => {
    const response = await POST(
      createRequest({
        ...createFreePayload(),
        shareUrl: "결혼식-초대장-민준-수아-vdkk44"
      })
    );

    expect(response.status).toBe(200);
    const inserted = insertMock.mock.calls[0]?.[0] as { slug?: string; payload?: { shareUrl?: string } };
    expect(inserted.slug).toMatch(/^iv-[a-z0-9]{10}$/);
    expect(inserted.slug).not.toContain("결혼식");
    expect(inserted.payload?.shareUrl).toBe(inserted.slug);
  });
});
