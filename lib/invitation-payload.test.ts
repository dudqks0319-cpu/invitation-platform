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
