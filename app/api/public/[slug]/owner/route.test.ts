import { vi } from "vitest";
import { createGuestOwnerToken, hashGuestOwnerToken } from "@/lib/guest-owner-token";

const {
  createSupabaseAdminClientMock,
  consumeRateLimitMock,
  getClientIdentifierMock
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  getClientIdentifierMock: vi.fn()
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  getClientIdentifier: getClientIdentifierMock
}));

import { DELETE } from "@/app/api/public/[slug]/owner/route";

function createRequest(ownerToken: string) {
  return new Request("https://invitehub.test/api/public/demo-owner/owner", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": "203.0.113.10"
    },
    body: JSON.stringify({
      ownerToken,
      website: ""
    })
  });
}

function createDeleteChain(deleteMock: ReturnType<typeof vi.fn>) {
  return {
    delete() {
      return {
        eq(column: string, value: string) {
          deleteMock(column, value);
          return Promise.resolve({ error: null });
        }
      };
    }
  };
}

function createAdminDouble(ownerToken: string) {
  const childDeleteMock = vi.fn();
  const invitationDeleteMock = vi.fn();

  return {
    childDeleteMock,
    invitationDeleteMock,
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
            maybeSingle() {
              return Promise.resolve({
                data: {
                  id: "invitation-1",
                  guest_owner_token_hash: hashGuestOwnerToken(ownerToken)
                },
                error: null
              });
            },
            delete() {
              return {
                eq(column: string, value: string) {
                  invitationDeleteMock(column, value);
                  return Promise.resolve({ error: null });
                }
              };
            }
          };
        }

        if (["guestbook_entries", "rsvps", "view_logs"].includes(table)) {
          return createDeleteChain(childDeleteMock);
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("DELETE /api/public/[slug]/owner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeRateLimitMock.mockResolvedValue({
      ok: true,
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60_000
    });
    getClientIdentifierMock.mockReturnValue("203.0.113.10");
  });

  it("deletes a guest-owned invitation with a matching owner token", async () => {
    const ownerToken = createGuestOwnerToken();
    const adminDouble = createAdminDouble(ownerToken);
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await DELETE(createRequest(ownerToken), {
      params: Promise.resolve({ slug: "demo-owner" })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({
      success: true,
      message: "초대장이 삭제되었습니다."
    });
    expect(adminDouble.childDeleteMock).toHaveBeenCalledWith("invitation_id", "invitation-1");
    expect(adminDouble.invitationDeleteMock).toHaveBeenCalledWith("id", "invitation-1");
  });

  it("rejects deletion when the owner token does not match", async () => {
    const ownerToken = createGuestOwnerToken();
    const adminDouble = createAdminDouble(ownerToken);
    createSupabaseAdminClientMock.mockReturnValue(adminDouble.client);

    const response = await DELETE(createRequest(createGuestOwnerToken()), {
      params: Promise.resolve({ slug: "demo-owner" })
    });
    const result = await response.json();

    expect(response.status).toBe(403);
    expect(result).toEqual({
      success: false,
      message: "삭제 권한을 확인하지 못했습니다."
    });
    expect(adminDouble.invitationDeleteMock).not.toHaveBeenCalled();
  });
});
