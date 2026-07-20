export const PAID_PUBLISH_DISABLED_MESSAGE =
  "사진 포함 발행은 이번 무료 베타에서 지원하지 않습니다. 사진 없이 무료 발행하거나 사진을 제거해 주세요.";

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
