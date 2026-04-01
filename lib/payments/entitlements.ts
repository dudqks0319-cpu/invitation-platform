import type { InvitationDraftPayload } from "@/lib/invitation-payload";

const PAID_LOCKED_FIELDS: Array<keyof InvitationDraftPayload> = [
  "mainImageUrl",
  "mainImagePath",
  "backgroundImageUrl",
  "backgroundImagePath",
  "galleryImages",
  "galleryImagePaths"
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
