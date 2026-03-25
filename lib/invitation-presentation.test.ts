import { defaultInvitationDraft } from "@/lib/invitation-payload";
import {
  applyCategoryTemplateDefaults,
  buildAbsoluteShareUrl,
  getCategoryPresentation
} from "@/lib/invitation-presentation";

describe("invitation presentation helpers", () => {
  it("builds an absolute share URL from a relative path", () => {
    expect(buildAbsoluteShareUrl("/invitations/demo-card", "https://invitehub.test")).toBe(
      "https://invitehub.test/invitations/demo-card"
    );
  });

  it("returns baby-focused labels for dol invitations", () => {
    expect(getCategoryPresentation("dol")).toMatchObject({
      categoryBadge: "FIRST BIRTHDAY INVITATION",
      primaryNameLabel: "아이 이름",
      secondaryNameLabel: "보호자 이름",
      detailSectionTitle: "아이 · 가족 정보",
      contactsSectionTitle: "보호자 연락처",
      primaryContactLabel: "주 보호자 연락처",
      secondaryContactLabel: "보조 연락처"
    });
  });

  it("replaces untouched wedding defaults when switching to a dol template", () => {
    const next = applyCategoryTemplateDefaults(defaultInvitationDraft, "dol", "dol-cute");

    expect(next.category).toBe("dol");
    expect(next.templateId).toBe("dol-cute");
    expect(next.title).toBe("첫돌 초대장");
    expect(next.message).toContain("첫 번째 생일");
  });
});
