import type { InvitationPayload } from "../invitation-shared";

export const MAIN_IMAGE_ADDON_PRICE_KRW = 500;
export const BACKGROUND_IMAGE_ADDON_PRICE_KRW = 500;
export const GALLERY_BLOCK_SIZE = 10;
export const GALLERY_BLOCK_PRICE_KRW = 1000;

export type MobileInvitationPricing = {
  amount: number;
  breakdown: Array<{ label: string; amount: number }>;
  isFree: boolean;
};

export function getMobileInvitationPricing(payload: InvitationPayload): MobileInvitationPricing {
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: "기본 템플릿", amount: 0 }
  ];

  if (payload.photos.mainUri.trim()) {
    breakdown.push({ label: "인물 사진 추가", amount: MAIN_IMAGE_ADDON_PRICE_KRW });
  }

  if (payload.photos.backgroundUri.trim()) {
    breakdown.push({ label: "배경 사진 추가", amount: BACKGROUND_IMAGE_ADDON_PRICE_KRW });
  }

  if (payload.photos.gallery.length > 0) {
    const blocks = Math.ceil(payload.photos.gallery.length / GALLERY_BLOCK_SIZE);
    breakdown.push({
      label: `갤러리 ${payload.photos.gallery.length}장`,
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

export function requiresStorePurchase(payload: InvitationPayload) {
  return !getMobileInvitationPricing(payload).isFree;
}
