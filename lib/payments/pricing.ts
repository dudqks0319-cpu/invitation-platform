import type { InvitationDraftPayload } from "@/lib/invitation-payload";

export const CURRENT_TEMPLATE_BASE_PRICE_KRW = 0;
export const PHOTO_PUBLISH_PASS_PRICE_KRW = 3300;

const PREMIUM_TEMPLATE_IDS = new Set<string>([]);

function hasValue(value: string | undefined | null) {
  return Boolean(value && value.trim().length > 0);
}

export function isPremiumTemplate(templateId: string) {
  return PREMIUM_TEMPLATE_IDS.has(templateId);
}

function hasPhotoSelection(payload: InvitationDraftPayload) {
  return Boolean(
    hasValue(payload.mainImageUrl) ||
      hasValue(payload.mainImagePath) ||
      hasValue(payload.backgroundImageUrl) ||
      hasValue(payload.backgroundImagePath) ||
      payload.galleryImages.some((item) => hasValue(item)) ||
      payload.galleryImagePaths.some((item) => hasValue(item))
  );
}

export function calculateInvitationPrice(payload: InvitationDraftPayload) {
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: "기본 템플릿", amount: CURRENT_TEMPLATE_BASE_PRICE_KRW }
  ];

  if (isPremiumTemplate(payload.templateId)) {
    breakdown[0] = { label: "프리미엄 디자인", amount: 4900 };
  }

  if (hasPhotoSelection(payload)) {
    breakdown.push({
      label: "사진 포함 발행권",
      amount: PHOTO_PUBLISH_PASS_PRICE_KRW
    });
  }

  const amount = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    amount,
    breakdown,
    isFree: amount === 0
  };
}

export const getInvitationPricing = calculateInvitationPrice;
