import { defaultInvitationDraft } from "@/lib/invitation-payload";
import {
  applyCategoryTemplateDefaults,
  buildAbsoluteShareUrl,
  buildInvitationKakaoSharePayload,
  DEFAULT_INVITATION_OG_IMAGE,
  getCategoryPresentation,
  getInvitationShareImageUrl
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

  it("builds absolute share image URLs and falls back from non-public preview blobs", () => {
    expect(
      getInvitationShareImageUrl(
        {
          ...defaultInvitationDraft,
          mainImageUrl: "/api/public/assets?slug=demo&path=main.jpg"
        },
        "https://invitehub.test"
      )
    ).toBe("https://invitehub.test/api/public/assets?slug=demo&path=main.jpg");

    expect(
      getInvitationShareImageUrl(
        {
          ...defaultInvitationDraft,
          mainImageUrl: "data:image/png;base64,abc",
          backgroundImageUrl: ""
        },
        "https://invitehub.test"
      )
    ).toBe(`https://invitehub.test${DEFAULT_INVITATION_OG_IMAGE}`);
  });

  it("builds a Kakao feed payload with image preview support", () => {
    const payload = buildInvitationKakaoSharePayload({
      title: "민준 수아 결혼식 초대장",
      description: "두 사람의 시작을 함께 축복해 주세요.",
      imageUrl: "https://invitehub.test/og.jpg",
      shareUrl: "https://invitehub.test/i/minjun-sua"
    });

    expect(payload.objectType).toBe("feed");
    expect(payload.content).toMatchObject({
      title: "민준 수아 결혼식 초대장",
      imageUrl: "https://invitehub.test/og.jpg",
      link: {
        mobileWebUrl: "https://invitehub.test/i/minjun-sua",
        webUrl: "https://invitehub.test/i/minjun-sua"
      }
    });
    expect(payload.buttons[0].title).toBe("초대장 보기");
  });
});
