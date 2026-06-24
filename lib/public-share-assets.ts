export const PUBLIC_QR_IMAGE_SIZE = {
  width: 1024,
  height: 1024
} as const;

export function buildPublicQrImagePath(slug: string) {
  return `/api/qr/${encodeURIComponent(slug)}`;
}

export function buildPublicInvitationSharePath(slug: string) {
  return `/invitations/${encodeURIComponent(slug)}`;
}

export function buildPublicInvitationShareUrl(slug: string, origin: string) {
  return new URL(buildPublicInvitationSharePath(slug), origin).toString();
}
