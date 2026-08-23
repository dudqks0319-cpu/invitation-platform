import type { InvitationDraftPayload } from "@/lib/invitation-payload";
import { isPaidPublishingEnabled } from "@/lib/release-flags";

export const CURRENT_TEMPLATE_BASE_PRICE_KRW = 0;
export const PHOTO_PUBLISH_PASS_PRICE_KRW = 3300;

function hasValue(value: string | undefined | null) {
  return Boolean(value && value.trim().length > 0);
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

function isInlineDataImage(value: string | undefined | null) {
  return Boolean(value?.trim().startsWith("data:image/"));
}

function isFreeImageTextOverlayPayload(payload: InvitationDraftPayload) {
  return (
    payload.templateId === "image-text-overlay" &&
    !hasValue(payload.mainImagePath) &&
    !hasValue(payload.backgroundImagePath) &&
    payload.galleryImages.every((item) => !hasValue(item)) &&
    payload.galleryImagePaths.every((item) => !hasValue(item)) &&
    (!hasValue(payload.mainImageUrl) || isInlineDataImage(payload.mainImageUrl)) &&
    (!hasValue(payload.backgroundImageUrl) || isInlineDataImage(payload.backgroundImageUrl))
  );
}

export function calculateInvitationPrice(payload: InvitationDraftPayload) {
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: "기본 템플릿", amount: CURRENT_TEMPLATE_BASE_PRICE_KRW }
  ];

  if (isPaidPublishingEnabled() && hasPhotoSelection(payload) && !isFreeImageTextOverlayPayload(payload)) {
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

export function getGalleryBillingBlocks(count: number) {
  return count > 0 ? 1 : 0;
}
