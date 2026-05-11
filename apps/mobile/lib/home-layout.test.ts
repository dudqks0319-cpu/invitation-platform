import { describe, expect, it } from "vitest";
import { getMobileHomeLayoutMode } from "./home-layout";

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
});
