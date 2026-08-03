type StoredInvitationAssets = {
  backgroundImagePath?: string;
  backgroundImageUrl?: string;
  galleryImagePaths?: string[];
  galleryImages?: string[];
  mainImagePath?: string;
  mainImageUrl?: string;
  [key: string]: unknown;
};

export const INVITATION_ASSET_PUBLIC_TTL_SECONDS = 120;
export const INVITATION_ASSET_OWNER_TTL_SECONDS = 10 * 60;
export const INVITATION_ASSET_TTL_SECONDS = INVITATION_ASSET_OWNER_TTL_SECONDS;
export const INVITATION_ASSET_BUCKET = "invitation-assets";
export const MAX_GALLERY_ASSET_PATHS = 20;
const CANONICAL_ASSET_PATH = /^([^/]+)\/([a-f0-9]{64})\.(jpg|png|webp)$/;

export function buildPublishedAssetUrl(slug: string, path: string) {
  return `/api/public/assets?slug=${encodeURIComponent(slug)}&path=${encodeURIComponent(path)}`;
}

export function getStoredInvitationAssetPaths(payload: StoredInvitationAssets) {
  const galleryPaths = Array.isArray(payload.galleryImagePaths)
    ? [...new Set(payload.galleryImagePaths)].slice(0, MAX_GALLERY_ASSET_PATHS)
    : [];
  return [...new Set([
    payload.mainImagePath,
    payload.backgroundImagePath,
    ...galleryPaths
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0))];
}

export function isOwnedInvitationAssetPath(path: string, ownerId: string) {
  if (path.length < 1 || path.length > 160 || ownerId.length < 1 || ownerId.length > 128) return false;
  const match = CANONICAL_ASSET_PATH.exec(path);
  return Boolean(match && match[1] === ownerId);
}

export function isSafeSignedAssetUrl(value: string) {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!configured || !value || value.length > 4096) return false;
  try {
    const signed = new URL(value);
    const supabase = new URL(configured);
    return signed.protocol === "https:" && signed.origin === supabase.origin &&
      signed.pathname.startsWith("/storage/v1/object/sign/");
  } catch {
    return false;
  }
}

export async function withInvitationAssetTimeout<T>(value: PromiseLike<T>, timeoutMs = 750) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    throw new Error("invitation_asset_timeout_invalid");
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(value),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("invitation_asset_timeout")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
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
    nextPayload.galleryImages = [...new Set(payload.galleryImagePaths)]
      .slice(0, MAX_GALLERY_ASSET_PATHS)
      .map((path) => buildPublishedAssetUrl(slug, path));
  }

  return nextPayload as T;
}
