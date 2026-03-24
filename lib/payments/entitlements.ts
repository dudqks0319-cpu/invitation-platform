import type { InvitationDraftPayload } from "@/lib/invitation-payload";

const PAID_LOCKED_FIELDS: Array<keyof InvitationDraftPayload> = [
  "templateId",
  "mainImageUrl",
  "mainImagePath",
  "backgroundImageUrl",
  "backgroundImagePath"
];

export function hasPaidEditImpact(
  before: InvitationDraftPayload | null | undefined,
  after: InvitationDraftPayload
) {
  if (!before) {
    return false;
  }

  return PAID_LOCKED_FIELDS.some((field) => before[field] !== after[field]);
}
