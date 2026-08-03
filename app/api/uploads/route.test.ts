import { vi } from "vitest";

const {
  canonicalizeInvitationImageMock,
  createSupabaseAdminClientMock,
  createClientMock,
  createServerSupabaseClientMock,
  bearerGetUserMock,
  consumeRateLimitsMock,
  enforceUserStorageQuotaMock,
  getClientIdentifierMock,
  getPrivacySafeIdentifierMock,
  isAccountDeletionPendingMock,
  uploadMock,
  createSignedUrlMock,
  removeMock
} = vi.hoisted(() => ({
  canonicalizeInvitationImageMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  createClientMock: vi.fn(),
  createServerSupabaseClientMock: vi.fn(),
  bearerGetUserMock: vi.fn(),
  consumeRateLimitsMock: vi.fn(),
  enforceUserStorageQuotaMock: vi.fn(),
  getClientIdentifierMock: vi.fn(),
  getPrivacySafeIdentifierMock: vi.fn(),
  isAccountDeletionPendingMock: vi.fn(),
  uploadMock: vi.fn(),
  createSignedUrlMock: vi.fn(),
  removeMock: vi.fn()
}));

vi.mock("@/lib/invitation-upload-security", () => ({
  InvitationImageValidationError: class extends Error {},
  UserStorageQuotaError: class extends Error {},
  canonicalizeInvitationImage: canonicalizeInvitationImageMock,
  enforceUserStorageQuota: enforceUserStorageQuotaMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: consumeRateLimitsMock,
  getClientIdentifier: getClientIdentifierMock,
  getPrivacySafeIdentifier: getPrivacySafeIdentifierMock
}));

vi.mock("@/lib/account-deletion", () => ({
  isAccountDeletionPending: isAccountDeletionPendingMock
}));

import { DELETE, GET, POST } from "@/app/api/uploads/route";

