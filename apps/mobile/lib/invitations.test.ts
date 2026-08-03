import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyInvitationDraft } from "./invitation-shared";
import { getPublishAccess } from "./publish-access";
import { getMobileInvitationPricing } from "./payments/pricing";

const fromMock = vi.fn();
const uploadMock = vi.fn();
const downloadMock = vi.fn();
const createSignedUrlMock = vi.fn();
const removeMock = vi.fn();
const getSessionMock = vi.fn();
const storageFromMock = vi.fn(() => ({
  upload: uploadMock,
  download: downloadMock,
  createSignedUrl: createSignedUrlMock,
  remove: removeMock
}));

vi.mock("./supabase", () => ({
  supabase: {
    auth: {
      getSession: getSessionMock
    },
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
    uploadMock.mockReset();
    downloadMock.mockReset();
    createSignedUrlMock.mockReset();
    removeMock.mockReset();
    getSessionMock.mockReset();
    storageFromMock.mockClear();
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: "mobile-access-token"
        }
      },
      error: null
    });
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("still requires core fields before direct publish even when pricing is free", () => {
    const payload = createPayload();
    const access = getPublishAccess(payload);

    expect(getMobileInvitationPricing(payload).isFree).toBe(true);
    expect(access.canPublishDirectly).toBe(false);
    expect(access.missingFields).toContain("행사 일시");
  });

  it("blocks direct publish when paid add-ons are present", () => {
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

    expect(pricing.amount).toBe(3300);
    expect(access.canPublishDirectly).toBe(false);
    expect(access.paidItems).toContain("사진 포함 발행권");
  });

  it("rejects paid drafts before saving a published invitation", async () => {
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

  it("saves a free invitation as a draft before publishing through the authenticated server route", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-05-23T14:00";
    draft.payload.venueName = "더파인 웨딩홀";
    draft.payload.venueAddress = "서울 강남구";
    draft.payload.eventData.groom.name = "민준";
    draft.payload.eventData.bride.name = "수아";
    draft.payload.share.slug = "iv-publish123";

    const insertMock = vi.fn((row: { status?: string; published_at?: string | null }) => {
      expect(row.status).toBe("draft");
      expect(row.published_at).toBeNull();
      return {
        select: () => ({
          single: async () => ({ data: { id: "invitation-1" }, error: null })
        })
      };
    });
    fromMock.mockReturnValue({ insert: insertMock });
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      expect(String(input)).toMatch(/\/api\/payments\/free-publish$/);
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({
        Authorization: "Bearer mobile-access-token",
        "Content-Type": "application/json",
        "Idempotency-Key": "free-publish:invitation-1"
      });
      expect(JSON.parse(String(init?.body))).toEqual({ invitationId: "invitation-1" });
      return new Response(
        JSON.stringify({
          success: true,
          invitationId: "invitation-1",
          slug: "iv-publish123"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await saveDraftToSupabase(draft, "owner-1", "published");

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.payload.isPublished).toBe(true);
    expect(result.publicUrl).toBe("https://invitehub.co.kr/i/iv-publish123");
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
        expect(init?.headers).toEqual({
          Authorization: "Bearer anonymous-access-token",
          "Content-Type": "application/json",
          "Idempotency-Key": `guest-publish:${draft.localId}`
        });

        return new Response(
          JSON.stringify({
            success: true,
            invitationId: "inv-1",
            slug
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );

    const result = await publishGuestInvitation(draft, "anonymous-access-token");

    expect(result.invitationId).toBe("inv-1");
    expect(result.slug).toMatch(/^iv-[a-z0-9]{10}$/);
  });

  it("fails closed without using Math.random when secure slug randomness is unavailable", async () => {
    const { publishGuestInvitation } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    const randomSpy = vi.spyOn(Math, "random");
    const fetchMock = vi.fn();
    vi.stubGlobal("crypto", undefined);
    vi.stubGlobal("fetch", fetchMock);

    await expect(publishGuestInvitation(draft, "anonymous-access-token")).rejects.toThrow(
      "안전한 초대장 주소를 만들 수 없습니다."
    );
    expect(randomSpy).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires a current mobile access token before uploading pending photos", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.pendingPhotos = [{ localUri: "file:///main.jpg", slot: "main", retryCount: 0 }];
    draft.payload.photos.mainUri = "file:///main.jpg";
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveDraftToSupabase(draft, "owner-1")).rejects.toThrow(
      "사진을 안전하게 저장하려면 다시 로그인해 주세요."
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("uploads multipart photos with Bearer auth and deletes only newly created paths after a late row failure", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.pendingPhotos = [
      { localUri: "file:///main.jpg", slot: "main", retryCount: 0 },
      { localUri: "file:///gallery.jpg", slot: "gallery", order: 0, retryCount: 0 }
    ];
    draft.payload.photos.mainUri = "file:///main.jpg";
    draft.payload.photos.gallery = [{ uri: "file:///gallery.jpg", order: 0 }];

    const uploadResults = [
      {
        success: true,
        created: true,
        path: "owner-1/server-main.jpg",
        publicUrl: "https://signed/main"
      },
      {
        success: true,
        created: false,
        path: "owner-1/server-gallery.jpg",
        publicUrl: "https://signed/gallery"
      }
    ];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("file://")) {
        return new Response(new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" }));
      }
      if (init?.method === "POST") {
        expect(url).toMatch(/\/api\/uploads$/);
        expect(init.headers).toEqual({ Authorization: "Bearer mobile-access-token" });
        expect(init.body).toBeInstanceOf(FormData);
        expect((init.body as FormData).get("file")).toBeInstanceOf(Blob);
        return new Response(JSON.stringify(uploadResults.shift()), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (init?.method === "DELETE") {
        expect(init.headers).toEqual({
          Authorization: "Bearer mobile-access-token",
          "Content-Type": "application/json"
        });
        expect(JSON.parse(String(init.body))).toEqual({ path: "owner-1/server-main.jpg" });
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    fromMock.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: new Error("row failed") })
        })
      })
    });

    await expect(saveDraftToSupabase(draft, "owner-1")).rejects.toThrow("row failed");

    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(2);
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE")).toHaveLength(1);
    expect(uploadMock).not.toHaveBeenCalled();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("fails closed before writing the invitation row when the server upload rejects the photo", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.pendingPhotos = [{ localUri: "file:///main.jpg", slot: "main", retryCount: 0 }];
    draft.payload.photos.mainUri = "file:///main.jpg";

    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).startsWith("file://")) {
        return new Response(new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" }));
      }
      expect(init?.method).toBe("POST");
      return new Response(
        JSON.stringify({ success: false, message: "일일 업로드 한도를 초과했습니다." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" }
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveDraftToSupabase(draft, "owner-1")).rejects.toThrow(
      "일일 업로드 한도를 초과했습니다."
    );
    expect(fromMock).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE")).toHaveLength(0);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("does not delete a reused server object when the invitation row fails", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.pendingPhotos = [{ localUri: "file:///main.jpg", slot: "main", retryCount: 1 }];
    draft.payload.photos.mainUri = "file:///main.jpg";

    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).startsWith("file://")) {
        return new Response(new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" }));
      }
      expect(init?.method).toBe("POST");
      return new Response(
        JSON.stringify({
          success: true,
          created: false,
          path: "owner-1/existing.jpg",
          publicUrl: "https://signed/existing"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    fromMock.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: new Error("row failed") })
        })
      })
    });

    await expect(saveDraftToSupabase(draft, "owner-1")).rejects.toThrow("row failed");
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === "DELETE")).toHaveLength(0);
    expect(uploadMock).not.toHaveBeenCalled();
    expect(downloadMock).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("routes owner signed URLs through the bounded server endpoint without direct Storage signing", async () => {
    const { listRemoteInvitations } = await import("./invitations");
    const paths = ["owner-1/" + "a".repeat(64) + ".jpg", "owner-1/" + "b".repeat(64) + ".webp"];
    fromMock.mockReturnValue({
      select() { return this; },
      eq() { return this; },
      order: vi.fn().mockResolvedValue({
        data: [{
          id: "invitation-1",
          slug: "invite-123",
          title: "초대장",
          category: "wedding",
          template_id: "wedding-classic",
          status: "published",
          updated_at: "2026-08-03T00:00:00.000Z",
          payload: { mainImagePath: paths[0], backgroundImagePath: paths[1] }
        }],
        error: null
      })
    });
    let activeRequests = 0;
    let maxActiveRequests = 0;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      await Promise.resolve();
      activeRequests -= 1;
      const url = new URL(String(input));
      expect(url.pathname).toBe("/api/uploads");
      expect(init?.headers).toEqual({ Authorization: "Bearer mobile-access-token" });
      return new Response(JSON.stringify({
        success: true,
        signedUrl: `https://example.supabase.co/signed/${encodeURIComponent(url.searchParams.get("path") ?? "")}`
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listRemoteInvitations("owner-1");

    expect(result).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(maxActiveRequests).toBe(1);
    expect(createSignedUrlMock).not.toHaveBeenCalled();
    expect(storageFromMock).not.toHaveBeenCalled();
  });
});
