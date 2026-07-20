import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

    const result = await publishGuestInvitation(draft);

    expect(result.invitationId).toBe("inv-1");
    expect(result.slug).toMatch(/^iv-[a-z0-9]{10}$/);
  });
});
