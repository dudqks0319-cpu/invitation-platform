export type InvitationDeleteMode = "local-only" | "guest-owner" | "account-remote" | "blocked-server";

type InvitationDeletePolicyInput = {
  guestOwnerToken?: unknown;
  hasFullAccount: boolean;
  isPublished: boolean;
  serverId?: string | null;
};

export function getInvitationDeleteMode({
  guestOwnerToken,
  hasFullAccount,
  isPublished,
  serverId
}: InvitationDeletePolicyInput): InvitationDeleteMode {
  if (!serverId) {
    return "local-only";
  }

  if (isPublished && typeof guestOwnerToken === "string" && guestOwnerToken.length > 0) {
    return "guest-owner";
  }

  if (hasFullAccount) {
    return "account-remote";
  }

  return "blocked-server";
}
