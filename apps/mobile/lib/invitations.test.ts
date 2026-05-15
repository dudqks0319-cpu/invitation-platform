import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyInvitationDraft } from "./invitation-shared";
import { getPublishAccess } from "./publish-access";
import { getMobileInvitationPricing } from "./payments/pricing";

const fromMock = vi.fn();
const fetchMock = vi.fn();

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
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("still requires core fields before direct publish even when pricing is free", () => {
    const payload = createPayload();
    const access = getPublishAccess(payload);

    expect(getMobileInvitationPricing(payload).isFree).toBe(true);
    expect(access.canPublishDirectly).toBe(false);
    expect(access.missingFields).toContain("초대장 제목");
    expect(access.missingFields).toContain("행사 일시");
  });

  it("treats known demo values as missing publish fields", async () => {
    const { getPublishReadiness } = await import("./invitations");
    const payload = createPayload();
    payload.title = "우리 결혼합니다";
    payload.eventDateTime = "2026-09-20T12:30";
    payload.venueName = "라비에벨 가든홀";
    payload.venueAddress = "서울 강남구 테헤란로 123";
    payload.eventData.groom.name = "이준서";
    payload.eventData.bride.name = "김은재";

    const access = getPublishAccess(payload);
    const readiness = getPublishReadiness(payload);

    expect(access.canPublishDirectly).toBe(false);
    expect(access.missingFields).toEqual([
      "초대장 제목",
      "행사 일시",
      "예식장 이름",
      "예식장 주소",
      "신랑 이름",
      "신부 이름"
    ]);
    expect(readiness.canPublish).toBe(false);
    expect(readiness.missingFields).toEqual(access.missingFields);
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
    draft.payload.title = "민준 수아의 결혼식";
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

  it("rejects direct free publishing so the server API owns status changes", async () => {
    const { saveDraftToSupabase } = await import("./invitations");
    const draft = createEmptyInvitationDraft("owner-1");
    draft.payload.title = "민준 수아의 결혼식";
    draft.payload.eventDateTime = "2026-05-23T14:00";
    draft.payload.venueName = "더파인 웨딩홀";
    draft.payload.venueAddress = "서울 강남구";
    draft.payload.eventData.groom.name = "민준";
    draft.payload.eventData.bride.name = "수아";

    await expect(saveDraftToSupabase(draft, "owner-1", "published")).rejects.toThrow(
      "공개 링크 발행 화면에서만 공개할 수 있습니다."
    );
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("publishes authenticated drafts through the free-publish API", async () => {
    const { publishAuthenticatedInvitation } = await import("./invitations");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        invitationId: "invitation-1",
        slug: "invite-123"
      })
    });

    const result = await publishAuthenticatedInvitation("invitation-1", "access-token");

    expect(result).toEqual({
      invitationId: "invitation-1",
      slug: "invite-123"
    });
    expect(fetchMock).toHaveBeenCalledWith("https://invitehub.co.kr/api/payments/free-publish", {
      method: "POST",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ invitationId: "invitation-1" })
    });
  });
});
