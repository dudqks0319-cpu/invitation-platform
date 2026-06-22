export const PAID_PUBLISH_DISABLED_MESSAGE =
  "현재 제출 버전은 무료 발행을 기본으로 제공합니다.";

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
  return parsePublicBooleanFlag(process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH, false);
}
