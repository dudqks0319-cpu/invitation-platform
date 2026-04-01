import type { InvitationDraftPayload } from "@/lib/invitation-payload";

export const CURRENT_TEMPLATE_BASE_PRICE_KRW = 0;
export const MAIN_IMAGE_ADDON_PRICE_KRW = 500;
export const BACKGROUND_IMAGE_ADDON_PRICE_KRW = 500;
export const GALLERY_BLOCK_SIZE = 10;
export const GALLERY_BLOCK_PRICE_KRW = 1000;

const PREMIUM_TEMPLATE_IDS = new Set<string>([]);

function hasValue(value: string | undefined | null) {
  return Boolean(value && value.trim().length > 0);
}

function getGalleryCount(payload: InvitationDraftPayload) {
  const imageCount = payload.galleryImages.filter((item) => hasValue(item)).length;
  const pathCount = payload.galleryImagePaths.filter((item) => hasValue(item)).length;
  return Math.max(imageCount, pathCount);
}

export function isPremiumTemplate(templateId: string) {
  return PREMIUM_TEMPLATE_IDS.has(templateId);
}

export function getGalleryBillingBlocks(imageCount: number) {
  if (imageCount <= 0) {
    return 0;
  }

  return Math.ceil(imageCount / GALLERY_BLOCK_SIZE);
}

export function calculateInvitationPrice(payload: InvitationDraftPayload) {
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: "기본 템플릿", amount: CURRENT_TEMPLATE_BASE_PRICE_KRW }
  ];

  if (isPremiumTemplate(payload.templateId)) {
    breakdown[0] = { label: "프리미엄 디자인", amount: 4900 };
  }

  if (hasValue(payload.mainImageUrl) || hasValue(payload.mainImagePath)) {
    breakdown.push({ label: "인물 사진 추가", amount: MAIN_IMAGE_ADDON_PRICE_KRW });
  }

  if (hasValue(payload.backgroundImageUrl) || hasValue(payload.backgroundImagePath)) {
    breakdown.push({ label: "배경 사진 추가", amount: BACKGROUND_IMAGE_ADDON_PRICE_KRW });
  }

  const galleryCount = getGalleryCount(payload);
  if (galleryCount > 0) {
    const blocks = getGalleryBillingBlocks(galleryCount);
    breakdown.push({
      label: `갤러리 ${galleryCount}장`,
      amount: blocks * GALLERY_BLOCK_PRICE_KRW
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
