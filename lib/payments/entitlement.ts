import type { InvitationDraftPayload } from "@/lib/invitation-payload";
import { getGalleryBillingBlocks } from "@/lib/payments/pricing";

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

  if (
    current.mainImageUrl !== snapshot.mainImageUrl ||
    current.mainImagePath !== snapshot.mainImagePath
  ) {
    labels.push("인물사진 추가");
  }

  if (
    current.backgroundImageUrl !== snapshot.backgroundImageUrl ||
    current.backgroundImagePath !== snapshot.backgroundImagePath
  ) {
    labels.push("배경사진 추가");
  }

  const currentGalleryBlocks = getGalleryBillingBlocks(Math.max(current.galleryImages.length, current.galleryImagePaths.length));
  const snapshotGalleryBlocks = getGalleryBillingBlocks(Math.max(snapshot.galleryImages.length, snapshot.galleryImagePaths.length));

  if (currentGalleryBlocks !== snapshotGalleryBlocks) {
    labels.push("갤러리 10장 단위 추가");
  }

  return labels;
}