function uploadRequest(file: File, token?: string) {
  Object.defineProperty(file, "arrayBuffer", {
    value: vi.fn().mockResolvedValue(Uint8Array.from([0xff, 0xd8, 0xff]).buffer)
  });
  const formData = new FormData();
  formData.set("file", file);
  const request = new Request("https://invitehub.test/api/uploads", {
    method: "POST",
    headers: {
      "Content-Length": "1024",
      "x-real-ip": "203.0.113.10",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  Object.defineProperty(request, "formData", {
    value: vi.fn().mockResolvedValue(formData)
  });
  return request;
}

describe("POST /api/uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.INVITATION_ASSET_ACCESS_ENABLED = "true";
    process.env.RATE_LIMIT_FINGERPRINT_KEY_V1 = "test-rate-limit-fingerprint-key-32-bytes";
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } })
      }
    });
    bearerGetUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    createClientMock.mockReturnValue({
      auth: {
        getUser: bearerGetUserMock
      }
    });
    createSupabaseAdminClientMock.mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          upload: uploadMock,
          createSignedUrl: createSignedUrlMock,
          remove: removeMock
        })
      }
    });
    canonicalizeInvitationImageMock.mockResolvedValue({
      buffer: Buffer.from("canonical-image"),
      contentType: "image/jpeg",
      extension: "jpg"
    });
    enforceUserStorageQuotaMock.mockResolvedValue({ alreadyExists: false, objectCount: 0, totalBytes: 0 });
    getClientIdentifierMock.mockReturnValue("v1:fingerprint");
    getPrivacySafeIdentifierMock.mockReturnValue(`v1:${"a".repeat(64)}`);
    isAccountDeletionPendingMock.mockResolvedValue(false);
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    uploadMock.mockImplementation(async (path: string) => ({ data: { path }, error: null }));
    createSignedUrlMock.mockResolvedValue({
      data: { signedUrl: "https://example.supabase.co/storage/v1/object/sign/invitation-assets/image?token=test" },
      error: null
    });
    removeMock.mockResolvedValue({ data: [], error: null });
  });

  it("validates, canonicalizes, checks aggregate quota, then uploads sanitized bytes", async () => {
    const response = await POST(
      uploadRequest(new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" }))
    );

    expect(response.status).toBe(200);
    expect(canonicalizeInvitationImageMock).toHaveBeenCalledWith(expect.any(Buffer), "image/jpeg");
    expect(enforceUserStorageQuotaMock).toHaveBeenCalledWith(
      expect.objectContaining({ upload: uploadMock }),
      "user-1",
      Buffer.byteLength("canonical-image"),
      expect.stringMatching(/^user-1\/[a-f0-9]{64}\.jpg$/)
    );
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/[a-f0-9]{64}\.jpg$/),
      expect.any(Buffer),
      expect.objectContaining({ contentType: "image/jpeg", upsert: false })
    );
    expect(consumeRateLimitsMock).toHaveBeenCalledWith(expect.objectContaining({
      policies: expect.arrayContaining([
        expect.objectContaining({ key: expect.stringMatching(/^upload:user:v1:[a-f0-9]{64}:burst$/) }),
        expect.objectContaining({ key: "upload:client:v1:fingerprint:daily" }),
        expect.objectContaining({ key: "upload:global:daily" })
      ])
    }));
  });

  it("accepts the mobile bearer session and reuses an existing deterministic object", async () => {
    uploadMock.mockResolvedValueOnce({
      data: null,
      error: { statusCode: "409", message: "already exists" }
    });

    const response = await POST(
      uploadRequest(
        new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" }),
        "mobile-access-token"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(bearerGetUserMock).toHaveBeenCalledWith("mobile-access-token");
    expect(payload.created).toBe(false);
    expect(payload.path).toMatch(/^user-1\/[a-f0-9]{64}\.jpg$/);
    expect(createSignedUrlMock).toHaveBeenCalledWith(payload.path, expect.any(Number));
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("fails closed when authentication returns a user together with an error", async () => {
    bearerGetUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: new Error("auth backend uncertain")
    });

    const response = await POST(
      uploadRequest(
        new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" }),
        "mobile-access-token"
      )
    );

    expect(response.status).toBe(401);
    expect(consumeRateLimitsMock).not.toHaveBeenCalled();
    expect(canonicalizeInvitationImageMock).not.toHaveBeenCalled();
  });

  it("does not create orphan storage cost after an account tombstone", async () => {
    isAccountDeletionPendingMock.mockResolvedValueOnce(true);
    const response = await POST(uploadRequest(
      new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" })
    ));
    expect(response.status).toBe(423);
    expect(canonicalizeInvitationImageMock).not.toHaveBeenCalled();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("skips the storage write for a proven content-addressed retry", async () => {
    enforceUserStorageQuotaMock.mockResolvedValueOnce({
      alreadyExists: true,
      objectCount: 100,
      totalBytes: 1024
    });

    const response = await POST(uploadRequest(
      new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" }),
      "mobile-access-token"
    ));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.created).toBe(false);
    expect(uploadMock).not.toHaveBeenCalled();
    expect(createSignedUrlMock).toHaveBeenCalledWith(payload.path, expect.any(Number));
  });

  it("fails closed without uploading when validation or quota inspection fails", async () => {
    canonicalizeInvitationImageMock.mockRejectedValueOnce(new Error("invalid image"));
    const invalidResponse = await POST(
      uploadRequest(new File([Buffer.from("bad")], "bad.jpg", { type: "image/jpeg" }))
    );
    expect(invalidResponse.status).toBe(400);
    expect(uploadMock).not.toHaveBeenCalled();

    canonicalizeInvitationImageMock.mockResolvedValueOnce({
      buffer: Buffer.from("canonical-image"),
      contentType: "image/jpeg",
      extension: "jpg"
    });
    enforceUserStorageQuotaMock.mockRejectedValueOnce(new Error("quota unavailable"));
    const quotaResponse = await POST(
      uploadRequest(new File([Buffer.from([0xff, 0xd8, 0xff])], "ok.jpg", { type: "image/jpeg" }))
    );
    expect(quotaResponse.status).toBe(503);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects missing request length and durable quota failures before image processing", async () => {
    const missingLength = uploadRequest(
      new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" })
    );
    missingLength.headers.delete("content-length");

    const missingLengthResponse = await POST(missingLength);
    expect(missingLengthResponse.status).toBe(411);
    expect(canonicalizeInvitationImageMock).not.toHaveBeenCalled();

    consumeRateLimitsMock.mockResolvedValueOnce({
      ok: false,
      message: "rate_limit_backend_unavailable"
    });
    const quotaResponse = await POST(uploadRequest(
      new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" })
    ));
    expect(quotaResponse.status).toBe(503);
    expect(canonicalizeInvitationImageMock).not.toHaveBeenCalled();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects traversal-shaped delete paths and deletes only canonical owner paths", async () => {
    const traversal = new Request("https://invitehub.test/api/uploads", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "upload-delete:invalid-path-1234",
        "x-real-ip": "203.0.113.10"
      },
      body: JSON.stringify({ path: "user-1/../victim/file.jpg" })
    });
    const traversalResponse = await DELETE(traversal);
    expect(traversalResponse.status).toBe(403);
    expect(removeMock).not.toHaveBeenCalled();

    const canonicalPath = `user-1/${"a".repeat(64)}.jpg`;
    const valid = new Request("https://invitehub.test/api/uploads", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `upload-delete:${canonicalPath.split("/")[1]}`,
        "x-real-ip": "203.0.113.10"
      },
      body: JSON.stringify({ path: canonicalPath })
    });
    const validResponse = await DELETE(valid);
    expect(validResponse.status).toBe(200);
    expect(removeMock).toHaveBeenCalledWith([canonicalPath]);
  });

  it("rejects an off-origin signed URL and removes only the newly created object", async () => {
    createSignedUrlMock.mockResolvedValueOnce({
      data: { signedUrl: "https://evil.example/signed" },
      error: null
    });
    const response = await POST(uploadRequest(
      new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" })
    ));
    expect(response.status).toBe(500);
    expect(removeMock).toHaveBeenCalledWith([expect.stringMatching(/^user-1\/[a-f0-9]{64}\.jpg$/)]);
  });

  it("does not sign or delete a provider-returned key that differs from the requested owner key", async () => {
    uploadMock.mockResolvedValueOnce({ data: { path: `other/${"b".repeat(64)}.jpg` }, error: null });
    const response = await POST(uploadRequest(
      new File([Buffer.from([0xff, 0xd8, 0xff])], "camera.jpg", { type: "image/jpeg" })
    ));
    expect(response.status).toBe(503);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith([expect.stringMatching(/^user-1\/[a-f0-9]{64}\.jpg$/)]);
    expect(JSON.stringify(removeMock.mock.calls)).not.toContain("other/");
  });
});

