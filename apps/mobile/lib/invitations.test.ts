import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyInvitationDraft } from "./invitation-shared";
import { getPublishAccess } from "./publish-access";
import { getMobileInvitationPricing } from "./payments/pricing";

const fromMock = vi.fn();

vi.mock("./supabase", () => ({
  supabase: {
    from: fromMock
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
  });

  it("still requires core fields before direct publish even when pricing is free", () => {
    const payload = createPayload();
    const access = getPublishAccess(payload);

    expect(getMobileInvitationPricing(payload).isFree).toBe(true);
    expect(access.canPublishDirectly).toBe(false);
    expect(access.missingFields).toContain("행사 일시");
  });

  it("allows direct publish when photos are present", () => {
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

  it("saves published invitations with photos", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-05-23T14:00";
    draft.payload.venueName = "더파인 웨딩홀";
    draft.payload.venueAddress = "서울 강남구";
    draft.payload.eventData.groom.name = "민준";
    draft.payload.eventData.bride.name = "수아";
    draft.payload.photos.mainUri = "https://cdn.invitehub.co.kr/main.jpg";

    fromMock.mockReturnValue({
      insert() {
        return {
          select() {
            return {
              single: vi.fn().mockResolvedValue({
                data: { id: "server-1", slug: "our-wedding", status: "published" },
                error: null
              })
            };
          }
        };
      }
    });

    await expect(saveDraftToSupabase(draft, "owner-1", "published")).resolves.toMatchObject({
      serverId: "server-1"
    });
    expect(fromMock).toHaveBeenCalledWith("invitations");
  });

  it("builds owner-scoped storage paths for pending photo uploads", async () => {
    const { buildPhotoUploadAsset } = await import("./invitations");

    expect(buildPhotoUploadAsset({
      localUri: "file:///photo.webp?cache=1",
      slot: "gallery",
      order: 3,
      retryCount: 0
    }, "owner-1", "draft-1", 1778244000000)).toEqual({
      contentType: "image/webp",
      path: "owner-1/draft-1/gallery-3-1778244000000.webp"
    });
  });
});
