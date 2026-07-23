export type InvitationPreviewDetailsInput = {
  title: string;
  dateTime: string;
  venueName: string;
  venueAddress: string;
  message: string;
  transportNote?: string;
};

type InvitationPreviewAccessibilityInput = {
  details: ReturnType<typeof getInvitationPreviewDetails>;
  hasKakaoTarget: boolean;
  hasNaverTarget: boolean;
};

export function getInvitationPreviewDetails({
  title,
  dateTime,
  venueName,
  venueAddress,
  message,
  transportNote
}: InvitationPreviewDetailsInput) {
  return [
    { key: "title" as const, label: "제목", value: title },
    { key: "dateTime" as const, label: "일시", value: dateTime },
    { key: "venueName" as const, label: "장소", value: venueName },
    { key: "venueAddress" as const, label: "주소", value: venueAddress },
    { key: "message" as const, label: "초대 문구", value: message },
    ...(transportNote
      ? [{ key: "transportNote" as const, label: "교통 안내", value: transportNote }]
      : [])
  ];
}

export function getInvitationPreviewAccessibility({
  details,
  hasKakaoTarget,
  hasNaverTarget
}: InvitationPreviewAccessibilityInput) {
  return {
    summary: {
      role: "text" as const,
      label: `초대장 예시 상세, ${details.map(({ label, value }) => `${label} ${value}`).join(", ")}`
    },
    mapButtons: {
      kakao: { role: "button" as const, disabled: !hasKakaoTarget },
      naver: { role: "button" as const, disabled: !hasNaverTarget }
    }
  };
}

export function getInvitationPreviewFocusOrder(
  accessibility: ReturnType<typeof getInvitationPreviewAccessibility>
) {
  return [
    { kind: "summary" as const, ...accessibility.summary },
    { kind: "kakao" as const, ...accessibility.mapButtons.kakao },
    { kind: "naver" as const, ...accessibility.mapButtons.naver }
  ];
}
