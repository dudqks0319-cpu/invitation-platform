import type { InvitationPayload } from "./invitation-shared";

function joinMissing(fields: string[]) {
  return `${fields.join(", ")}를 먼저 입력해 주세요.`;
}

function normalizeStep(step: number | `step${number}`) {
  if (typeof step === "string") {
    return Number(step.replace("step", ""));
  }

  return step;
}

export function getBasicStepMissingFields(payload: InvitationPayload) {
  return [
    !payload.title.trim() ? "행사 제목" : null,
    !payload.eventDateTime.trim() ? "행사 일시" : null,
    !payload.venueName.trim() ? "예식장 이름" : null,
    !payload.venueAddress.trim() ? "예식장 주소" : null
  ].filter(Boolean) as string[];
}

export function getBuilderStepValidation(step: number | `step${number}`, payload: InvitationPayload) {
  const normalizedStep = normalizeStep(step);

  if (normalizedStep === 1) {
    const missing = getBasicStepMissingFields(payload);

    return {
      canContinue: missing.length === 0,
      isValid: missing.length === 0,
      message: missing.length === 0 ? "" : joinMissing(missing)
    };
  }

  if (normalizedStep === 2) {
    const missing = [
      !payload.eventData.groom.name.trim() ? "신랑 이름" : null,
      !payload.eventData.bride.name.trim() ? "신부 이름" : null
    ].filter(Boolean) as string[];

    return {
      canContinue: missing.length === 0,
      isValid: missing.length === 0,
      message: missing.length === 0 ? "" : "신랑 이름과 신부 이름을 입력해 주세요."
    };
  }

  return {
    canContinue: true,
    isValid: true,
    message: ""
  };
}
