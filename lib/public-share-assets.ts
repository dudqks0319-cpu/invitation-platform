export const PUBLIC_QR_IMAGE_SIZE = {
  width: 1024,
  height: 1024
} as const;

export const publicShareImageFormats = ["instagram", "a4"] as const;

export type PublicShareImageFormat = (typeof publicShareImageFormats)[number];

export const PUBLIC_SHARE_IMAGE_SIZES: Record<PublicShareImageFormat, { width: number; height: number }> = {
  instagram: {
    width: 1080,
    height: 1080
  },
  a4: {
    width: 1240,
    height: 1754
  }
};

export function isPublicShareImageFormat(value: string): value is PublicShareImageFormat {
  return (publicShareImageFormats as readonly string[]).includes(value);
}

export function buildPublicQrImagePath(slug: string) {
  return `/api/qr/${encodeURIComponent(slug)}`;
}

export function buildPublicCalendarPath(slug: string) {
  return `/api/calendar/${encodeURIComponent(slug)}`;
}

export function buildPublicShareImagePath(slug: string, format: PublicShareImageFormat) {
  return `/api/share/${format}/${encodeURIComponent(slug)}`;
}

export function buildPublicInvitationSharePath(slug: string) {
  return `/invitations/${encodeURIComponent(slug)}`;
}

export function buildPublicInvitationShareUrl(slug: string, origin: string) {
  return new URL(buildPublicInvitationSharePath(slug), origin).toString();
}
