import {
  createInvitationSlug,
  defaultInvitationDraft,
  formatEventDateTime,
  formatTimestampLabel,
  normalizeDraft
} from "@/lib/invitation-payload";

describe("invitation payload helpers", () => {
  it("fills missing fields with defaults", () => {
    const draft = normalizeDraft({ title: "테스트 초대장" });

    expect(draft.title).toBe("테스트 초대장");
    expect(draft.templateId).toBe(defaultInvitationDraft.templateId);
    expect(draft.venueName).toBe(defaultInvitationDraft.venueName);
    expect(draft.videoUrl).toBe("");
    expect(draft.backgroundMusicUrl).toBe("");
    expect(draft.thankYouMessage).toBe("");
    expect(draft.templateTextPlacement).toBe("top");
  });

  it("preserves optional media and thank-you fields", () => {
    const draft = normalizeDraft({
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      backgroundMusicUrl: "https://cdn.example.com/music.mp3",
      thankYouMessage: "함께해 주셔서 감사합니다."
    });

    expect(draft.videoUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(draft.backgroundMusicUrl).toBe("https://cdn.example.com/music.mp3");
    expect(draft.thankYouMessage).toBe("함께해 주셔서 감사합니다.");
  });

  it("preserves cleared address fields instead of restoring sample addresses", () => {
    const draft = normalizeDraft({
      venueAddress: "",
      mapAddress: "",
      naverMapLink: "",
      kakaoMapLink: ""
    });

    expect(draft.venueAddress).toBe("");
    expect(draft.mapAddress).toBe("");
    expect(draft.naverMapLink).toBe("");
    expect(draft.kakaoMapLink).toBe("");
  });

  it("preserves Korean road-name, lot-number, and postcode address metadata", () => {
    const draft = normalizeDraft({
      roadAddress: "서울 강남구 테헤란로 123",
      jibunAddress: "서울 강남구 역삼동 123",
      zonecode: "06133"
    });

    expect(draft.roadAddress).toBe("서울 강남구 테헤란로 123");
    expect(draft.jibunAddress).toBe("서울 강남구 역삼동 123");
    expect(draft.zonecode).toBe("06133");
  });

  it("preserves the selected template text placement and normalizes invalid values", () => {
    expect(normalizeDraft({ templateTextPlacement: "bottom" }).templateTextPlacement).toBe("bottom");
    expect(normalizeDraft({ templateTextPlacement: "unsupported" }).templateTextPlacement).toBe("top");
  });

  it("creates a short opaque public slug", () => {
    const slug = createInvitationSlug({
      title: "우리의 결혼식",
      groomName: "홍길동",
      brideName: "김부인"
    });

    expect(slug).toMatch(/^iv-[a-z0-9]{10}$/);
    expect(slug).not.toContain("우리의-결혼식");
    expect(slug.length).toBeLessThanOrEqual(13);
  });

  it("formats event dates in a deterministic 24-hour Korean label", () => {
    expect(formatEventDateTime("2026-04-12T14:00")).toBe("2026년 4월 12일 일 14:00");
  });

  it("formats timestamps without client/server locale drift", () => {
    expect(formatTimestampLabel("2026-04-12T14:00:00.000Z")).toBe("2026년 4월 12일 23:00");
  });
});
