import { vi } from "vitest";

const { createSupabaseAdminClientMock, getUserMock, rpcMock, uploadMock } = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  getUserMock: vi.fn(),
  rpcMock: vi.fn(),
  uploadMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

import { POST } from "@/app/api/public/guest-upload/route";

type TestUploadFile = {
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
};

function jpegFile(width = 1600, height = 1067, paddingBytes = 0): TestUploadFile {
  const bytes = new Uint8Array(23 + paddingBytes);
  bytes.set([
    0xff, 0xd8,
    0xff, 0xe0, 0x00, 0x04, 0x00, 0x00,
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00,
    0xff, 0xd9
  ]);
  return {
    size: bytes.byteLength,
    type: "image/jpeg",
    async arrayBuffer() {
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    }
  };
}

function requestWith(file: TestUploadFile = jpegFile(), options: { token?: string; idempotencyKey?: string; ip?: string } = {}) {
  const request = new Request("https://invitehub.test/api/public/guest-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.token ?? "guest-access-token"}`,
      "Idempotency-Key": options.idempotencyKey ?? "guest-upload-draft-main-0001",
      "x-forwarded-for": options.ip ?? "203.0.113.20",
      "content-type": "multipart/form-data; boundary=invitehub-test-boundary",
      "content-length": String(file.size + 1024)
    }
  });
  Object.defineProperty(request, "formData", {
    value: async () => ({ get: (name: string) => name === "file" ? file : null }) as FormData
  });
  return request;
}

describe("POST /api/public/guest-upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
    process.env.RATE_LIMIT_FINGERPRINT_SECRET = "test-rate-limit-fingerprint-secret-32-bytes-minimum";
    getUserMock.mockResolvedValue({ data: { user: { id: "guest-user-1" } }, error: null });
    rpcMock.mockResolvedValue({
      data: [{ allowed: true, remaining: 9, reset_at: new Date(Date.now() + 60_000).toISOString() }],
      error: null
    });
    uploadMock.mockResolvedValue({ data: { path: "guest-user-1/guest/photo.jpg" }, error: null });
    createSupabaseAdminClientMock.mockReturnValue({
      auth: { getUser: getUserMock },
      rpc: rpcMock,
      storage: {
        from: () => ({ upload: uploadMock })
      }
    });
  });

  it("uploads a validated photo to the authenticated guest prefix behind persistent quotas", async () => {
    const response = await POST(requestWith());
    const result = await response.json();

    expect(response.status, JSON.stringify(result)).toBe(200);
    expect(result).toMatchObject({ success: true, path: "guest-user-1/guest/photo.jpg" });
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^guest-user-1\/guest\/[a-f0-9]{64}\.jpg$/),
      expect.any(Uint8Array),
      expect.objectContaining({ contentType: "image/jpeg", upsert: false })
    );
    const bucketKeys = rpcMock.mock.calls.map(([, args]) => String(args.bucket_key));
    expect(bucketKeys).toEqual(expect.arrayContaining([
      expect.stringMatching(/^guest_upload:user:burst:[a-f0-9]{64}$/),
      expect.stringMatching(/^guest_upload:fingerprint:daily:fp1_/),
      "guest_upload:global:daily",
      expect.stringMatching(/^guest_upload:idempotency:[a-f0-9]{64}$/)
    ]));
    expect(bucketKeys.join(" ")).not.toContain("203.0.113.20");
    expect(bucketKeys.join(" ")).not.toContain("guest-access-token");
  });

  it("rejects missing auth, invalid JPEGs, and oversized images before storage write", async () => {
    const missingAuth = requestWith();
    missingAuth.headers.delete("Authorization");
    expect((await POST(missingAuth)).status).toBe(401);

    const fakeBytes = new Uint8Array([1, 2, 3]);
    expect((await POST(requestWith({
      size: fakeBytes.byteLength,
      type: "image/jpeg",
      async arrayBuffer() {
        return fakeBytes.buffer as ArrayBuffer;
      }
    }))).status).toBe(400);
    const oversized = await POST(requestWith(jpegFile(1600, 1067, 2 * 1024 * 1024)));
    expect(oversized.status, JSON.stringify(await oversized.clone().json())).toBe(413);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects unbounded or non-multipart bodies before authentication and parsing", async () => {
    const missingLength = requestWith();
    missingLength.headers.delete("content-length");
    expect((await POST(missingLength)).status).toBe(411);

    const wrongType = requestWith();
    wrongType.headers.set("content-type", "application/octet-stream");
    expect((await POST(wrongType)).status).toBe(415);
    expect(getUserMock).not.toHaveBeenCalled();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("fails closed on missing production secret, quota backend failure, and replay", async () => {
    delete process.env.RATE_LIMIT_FINGERPRINT_SECRET;
    process.env.VERCEL_ENV = "preview";
    expect((await POST(requestWith())).status).toBe(503);
    expect(uploadMock).not.toHaveBeenCalled();

    process.env.RATE_LIMIT_FINGERPRINT_SECRET = "test-rate-limit-fingerprint-secret-32-bytes-minimum";
    delete process.env.VERCEL_ENV;
    rpcMock.mockResolvedValue({ data: null, error: { message: "offline" } });
    expect((await POST(requestWith())).status).toBe(503);

    rpcMock.mockImplementation(async (_name, args: { bucket_key: string }) => ({
      data: [{
        allowed: !args.bucket_key.startsWith("guest_upload:idempotency:"),
        remaining: 0,
        reset_at: new Date(Date.now() + 60_000).toISOString()
      }],
      error: null
    }));
    expect((await POST(requestWith())).status).toBe(409);
    expect(uploadMock).not.toHaveBeenCalled();
  });
});
