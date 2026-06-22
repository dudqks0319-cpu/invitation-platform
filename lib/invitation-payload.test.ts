import {
  buildPublicInvitationPayload,
  createInvitationSlug,
  defaultInvitationDraft,
  formatEventDateTime,
  formatTimestampLabel,
  isInvitationSectionAllowed,
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
    expect(draft.schemaVersion).toBe(3);
    expect(isInvitationSectionAllowed(draft, "rsvp", "submit")).toBe(true);
    expect(isInvitationSectionAllowed(draft, "guestbook", "submit")).toBe(true);
  });

  it("normalizes disabled section policies and blocks public submit actions", () => {
    const draft = normalizeDraft({
      sections: {
        rsvp: false,
        guestbook: {
          enabled: true,
          publicVisible: true,
          publicSubmitAllowed: false
        },
        accounts: {
          enabled: false
        }
      }
    });

    expect(isInvitationSectionAllowed(draft, "rsvp", "view")).toBe(false);
    expect(isInvitationSectionAllowed(draft, "rsvp", "submit")).toBe(false);
    expect(isInvitationSectionAllowed(draft, "guestbook", "view")).toBe(true);
    expect(isInvitationSectionAllowed(draft, "guestbook", "submit")).toBe(false);
    expect(isInvitationSectionAllowed(draft, "accounts", "view")).toBe(false);
  });

  it("removes account and contact values from public payloads when those sections are off", () => {
    const draft = normalizeDraft({
      groomPhone: "010-1111-2222",
      bridePhone: "010-3333-4444",
      groomBank: "국민은행",
      groomBankHolder: "홍길동",
      groomBankAccount: "123-456",
      kakaoPayLink: "https://qr.kakaopay.com/demo",
      sections: {
        contact: false,
        accounts: false
      }
    });

    const publicPayload = buildPublicInvitationPayload(draft);

    expect(publicPayload.groomPhone).toBe("");
    expect(publicPayload.bridePhone).toBe("");
    expect(publicPayload.groomBank).toBe("");
    expect(publicPayload.groomBankHolder).toBe("");
    expect(publicPayload.groomBankAccount).toBe("");
    expect(publicPayload.kakaoPayLink).toBe("");
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

  it("creates a readable slug", () => {
    const slug = createInvitationSlug({
      title: "우리의 결혼식",
      groomName: "홍길동",
      brideName: "김부인"
    });

    expect(slug).toContain("우리의-결혼식");
    expect(slug.length).toBeGreaterThan(8);
  });

  it("formats event dates in a deterministic 24-hour Korean label", () => {
    expect(formatEventDateTime("2026-04-12T14:00")).toBe("2026년 4월 12일 일 14:00");
  });

  it("formats timestamps without client/server locale drift", () => {
    expect(formatTimestampLabel("2026-04-12T14:00:00.000Z")).toBe("2026년 4월 12일 23:00");
  });
});