describe("GET /api/uploads owner signed URL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INVITATION_ASSET_ACCESS_ENABLED = "true";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.RATE_LIMIT_FINGERPRINT_KEY_V1 = "test-rate-limit-fingerprint-key-32-bytes";
    bearerGetUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    createClientMock.mockReturnValue({ auth: { getUser: bearerGetUserMock } });
    createSupabaseAdminClientMock.mockReturnValue({
      storage: { from: vi.fn().mockReturnValue({ createSignedUrl: createSignedUrlMock }) }
    });
    getClientIdentifierMock.mockReturnValue("v1:fingerprint");
    getPrivacySafeIdentifierMock.mockReturnValue(`v1:${"a".repeat(64)}`);
    isAccountDeletionPendingMock.mockResolvedValue(false);
    consumeRateLimitsMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    createSignedUrlMock.mockResolvedValue({
      data: { signedUrl: "https://example.supabase.co/storage/v1/object/sign/file?token=test" },
      error: null
    });
  });

  afterEach(() => {
    delete process.env.INVITATION_ASSET_ACCESS_ENABLED;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.RATE_LIMIT_FINGERPRINT_KEY_V1;
  });

  it("signs only one canonical owner path through server quotas", async () => {
    const path = `user-1/${"a".repeat(64)}.jpg`;
    const response = await GET(new Request(
      `https://invitehub.test/api/uploads?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: "Bearer token", "x-real-ip": "203.0.113.10" } }
    ));
    expect(response.status).toBe(200);
    expect(createSignedUrlMock).toHaveBeenCalledWith(path, expect.any(Number));
    expect(consumeRateLimitsMock).toHaveBeenCalledWith(expect.objectContaining({
      policies: expect.arrayContaining([
        expect.objectContaining({ key: expect.stringContaining("owner_asset:user:v1:") }),
        expect.objectContaining({ key: "owner_asset:global:daily", limit: 1_000 })
      ])
    }));
    expect(JSON.stringify(consumeRateLimitsMock.mock.calls)).not.toContain("user-1");
  });

  it("rejects another owner, traversal, transforms, and quota uncertainty before signing", async () => {
    const otherPath = `other/${"a".repeat(64)}.jpg`;
    expect((await GET(new Request(
      `https://invitehub.test/api/uploads?path=${encodeURIComponent(otherPath)}`,
      { headers: { Authorization: "Bearer token", "x-real-ip": "203.0.113.10" } }
    ))).status).toBe(403);

    const ownPath = `user-1/${"a".repeat(64)}.jpg`;
    expect((await GET(new Request(
      `https://invitehub.test/api/uploads?path=${encodeURIComponent(ownPath)}&transform=webp`,
      { headers: { Authorization: "Bearer token", "x-real-ip": "203.0.113.10" } }
    ))).status).toBe(400);

    consumeRateLimitsMock.mockResolvedValueOnce({ ok: false, message: "quota unavailable" });
    expect((await GET(new Request(
      `https://invitehub.test/api/uploads?path=${encodeURIComponent(ownPath)}`,
      { headers: { Authorization: "Bearer token", "x-real-ip": "203.0.113.10" } }
    ))).status).toBe(503);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });

  it("keeps the owner signer disabled by default and blocks tombstoned accounts", async () => {
    const path = `user-1/${"a".repeat(64)}.jpg`;
    delete process.env.INVITATION_ASSET_ACCESS_ENABLED;
    expect((await GET(new Request(
      `https://invitehub.test/api/uploads?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: "Bearer token", "x-real-ip": "203.0.113.10" } }
    ))).status).toBe(503);
    expect(bearerGetUserMock).not.toHaveBeenCalled();

    process.env.INVITATION_ASSET_ACCESS_ENABLED = "true";
    isAccountDeletionPendingMock.mockResolvedValueOnce(true);
    expect((await GET(new Request(
      `https://invitehub.test/api/uploads?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: "Bearer token", "x-real-ip": "203.0.113.10" } }
    ))).status).toBe(423);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });
});
