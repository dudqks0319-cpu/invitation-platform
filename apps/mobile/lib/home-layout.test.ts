import { describe, expect, it } from "vitest";
import { getMobileHomeHeaderAction, getMobileHomeLayoutMode, getTemplateScrollTargetY } from "./home-layout";

describe("mobile home layout mode", () => {
  it("puts resume actions before templates for full signed-in users", () => {
    expect(
      getMobileHomeLayoutMode("authenticated", {
        id: "user-1",
        is_anonymous: false
      })
    ).toBe("resume-first");
  });

  it("keeps template exploration first for guests and anonymous sessions", () => {
    expect(getMobileHomeLayoutMode("anonymous", null)).toBe("templates-first");
    expect(
      getMobileHomeLayoutMode("authenticated", {
        id: "anon-1",
        is_anonymous: true
      })
    ).toBe("templates-first");
  });

  it("scrolls the new design action near the template gallery without going negative", () => {
    expect(getTemplateScrollTargetY(240)).toBe(228);
    expect(getTemplateScrollTargetY(8)).toBe(0);
  });

  it("does not show the login header action to full signed-in users", () => {
    expect(
      getMobileHomeHeaderAction("authenticated", {
        id: "user-1",
        is_anonymous: false
      })
    ).toEqual({
      accessibilityLabel: "내 초대장 목록",
      label: "내 초대장",
      pathname: "/(tabs)/my-invitations"
    });
    expect(getMobileHomeHeaderAction("anonymous", null)).toEqual({
      accessibilityLabel: "로그인",
      label: "로그인",
      pathname: "/login"
    });
  });
});
