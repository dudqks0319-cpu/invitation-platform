import { describe, expect, it } from "vitest";
import { createEmptyInvitationDraft } from "./invitation-shared";
import { getPublishAccess } from "./publish-access";

describe("mobile publish access", () => {
  it("allows direct publish for free drafts", () => {
    const draft = createEmptyInvitationDraft("user-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-05-23T14:00";
    draft.payload.venueName = "더파인 웨딩홀";
    draft.payload.venueAddress = "서울 강남구 테헤란로 123";
    draft.payload.eventData.groom.name = "민준";
    draft.payload.eventData.bride.name = "수아";

    expect(getPublishAccess(draft.payload)).toEqual({
      canPublishDirectly: true,
      missingFields: [],
      paidItems: []
    });
  });

  it("requires purchase before publish when paid add-ons are selected", () => {
    const draft = createEmptyInvitationDraft("user-1");
    draft.payload.title = "우리 결혼합니다";
    draft.payload.eventDateTime = "2026-05-23T14:00";
    draft.payload.venueName = "더파인 웨딩홀";
    draft.payload.venueAddress = "서울 강남구 테헤란로 123";
    draft.payload.eventData.groom.name = "민준";
    draft.payload.eventData.bride.name = "수아";
    draft.payload.photos.mainUri = "https://example.com/main.jpg";
    draft.payload.photos.gallery = [
      { uri: "https://example.com/1.jpg", order: 0 }
    ];

    expect(getPublishAccess(draft.payload)).toEqual({
      canPublishDirectly: false,
      missingFields: [],
      paidItems: ["인물 사진 추가", "갤러리 1장"]
    });
  });
});
