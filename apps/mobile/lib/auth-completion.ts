import { type AuthStatusLike, hasFullAccount, isAnonymousUser } from "./auth-access";

type AuthUserLike = Parameters<typeof hasFullAccount>[0];

export const POST_LOGIN_ROUTE = "/(tabs)/my-invitations" as const;

export function shouldLeaveLoginScreen(options: {
  hasSession: boolean;
  status: AuthStatusLike;
  user?: AuthUserLike;
}) {
  return options.hasSession && options.status === "authenticated" && hasFullAccount(options.user);
}

export function shouldUpgradeAnonymousAccount(status: AuthStatusLike, user?: AuthUserLike) {
  return status === "authenticated" && isAnonymousUser(user);
}
