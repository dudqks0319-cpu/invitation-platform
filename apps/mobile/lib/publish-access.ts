import type { InvitationPayload } from "./invitation-shared";
import { getMobileInvitationPricing } from "./payments/pricing";

export function getPublishAccess(payload: InvitationPayload) {
  const missingFields: string[] = [];

  if (!payload.title.trim()) missingFields.push("초대장 제목");
  if (!payload.eventDateTime.trim()) missingFields.push("행사 일시");
  if (!payload.venueName.trim()) missingFields.push("예식장 이름");
  if (!payload.venueAddress.trim()) missingFields.push("예식장 주소");
  if (!payload.eventData.groom.name.trim()) missingFields.push("신랑 이름");
  if (!payload.eventData.bride.name.trim()) missingFields.push("신부 이름");

  const pricing = getMobileInvitationPricing(payload);

  return {
    canPublishDirectly: missingFields.length === 0 && pricing.isFree,
    missingFields,
    paidItems: pricing.breakdown
      .filter((item) => item.amount > 0)
      .map((item) => item.label)
  };
}
