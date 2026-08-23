import { describe, expect, it } from "vitest";
import { POST_LOGIN_ROUTE, shouldLeaveLoginScreen, shouldUpgradeAnonymousAccount } from "./auth-completion";

describe("auth-completion", () => {
  it("routes full accounts away from the login screen after Apple or email auth succeeds", () => {
    expect(POST_LOGIN_ROUTE).toBe("/(tabs)/my-invitations");
    expect(
      shouldLeaveLoginScreen({
        hasSession: true,
        status: "authenticated",
        user: { id: "full-user", is_anonymous: false }
      })
    ).toBe(true);
  });

  it("keeps anonymous guest sessions on the login screen until they become full accounts", () => {
    const guestUser = { id: "guest-user", is_anonymous: true };

    expect(shouldLeaveLoginScreen({ hasSession: true, status: "authenticated", user: guestUser })).toBe(false);
    expect(shouldUpgradeAnonymousAccount("authenticated", guestUser)).toBe(true);
  });

  it("does not treat loading or signed-out states as completed auth", () => {
    expect(shouldLeaveLoginScreen({ hasSession: false, status: "loading", user: null })).toBe(false);
    expect(shouldLeaveLoginScreen({ hasSession: false, status: "anonymous", user: null })).toBe(false);
    expect(
      shouldLeaveLoginScreen({
        hasSession: false,
        status: "authenticated",
        user: { id: "full-user", is_anonymous: false }
      })
    ).toBe(false);
    expect(shouldUpgradeAnonymousAccount("anonymous", null)).toBe(false);
  });
});
