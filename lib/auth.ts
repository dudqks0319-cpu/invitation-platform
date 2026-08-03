const DEFAULT_AUTH_DESTINATION = "/dashboard";
export const TEMP_SINGLE_INVITATION_PRICE_WON = 0;
export const TEMP_SINGLE_INVITATION_PRICE_LABEL = "무료";
export const TEMP_SINGLE_INVITATION_PRICE_COPY = "현재 공개 디자인은 모두 무료";

export function normalizeNextPath(value: string | null | undefined, fallback = DEFAULT_AUTH_DESTINATION) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(trimmed) ||
    /%(?:00|0a|0d|2f|5c)/i.test(trimmed)
  ) {
    return fallback;
  }

  return trimmed;
}

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export function deriveDisplayName(user: UserLike) {
  const metadata = user.user_metadata ?? {};

  for (const key of ["display_name", "full_name", "name", "nickname", "user_name"]) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    return user.email.split("@")[0];
  }

  return "InviteHub 사용자";
}

export const authDestination = {
  dashboard: DEFAULT_AUTH_DESTINATION,
  checkout: "/checkout"
};
