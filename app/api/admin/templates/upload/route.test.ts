import { vi } from "vitest";

const { createServerSupabaseClientMock, createSupabaseAdminClientMock, isTemplateAdminEmailMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  isTemplateAdminEmailMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/template-admin", () => ({
  isTemplateAdminEmail: isTemplateAdminEmailMock
}));

import { POST } from "@/app/api/admin/templates/upload/route";
import { maxMultipartEnvelopeBytes, maxUploadBytes } from "@/lib/supabase/public-write";

function createServerClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: { id: "admin-1", email: "admin@invitehub.test" } } };
      }
    }
  };
}

function createFormDataRequest(formData: FormData) {
  return {
    headers: new Headers(),
    async formData() {
      return formData;
    }
  } as Request;
}

describe("POST /api/admin/templates/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue(createServerClient());
    createSupabaseAdminClientMock.mockReturnValue({
      storage: {
        from: vi.fn()
      }
    });
    isTemplateAdminEmailMock.mockReturnValue(true);
  });

  it("rejects cross-origin template uploads before auth work", async () => {
    const response = await POST(
      new Request("https://invitehub.test/api/admin/templates/upload", {
        method: "POST",
        headers: {
          host: "invitehub.test",
          origin: "https://evil.test"
        }
      })
    );

    expect(response.status).toBe(403);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects oversized template uploads before parsing form data", async () => {
    const response = await POST(
      new Request("https://invitehub.test/api/admin/templates/upload", {
        method: "POST",
        headers: {
          "content-length": String(maxUploadBytes + maxMultipartEnvelopeBytes + 1)
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload.message).toContain("5MB");
  });

  it("rejects spoofed template image bytes", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File([new TextEncoder().encode("<script>alert(1)</script>")], "template.webp", {
        type: "image/webp"
      })
    );

    const response = await POST(createFormDataRequest(formData));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("파일 형식");
  });
});
