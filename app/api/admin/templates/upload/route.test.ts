import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canonicalize: vi.fn(),
  consume: vi.fn(),
  createAdmin: vi.fn(),
  createServer: vi.fn(),
  getClient: vi.fn(),
  getPrivate: vi.fn(),
  isAdmin: vi.fn(),
  quota: vi.fn(),
  upload: vi.fn(),
  sign: vi.fn(),
  remove: vi.fn()
}));

vi.mock("@/lib/invitation-upload-security", () => ({
  InvitationImageValidationError: class extends Error {},
  UserStorageQuotaError: class extends Error {},
  canonicalizeInvitationImage: mocks.canonicalize,
  enforceUserStorageQuota: mocks.quota
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimits: mocks.consume,
  getClientIdentifier: mocks.getClient,
  getPrivacySafeIdentifier: mocks.getPrivate
}));
vi.mock("@/lib/template-admin", () => ({ isTemplateAdminEmail: mocks.isAdmin }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: mocks.createAdmin }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mocks.createServer }));

import { POST } from "@/app/api/admin/templates/upload/route";

function request() {
  const file = new File([Buffer.from([0xff, 0xd8, 0xff])], "template.jpg", { type: "image/jpeg" });
  Object.defineProperty(file, "arrayBuffer", { value: vi.fn().mockResolvedValue(Uint8Array.from([1, 2, 3]).buffer) });
  const form = new FormData();
  form.set("file", file);
  const result = new Request("https://invitehub.test/api/admin/templates/upload", {
    method: "POST",
    headers: { "Content-Length": "1024", "x-real-ip": "203.0.113.10" }
  });
  Object.defineProperty(result, "formData", { value: vi.fn().mockResolvedValue(form) });
  return result;
}

describe("POST /api/admin/templates/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INVITATION_ASSET_ACCESS_ENABLED = "true";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    mocks.createServer.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "admin-1", email: "admin@example.com" } }, error: null }) }
    });
    mocks.createAdmin.mockReturnValue({
      storage: { from: vi.fn().mockReturnValue({ upload: mocks.upload, createSignedUrl: mocks.sign, remove: mocks.remove }) }
    });
    mocks.isAdmin.mockReturnValue(true);
    mocks.getClient.mockReturnValue("v1:client");
    mocks.getPrivate.mockReturnValue(`v1:${"a".repeat(64)}`);
    mocks.consume.mockResolvedValue({ ok: true, allowed: true, remaining: 1, resetAt: Date.now() + 60_000 });
    mocks.canonicalize.mockResolvedValue({ buffer: Buffer.from("canonical"), contentType: "image/jpeg", extension: "jpg" });
    mocks.quota.mockResolvedValue({ alreadyExists: false, objectCount: 0, totalBytes: 0 });
    mocks.upload.mockImplementation(async (path: string) => ({ data: { path }, error: null }));
    mocks.sign.mockResolvedValue({
      data: { signedUrl: "https://example.supabase.co/storage/v1/object/sign/invitation-assets/file?token=test" }, error: null
    });
    mocks.remove.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    delete process.env.INVITATION_ASSET_ACCESS_ENABLED;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("canonicalizes, meters, stores content-addressed bytes, and returns a short signed URL", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.consume).toHaveBeenCalledWith(expect.objectContaining({
      policies: expect.arrayContaining([expect.objectContaining({ key: "template_asset:global:daily" })])
    }));
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^admin-1\/templates\/[a-f0-9]{64}\.jpg$/),
      Buffer.from("canonical"),
      expect.objectContaining({ upsert: false })
    );
    expect(JSON.stringify(mocks.consume.mock.calls)).not.toContain("admin-1");
  });

  it("fails closed for a non-admin, quota uncertainty, and disabled kill switch", async () => {
    mocks.isAdmin.mockReturnValueOnce(false);
    expect((await POST(request())).status).toBe(403);
    expect(mocks.upload).not.toHaveBeenCalled();

    mocks.consume.mockResolvedValueOnce({ ok: false, message: "unavailable" });
    expect((await POST(request())).status).toBe(503);
    expect(mocks.upload).not.toHaveBeenCalled();

    delete process.env.INVITATION_ASSET_ACCESS_ENABLED;
    expect((await POST(request())).status).toBe(503);
    expect(mocks.createServer).toHaveBeenCalledTimes(2);
  });

  it("removes a newly created object when signed URL creation fails", async () => {
    mocks.sign.mockResolvedValueOnce({ data: null, error: new Error("provider detail") });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(mocks.remove).toHaveBeenCalledWith([expect.stringMatching(/^admin-1\/templates\//)]);
    expect(await response.text()).not.toContain("provider detail");
  });
});
