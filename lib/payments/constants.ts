export const INVITATION_PRICE_KRW = 4900;
export const INVITATION_CURRENCY = "KRW";
export const INVITATION_ITEM_NAME = "InviteHub 초대장 발행";

export const FREE_EDIT_FIELDS = [
  "title",
  "message",
  "eventDateTime",
  "venueName",
  "venueAddress",
  "groomPhone",
  "bridePhone",
  "naverMapLink",
  "transportNote"
] as const;

export const PAID_CHANGE_FIELDS = [
  "templateId",
  "mainImageUrl",
  "mainImagePath",
  "backgroundImageUrl",
  "backgroundImagePath"
] as const;
