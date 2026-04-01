export const INVITATION_PRICE_KRW = 0;
export const INVITATION_CURRENCY = "KRW";
export const INVITATION_ITEM_NAME = "InviteHub 발행 옵션";
export const MAIN_PHOTO_ADDON_KRW = 500;
export const BACKGROUND_PHOTO_ADDON_KRW = 500;
export const GALLERY_BLOCK_SIZE = 10;
export const GALLERY_BLOCK_PRICE_KRW = 1000;
export const PREMIUM_TEMPLATE_IDS: string[] = [];

export const FREE_EDIT_FIELDS = [
  "title",
  "message",
  "eventDateTime",
  "venueName",
  "venueAddress",
  "groomPhone",
  "bridePhone",
  "mapAddress",
  "naverMapLink",
  "transportNote"
] as const;

export const PAID_CHANGE_FIELDS = [
  "mainImageUrl",
  "mainImagePath",
  "backgroundImageUrl",
  "backgroundImagePath",
  "galleryImages",
  "galleryImagePaths"
] as const;
