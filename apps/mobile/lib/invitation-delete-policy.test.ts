import { describe, expect, it } from "vitest";
import { getInvitationDeleteMode } from "./invitation-delete-policy";

describe("mobile invitation delete policy", () => {
  it("deletes a guest-published record with its owner token before considering account state", () => {
    expect(getInvitationDeleteMode({
      guestOwnerToken: "a".repeat(43),
      hasFullAccount: false,
      isPublished: true,
      serverId: "guest-server-id"
    })).toBe("guest-owner");

    expect(getInvitationDeleteMode({
      guestOwnerToken: "a".repeat(43),
      hasFullAccount: true,
      isPublished: true,
      serverId: "guest-server-id"
    })).toBe("guest-owner");
  });

  it("uses the account-owned remote delete path only for a full account", () => {
    expect(getInvitationDeleteMode({
      hasFullAccount: true,
      isPublished: true,
      serverId: "account-server-id"
    })).toBe("account-remote");
  });

  it("allows local-only deletion when no server record exists", () => {
    expect(getInvitationDeleteMode({
      hasFullAccount: false,
      isPublished: false,
      serverId: null
    })).toBe("local-only");
  });

  it("fails closed when a server record has no verifiable deletion authority", () => {
    expect(getInvitationDeleteMode({
      guestOwnerToken: "",
      hasFullAccount: false,
      isPublished: true,
      serverId: "unknown-server-id"
    })).toBe("blocked-server");
  });
});
