import { createInvitationSlug, defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";

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
});
