import { describe, expect, it } from "vitest";
import { createEmptyInvitationDraft, updateWeddingFamily } from "./invitation-shared";
import { getBuilderStepValidation } from "./builder-validation";

describe("getBuilderStepValidation", () => {
  it("blocks step 1 when core event fields are empty", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;
    payload.title = "";

    expect(getBuilderStepValidation(1, payload)).toEqual({
      canContinue: false,
      isValid: false,
      message: "행사 제목, 행사 일시, 예식장 이름, 예식장 주소를 먼저 입력해 주세요."
    });
  });

  it("allows step 2 only when both main names exist", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;
    payload.eventData.groom.name = "민준";
    payload.eventData.bride.name = "수아";

    expect(getBuilderStepValidation(2, payload)).toEqual({
      canContinue: true,
      isValid: true,
      message: ""
    });
  });
});

describe("updateWeddingFamily", () => {
  it("updates parent names without overwriting sibling fields", () => {
    const payload = createEmptyInvitationDraft("owner-1").payload;

    const next = updateWeddingFamily(payload, {
      groomFatherName: "홍아버지",
      brideMotherName: "김어머니"
    });

    expect(next.eventData.groomParents.father?.name).toBe("홍아버지");
    expect(next.eventData.brideParents.mother?.name).toBe("김어머니");
    expect(next.eventData.groomParents.mother).toBeUndefined();
  });
});
