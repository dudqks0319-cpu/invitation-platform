import type { InvitationDraftPayload } from "@/lib/invitation-payload";

export const CURRENT_TEMPLATE_BASE_PRICE_KRW = 0;

export function calculateInvitationPrice(payload: InvitationDraftPayload) {
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: "초대장 발행", amount: CURRENT_TEMPLATE_BASE_PRICE_KRW }
  ];

  if (
    payload.mainImageUrl.trim() ||
    payload.mainImagePath.trim() ||
    payload.backgroundImageUrl.trim() ||
    payload.backgroundImagePath.trim() ||
    payload.galleryImages.some((item) => item.trim()) ||
    payload.galleryImagePaths.some((item) => item.trim())
  ) {
    breakdown.push({ label: "사진 업로드", amount: 0 });
  }

  const amount = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    amount,
    breakdown,
    isFree: amount === 0
  };
}

export const getInvitationPricing = calculateInvitationPrice;

export function getGalleryBillingBlocks(count: number) {
  return count > 0 ? 1 : 0;
}
