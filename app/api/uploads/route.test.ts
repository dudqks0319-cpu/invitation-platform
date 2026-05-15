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

import { DELETE, POST } from "@/app/api/uploads/route";
import { maxMultipartEnvelopeBytes, maxUploadBytes } from "@/lib/supabase/public-write";

function createServerClient(userId = "user-1") {
  return {
    auth: {
      async getUser() {
        return { data: { user: { id: userId } } };
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

describe("/api/uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createServerSupabaseClientMock.mockResolvedValue(createServerClient());
    createSupabaseAdminClientMock.mockReturnValue({
      storage: {
        from: vi.fn()
      }
    });
  });

  it("rejects cross-origin upload requests before auth work", async () => {
    const response = await POST(
      new Request("https://invitehub.test/api/uploads", {
        method: "POST",
        headers: {
          host: "invitehub.test",
          origin: "https://evil.test"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.message).toContain("허용되지 않은 요청");
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects oversized multipart uploads before parsing form data", async () => {
    const response = await POST(
      new Request("https://invitehub.test/api/uploads", {
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

  it("rejects spoofed image bytes even when the MIME type is allowed", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File([new TextEncoder().encode("<svg onload=alert(1)>")], "photo.png", {
        type: "image/png"
      })
    );

    const response = await POST(createFormDataRequest(formData));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toContain("파일 형식");
  });

  it("rejects cross-origin delete requests before auth work", async () => {
    const response = await DELETE(
      new Request("https://invitehub.test/api/uploads", {
        method: "DELETE",
        headers: {
          host: "invitehub.test",
          origin: "https://evil.test"
        },
        body: JSON.stringify({ path: "user-1/photo.png" })
      })
    );

    expect(response.status).toBe(403);
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });
});
