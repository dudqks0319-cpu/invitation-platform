import { getMobilePublishMissingFields, type InvitationPayload } from "./invitation-shared";
import { getMobileInvitationPricing } from "./payments/pricing";

export function getPublishAccess(payload: InvitationPayload) {
  const missingFields = getMobilePublishMissingFields(payload);
  const pricing = getMobileInvitationPricing(payload);

  return {
    canPublishDirectly: missingFields.length === 0 && pricing.isFree,
    missingFields,
    paidItems: pricing.breakdown
      .filter((item) => item.amount > 0)
      .map((item) => item.label)
  };
}
