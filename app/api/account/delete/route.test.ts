import { expect, vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  createClientMock,
  deleteUserMock,
  getUserMock,
  listFilesMock,
  removeFilesMock,
  storageFromMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  createClientMock: vi.fn(),
  deleteUserMock: vi.fn(),
  getUserMock: vi.fn(),
  listFilesMock: vi.fn(),
  removeFilesMock: vi.fn(),
  storageFromMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

import { POST } from "@/app/api/account/delete/route";

function createRequest(token = "token-1") {
  return new Request("https://invitehub.test/api/account/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    deleteUserMock.mockResolvedValue({ data: { user: null }, error: null });
    listFilesMock.mockResolvedValue({
      data: [
        { name: "main.jpg" },
        { name: "gallery.png" }
      ],
      error: null
    });
    removeFilesMock.mockResolvedValue({ data: null, error: null });
    storageFromMock.mockReturnValue({
      list: listFilesMock,
      remove: removeFilesMock
    });
    createClientMock.mockReturnValue({
      auth: {
        getUser: getUserMock
      }
    });
    createSupabaseAdminClientMock.mockReturnValue({
      auth: {
        admin: {
          deleteUser: deleteUserMock
        }
      },
      storage: {
        from: storageFromMock
      }
    });
  });

  it("removes user-owned storage files before deleting the authenticated user", async () => {
    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(storageFromMock).toHaveBeenCalledWith("invitation-assets");
    expect(listFilesMock).toHaveBeenCalledWith("user-1", {
      limit: 100,
      offset: 0,
      sortBy: {
        column: "name",
        order: "asc"
      }
    });
    expect(removeFilesMock).toHaveBeenCalledWith([
      "user-1/main.jpg",
      "user-1/gallery.png"
    ]);
    expect(deleteUserMock).toHaveBeenCalledWith("user-1", false);
    expect(removeFilesMock.mock.invocationCallOrder[0]).toBeLessThan(deleteUserMock.mock.invocationCallOrder[0]);
    expect(payload.success).toBe(true);
  });

  it("deletes the user when the storage prefix is empty", async () => {
    listFilesMock.mockResolvedValue({ data: [], error: null });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(removeFilesMock).not.toHaveBeenCalled();
    expect(deleteUserMock).toHaveBeenCalledWith("user-1", false);
  });

  it("does not delete the user when storage cleanup fails", async () => {
    removeFilesMock.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      success: false,
      message: "계정 데이터를 정리하지 못했습니다. 잠시 후 다시 시도해 주세요."
    });
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("does not expose raw provider errors when auth deletion fails", async () => {
    deleteUserMock.mockResolvedValue({ data: null, error: { message: "internal provider stack trace" } });

    const response = await POST(createRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      success: false,
      message: "계정 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요."
    });
  });

  it("rejects requests without a bearer token", async () => {
    const response = await POST(new Request("https://invitehub.test/api/account/delete", { method: "POST" }));
    expect(response.status).toBe(401);
  });
});
