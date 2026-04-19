import { describe, expect, it } from "vitest";
import {
  getDraftOwnerId,
  getPaidPublishBlockReason,
  getRemoteAccessMode,
  hasFullAccount,
  hasRemoteSession,
  isAnonymousUser
} from "./auth-access";

describe("auth-access", () => {
  it("treats missing users as local-only", () => {
    expect(hasRemoteSession(null)).toBe(false);
    expect(isAnonymousUser(null)).toBe(false);
    expect(hasFullAccount(null)).toBe(false);
    expect(getDraftOwnerId(null)).toBe("local-preview-owner");
  });

  it("treats anonymous users as remote but not paid-capable", () => {
    const user = {
      id: "guest-user",
      is_anonymous: true
    };

    expect(hasRemoteSession(user)).toBe(true);
    expect(isAnonymousUser(user)).toBe(true);
    expect(hasFullAccount(user)).toBe(false);
    expect(getDraftOwnerId(user)).toBe("guest-user");
  });

  it("treats normal users as full accounts", () => {
    const user = {
      id: "real-user",
      is_anonymous: false
    };

    expect(hasRemoteSession(user)).toBe(true);
    expect(isAnonymousUser(user)).toBe(false);
    expect(hasFullAccount(user)).toBe(true);
    expect(getDraftOwnerId(user)).toBe("real-user");
  });

  it("treats loading auth state as unresolved even without a user", () => {
    expect(getRemoteAccessMode("loading", null)).toBe("loading");
    expect(getPaidPublishBlockReason("loading", null)).toBe("로그인 상태를 확인하는 중입니다.");
  });

  it("classifies authenticated anonymous sessions separately from full accounts", () => {
    const user = {
      id: "guest-user",
      is_anonymous: true
    };

    expect(getRemoteAccessMode("authenticated", user)).toBe("guest-session");
    expect(getPaidPublishBlockReason("authenticated", user)).toBe(
      "유료 발행은 이메일 또는 소셜 로그인 후 사용할 수 있습니다."
    );
  });

  it("allows paid publish only for authenticated full accounts", () => {
    const user = {
      id: "real-user",
      is_anonymous: false
    };

    expect(getRemoteAccessMode("authenticated", user)).toBe("full-account");
    expect(getPaidPublishBlockReason("authenticated", user)).toBe("");
  });
});
