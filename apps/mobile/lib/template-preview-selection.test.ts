import { describe, expect, it } from "vitest";
import { retainFirstValidatedTemplateSelection } from "./template-preview-selection";

describe("template preview session selection", () => {
  it("retains the first validated template when later catalog snapshots omit it", () => {
    const selected = retainFirstValidatedTemplateSelection(null, "remote-1", {
      id: "remote-1",
      name: "첫 선택"
    });

    expect(retainFirstValidatedTemplateSelection(selected, "remote-1", null)).toBe(selected);
  });

  it("does not snapshot a missing or mismatched catalog candidate", () => {
    expect(retainFirstValidatedTemplateSelection(null, "remote-1", null)).toBeNull();
    expect(retainFirstValidatedTemplateSelection(null, "remote-1", {
      id: "remote-2",
      name: "다른 디자인"
    })).toBeNull();
  });

  it("does not replace the first preview-session selection after catalog refresh", () => {
    const selected = retainFirstValidatedTemplateSelection(null, "remote-1", {
      id: "remote-1",
      name: "캐시 이름"
    });
    const refreshed = retainFirstValidatedTemplateSelection(selected, "remote-1", {
      id: "remote-1",
      name: "원격 이름"
    });

    expect(refreshed).toBe(selected);
    expect(refreshed?.template.name).toBe("캐시 이름");
  });
});
