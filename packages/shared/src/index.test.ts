import {
  createEmptyInvitationDraft,
  updateInvitationBasics,
  updateWeddingNames
} from "@/packages/shared/src/index";

describe("shared invitation helpers", () => {
  it("creates an empty draft with owner id", () => {
    const draft = createEmptyInvitationDraft("owner-1");

    expect(draft.payload.ownerId).toBe("owner-1");
    expect(draft.payload.templateId).toBe("wedding-classic");
  });

  it("updates basics and wedding names immutably", () => {
    const original = createEmptyInvitationDraft("owner-1").payload;
    const withBasics = updateInvitationBasics(original, { title: "새 초대장" });
    const withNames = updateWeddingNames(withBasics, { groomName: "민준", brideName: "수아" });

    expect(withNames.title).toBe("새 초대장");
    expect(withNames.eventData.groom.name).toBe("민준");
    expect(withNames.eventData.bride.name).toBe("수아");
    expect(original.title).toBe("결혼식 초대장");
  });
});
