import { describe, expect, it } from "vitest";
import {
  createTemplatePreviewDestination,
  createTemplatePreviewIntentKey,
  isValidTemplatePreviewIntentKey
} from "./template-discovery-navigation";

describe("template preview navigation contract", () => {
  it("creates a Task 3 compatible destination with only a bounded template ID", () => {
    expect(createTemplatePreviewDestination("wedding-classic", "preview-intent-abc123")).toEqual({
      pathname: "/template-preview",
      params: { templateId: "wedding-classic", previewIntentKey: "preview-intent-abc123" }
    });
    expect(createTemplatePreviewDestination("../builder/step1-basic")).toBeNull();
    expect(createTemplatePreviewDestination("a".repeat(81))).toBeNull();
  });

  it("creates distinct bounded non-PII preview intent keys", () => {
    const first = createTemplatePreviewIntentKey(1234);
    const second = createTemplatePreviewIntentKey(1234);
    expect(first).not.toBe(second);
    expect(isValidTemplatePreviewIntentKey(first)).toBe(true);
    expect(first).not.toMatch(/@|email|phone|user|owner/i);
    expect(isValidTemplatePreviewIntentKey("../draft")).toBe(false);
  });
});
