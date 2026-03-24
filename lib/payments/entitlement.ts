import type { InvitationDraftPayload } from "@/lib/invitation-payload";
import { PAID_CHANGE_FIELDS } from "@/lib/payments/constants";

export function hasPaidChange(current: InvitationDraftPayload, snapshot: InvitationDraftPayload | null) {
  if (!snapshot) {
    return false;
  }

  return PAID_CHANGE_FIELDS.some((field) => current[field] !== snapshot[field]);
}

export function getPaidChangeLabels(current: InvitationDraftPayload, snapshot: InvitationDraftPayload | null) {
  if (!snapshot) {
    return [];
  }

  const labels: string[] = [];

  if (current.templateId !== snapshot.templateId) {
    labels.push("템플릿 변경");
  }

  if (
    current.mainImageUrl !== snapshot.mainImageUrl ||
    current.mainImagePath !== snapshot.mainImagePath
  ) {
    labels.push("메인 이미지 변경");
  }

  if (
    current.backgroundImageUrl !== snapshot.backgroundImageUrl ||
    current.backgroundImagePath !== snapshot.backgroundImagePath
  ) {
    labels.push("배경 이미지 변경");
  }

  return labels;
}
