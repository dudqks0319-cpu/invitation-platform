import type { InvitationDraftPayload } from "@/lib/invitation-payload";

export function hasPaidChange(current: InvitationDraftPayload, snapshot: InvitationDraftPayload | null) {
  if (!snapshot) {
    return false;
  }

  return getPaidChangeLabels(current, snapshot).length > 0;
}

export function getPaidChangeLabels(current: InvitationDraftPayload, snapshot: InvitationDraftPayload | null) {
  if (!snapshot) {
    return [];
  }

  const labels: string[] = [];
  const currentHasPhoto =
    Boolean(current.mainImageUrl || current.mainImagePath) ||
    Boolean(current.backgroundImageUrl || current.backgroundImagePath) ||
    current.galleryImages.length > 0 ||
    current.galleryImagePaths.length > 0;
  const snapshotHasPhoto =
    Boolean(snapshot.mainImageUrl || snapshot.mainImagePath) ||
    Boolean(snapshot.backgroundImageUrl || snapshot.backgroundImagePath) ||
    snapshot.galleryImages.length > 0 ||
    snapshot.galleryImagePaths.length > 0;

  if (currentHasPhoto !== snapshotHasPhoto) {
    labels.push("사진 포함 발행권");
  }

  return labels;
}
