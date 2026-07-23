type InvitationPreviewAccessibilityInput = {
  title: string;
  dateTime: string;
  venueName: string;
  message: string;
  hasKakaoTarget: boolean;
  hasNaverTarget: boolean;
};

export function getInvitationPreviewAccessibility({
  title,
  dateTime,
  venueName,
  message,
  hasKakaoTarget,
  hasNaverTarget
}: InvitationPreviewAccessibilityInput) {
  return {
    summary: {
      role: "image" as const,
      label: `초대장 예시, ${title}, ${dateTime}, ${venueName}, ${message}`
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
