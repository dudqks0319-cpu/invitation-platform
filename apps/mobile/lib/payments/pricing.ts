import type { InvitationPayload } from "../invitation-shared";

export type MobileInvitationPricing = {
  amount: number;
  breakdown: Array<{ label: string; amount: number }>;
  isFree: boolean;
};

export function getMobileInvitationPricing(payload: InvitationPayload): MobileInvitationPricing {
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: "초대장 발행", amount: 0 }
  ];

  if (payload.photos.mainUri.trim() || payload.photos.backgroundUri.trim() || payload.photos.gallery.length > 0) {
    breakdown.push({ label: "사진 업로드", amount: 0 });
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
