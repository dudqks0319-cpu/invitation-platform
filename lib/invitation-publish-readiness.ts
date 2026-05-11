export type PublishReadinessPayload = {
  title?: unknown;
  eventDateTime?: unknown;
  venueName?: unknown;
  venueAddress?: unknown;
  groomName?: unknown;
  brideName?: unknown;
};

const DEMO_PLACEHOLDERS = new Set([
  "결혼식 초대장",
  "2026-04-12T14:00",
  "서울 더파인 웨딩홀",
  "서울 강남구 테헤란로 123",
  "홍길동",
  "김부인"
]);

function isMissingPublishValue(value: unknown) {
  if (typeof value !== "string") {
    return true;
  }

  const trimmed = value.trim();
  return !trimmed || DEMO_PLACEHOLDERS.has(trimmed);
}

export function getPublishMissingFields(payload: PublishReadinessPayload) {
  return [
    isMissingPublishValue(payload.title) ? "초대장 제목" : null,
    isMissingPublishValue(payload.eventDateTime) ? "행사 일시" : null,
    isMissingPublishValue(payload.venueName) ? "예식장 이름" : null,
    isMissingPublishValue(payload.venueAddress) ? "예식장 주소" : null,
    isMissingPublishValue(payload.groomName) ? "신랑 이름" : null,
    isMissingPublishValue(payload.brideName) ? "신부 이름" : null
  ].filter(Boolean) as string[];
}

export function getPublishMissingFieldsMessage(missingFields: string[]) {
  return `공개 전 입력이 필요한 항목: ${missingFields.join(", ")}`;
}
