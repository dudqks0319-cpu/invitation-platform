export const PAID_PUBLISH_DISABLED_MESSAGE =
  "사진 포함 발행은 현재 제출 버전에서 준비 중입니다. 사진 없는 무료 발행을 먼저 제공합니다.";

export function parsePublicBooleanFlag(value: string | undefined, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off", ""].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export function isPaidPublishingEnabled() {
  return parsePublicBooleanFlag(process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH, false);
}
