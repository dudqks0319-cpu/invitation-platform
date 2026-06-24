type GuestbookContent = {
  nickname: string;
  message: string;
};

type PublicContentPolicyResult = {
  ok: true;
} | {
  ok: false;
  message: string;
};

const BLOCKED_GUESTBOOK_TERMS = [
  "시발",
  "씨발",
  "병신",
  "개새끼",
  "좆",
  "fuck",
  "shit"
];

function normalizePublicText(value: string) {
  return value.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

export function checkPublicGuestbookContent({
  nickname,
  message
}: GuestbookContent): PublicContentPolicyResult {
  const normalized = normalizePublicText(`${nickname} ${message}`);

  if (BLOCKED_GUESTBOOK_TERMS.some((term) => normalized.includes(term))) {
    return {
      ok: false,
      message: "운영 정책상 등록할 수 없는 표현이 포함되어 있습니다."
    };
  }

  return {
    ok: true
  };
}
