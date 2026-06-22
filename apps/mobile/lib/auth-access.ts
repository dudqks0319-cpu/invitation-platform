type UserLike = {
  id?: string | null;
  is_anonymous?: boolean | null;
};

export type AuthStatusLike = "loading" | "anonymous" | "authenticated";
export type RemoteAccessMode = "loading" | "signed-out" | "guest-session" | "full-account";

export function hasRemoteSession(user?: UserLike | null) {
  return Boolean(user?.id);
}

export function isAnonymousUser(user?: UserLike | null) {
  return Boolean(user?.is_anonymous);
}

export function hasFullAccount(user?: UserLike | null) {
  return hasRemoteSession(user) && !isAnonymousUser(user);
}

export function getRemoteAccessMode(status: AuthStatusLike, user?: UserLike | null): RemoteAccessMode {
  if (status === "loading") {
    return "loading";
  }

  if (status === "authenticated" && hasFullAccount(user)) {
    return "full-account";
  }

  if (status === "authenticated" && hasRemoteSession(user)) {
    return "guest-session";
  }

  return "signed-out";
}

export function getPaidPublishBlockReason(status: AuthStatusLike, user?: UserLike | null) {
  const accessMode = getRemoteAccessMode(status, user);

  if (accessMode === "loading") {
    return "로그인 상태를 확인하는 중입니다.";
  }

  if (accessMode !== "full-account") {
    return "계정 관리 기능은 이메일 또는 소셜 로그인 후 사용할 수 있습니다.";
  }

  return "";
}

export function getDraftOwnerId(user?: UserLike | null) {
  return user?.id || "local-preview-owner";
}
