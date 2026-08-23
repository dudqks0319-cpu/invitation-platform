import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyInvitationDraft } from "./invitation-shared";
import { getPublishAccess } from "./publish-access";
import { getMobileInvitationPricing } from "./payments/pricing";

const fromMock = vi.fn();
const storageFromMock = vi.fn();
const guestOwnerToken = "a".repeat(43);

vi.mock("./supabase", () => ({
  supabase: {
    from: fromMock,
    storage: {
      from: storageFromMock
    }
  }
}));

vi.mock("./share", () => ({
  getPublicInvitationUrl: (slug: string) => `https://invitehub.co.kr/i/${slug}`
}));

function createPayload() {
  return createEmptyInvitationDraft("owner-1").payload;
}

describe("mobile publish pricing gate", () => {
  beforeEach(() => {
    fromMock.mockReset();
    storageFromMock.mockReset();
    vi.unstubAllGlobals();
    process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH = "false";
    process.env.EXPO_PUBLIC_WEB_BASE_URL = "https://invitehub.test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH;
    delete process.env.EXPO_PUBLIC_WEB_BASE_URL;
  });

  it("still requires core fields before direct publish even when pricing is free", () => {
    const payload = createPayload();
    const access = getPublishAccess(payload);

    expect(getMobileInvitationPricing(payload).isFree).toBe(true);
    expect(access.canPublishDirectly).toBe(false);
    expect(access.missingFields).toContain("행사 일시");
  });

  it("allows capped photos in the current free direct-publish policy", () => {
    const payload = createPayload();
    payload.title = "우리 결혼합니다";
    payload.eventDateTime = "2026-05-23T14:00";
    payload.venueName = "더파인 웨딩홀";
    payload.venueAddress = "서울 강남구";
    payload.eventData.groom.name = "민준";
    payload.eventData.bride.name = "수아";
    payload.photos.mainUri = "https://cdn.invitehub.co.kr/main.jpg";

    const pricing = getMobileInvitationPricing(payload);
    const access = getPublishAccess(payload);

    expect(pricing.amount).toBe(0);
    expect(access.canPublishDirectly).toBe(true);
    expect(access.paidItems).toEqual([]);
  });

  it("preserves the future paid photo gate when explicitly enabled", async () => {
    process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH = "true";
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-05-23T14:00";
    draft.payload.venueName = "더파인 웨딩홀";
    draft.payload.venueAddress = "서울 강남구";
    draft.payload.eventData.groom.name = "민준";
    draft.payload.eventData.bride.name = "수아";
    draft.payload.photos.mainUri = "https://cdn.invitehub.co.kr/main.jpg";

    await expect(saveDraftToSupabase(draft, "owner-1", "published")).rejects.toThrow(
      "유료 옵션이 포함되어 있어 스토어 결제를 완료해야 공개할 수 있습니다."
    );
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("replaces legacy Korean draft slugs before guest publishing", async () => {
    const { publishGuestInvitation } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-09-20T12:30";
    draft.payload.venueName = "라비에벨 가든홀";
    draft.payload.venueAddress = "서울 강남구 테헤란로 123";
    draft.payload.eventData.groom.name = "이준서";
    draft.payload.eventData.bride.name = "김은재";
    draft.payload.share.slug = "결혼식-초대장-이준서-김은재-vdkk44";

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          payload?: {
            shareUrl?: string;
          };
        };
        const slug = body.payload?.shareUrl ?? "";

        expect(slug).toMatch(/^iv-[a-z0-9]{10}$/);
        expect(slug).not.toContain("결혼식");
        expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(
          `guest-publish:${draft.localId}:${draft.localUpdatedAt}`
        );

        return new Response(
          JSON.stringify({
            success: true,
            invitationId: "inv-1",
            slug,
            ownerToken: guestOwnerToken
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );

    const result = await publishGuestInvitation(draft);

    expect(result.invitationId).toBe("inv-1");
    expect(result.slug).toMatch(/^iv-[a-z0-9]{10}$/);
    expect(result.sourcePayload.guestOwnerToken).toBe(guestOwnerToken);
  });

  it("uploads a pending guest photo with bearer ownership before publishing its stable asset path", async () => {
    const { publishGuestInvitation } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-09-20T12:30";
    draft.payload.venueName = "라비에벨 가든홀";
    draft.payload.venueAddress = "서울 강남구 테헤란로 123";
    draft.payload.eventData.groom.name = "이준서";
    draft.payload.eventData.bride.name = "김은재";
    draft.payload.photos.mainUri = "file:///prepared-main.jpg";
    draft.pendingPhotos = [{
      localUri: "file:///prepared-main.jpg",
      slot: "main",
      retryCount: 0
    }];
    const storedPath = `guest-owner-1/guest/${"a".repeat(64)}.jpg`;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("file://")) {
        return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), {
          status: 200,
          headers: { "Content-Type": "image/jpeg" }
        });
      }
      if (url.endsWith("/api/public/guest-upload")) {
        expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer guest-token");
        expect(new Headers(init?.headers).get("Idempotency-Key")).toContain(`guest-upload:${draft.localId}:main`);
        expect(init?.body).toBeInstanceOf(FormData);
        return new Response(JSON.stringify({ success: true, path: storedPath }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      const body = JSON.parse(String(init?.body ?? "{}")) as {
        payload?: { mainImagePath?: string; mainImageUrl?: string; shareUrl?: string };
      };
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer guest-token");
      expect(body.payload?.mainImagePath).toBe(storedPath);
      return new Response(JSON.stringify({
        success: true,
        invitationId: "inv-photo-1",
        slug: body.payload?.shareUrl,
        ownerToken: guestOwnerToken
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishGuestInvitation(draft, {
      accessToken: "guest-token",
      userId: "guest-owner-1"
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.sourcePayload.mainImagePath).toBe(storedPath);
    expect(result.payload.photos.mainUri).toContain("/api/public/assets");
    expect(result.payload.photos.mainUri).toContain(encodeURIComponent(storedPath));
  });

  it("deletes a guest invitation through the owner-token endpoint", async () => {
    const { deleteGuestInvitation } = await import("./invitations");
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      expect(String(input)).toBe("https://invitehub.test/api/public/iv-abcdefghij/owner");
      expect(init?.method).toBe("DELETE");
      expect(JSON.parse(String(init?.body))).toEqual({ ownerToken: guestOwnerToken, website: "" });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteGuestInvitation("iv-abcdefghij", guestOwnerToken)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("routes signed-in account photos through the same protected upload boundary", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("account-1");
    draft.payload.photos.mainUri = "file:///account-main.jpg";
    draft.pendingPhotos = [{
      localUri: "file:///account-main.jpg",
      slot: "main",
      retryCount: 0
    }];
    const storedPath = `account-1/guest/${"b".repeat(64)}.jpg`;
    const insertMock = vi.fn(() => ({
      select: () => ({
        single: async () => ({ data: { id: "account-inv-1" }, error: null })
      })
    }));
    fromMock.mockReturnValue({ insert: insertMock });
    const createSignedUrlMock = vi.fn(async () => ({
      data: { signedUrl: "https://signed.invitehub.test/account-main.jpg" },
      error: null
    }));
    storageFromMock.mockReturnValue({ createSignedUrl: createSignedUrlMock });
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("file://")) {
        return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), { status: 200 });
      }

      expect(url).toBe("https://invitehub.test/api/public/guest-upload");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer account-token");
      return new Response(JSON.stringify({ success: true, path: storedPath }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await saveDraftToSupabase(draft, "account-1", "draft", {
      accessToken: "account-token",
      userId: "account-1"
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(createSignedUrlMock).toHaveBeenCalledWith(storedPath, 60 * 60 * 24 * 7);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ mainImagePath: storedPath })
    }));
    expect(result.payload.photos.mainUri).toBe("https://signed.invitehub.test/account-main.jpg");
  });
});
