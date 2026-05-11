type StoredInvitationAssets = {
  backgroundImagePath?: string;
  backgroundImageUrl?: string;
  galleryImagePaths?: string[];
  galleryImages?: string[];
  mainImagePath?: string;
  mainImageUrl?: string;
  [key: string]: unknown;
};

export const INVITATION_ASSET_TTL_SECONDS = 60 * 60 * 24 * 7;
export const INVITATION_ASSET_BUCKET = "invitation-assets";
export const TEMPLATE_ASSET_BUCKET = "template-assets";

export function buildPublishedAssetUrl(slug: string, path: string) {
  return `/api/public/assets?slug=${encodeURIComponent(slug)}&path=${encodeURIComponent(path)}`;
}

export function getStoredInvitationAssetPaths(payload: StoredInvitationAssets) {
  return [
    payload.mainImagePath,
    payload.backgroundImagePath,
    ...(Array.isArray(payload.galleryImagePaths) ? payload.galleryImagePaths : [])
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function buildPublishedInvitationAssetPayload<T extends StoredInvitationAssets>(slug: string, payload: T): T {
  const nextPayload: StoredInvitationAssets = {
    ...payload
  };

  if (payload.mainImagePath) {
    nextPayload.mainImageUrl = buildPublishedAssetUrl(slug, payload.mainImagePath);
  }

  if (payload.backgroundImagePath) {
    nextPayload.backgroundImageUrl = buildPublishedAssetUrl(slug, payload.backgroundImagePath);
  }

  if (Array.isArray(payload.galleryImagePaths) && payload.galleryImagePaths.length > 0) {
    nextPayload.galleryImages = payload.galleryImagePaths.map((path) => buildPublishedAssetUrl(slug, path));
  }

  return nextPayload as T;
}
