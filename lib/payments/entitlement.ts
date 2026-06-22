import type { InvitationDraftPayload } from "@/lib/invitation-payload";

export function hasPaidChange(current: InvitationDraftPayload, snapshot: InvitationDraftPayload | null) {
  if (!snapshot) {
    return false;
  }

  return getPaidChangeLabels(current, snapshot).length > 0;
}

export function getPaidChangeLabels(current: InvitationDraftPayload, snapshot: InvitationDraftPayload | null) {
  void current;
  void snapshot;
  return [];
}
