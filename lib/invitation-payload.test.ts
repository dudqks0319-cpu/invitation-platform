import { createInvitationSlug, defaultInvitationDraft, normalizeDraft } from "@/lib/invitation-payload";

describe("invitation payload helpers", () => {
  it("fills missing fields with defaults", () => {
    const draft = normalizeDraft({ title: "테스트 초대장" });

    expect(draft.title).toBe("테스트 초대장");
    expect(draft.templateId).toBe(defaultInvitationDraft.templateId);
    expect(draft.venueName).toBe(defaultInvitationDraft.venueName);
  });

  it("merges legacy map address into venue address and drops removed fields", () => {
    const draft = normalizeDraft({
      mapAddress: "서울 중구 세종대로 1",
      kakaoJsKey: "legacy-key"
    });

    expect(draft.venueAddress).toBe("서울 중구 세종대로 1");
    expect("mapAddress" in draft).toBe(false);
    expect("kakaoJsKey" in draft).toBe(false);
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
