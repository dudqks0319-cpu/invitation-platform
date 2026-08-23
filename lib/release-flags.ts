export const PAID_PUBLISH_DISABLED_MESSAGE =
  "유료 발행권은 비활성화되어 있습니다. 현재 무료 버전에서는 사진을 포함해 공개 링크를 발행할 수 있습니다.";

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
