import { describe, expect, it } from "vitest";
import { createTemplatePreviewDestination } from "./template-discovery-navigation";

describe("template preview navigation contract", () => {
  it("creates a Task 3 compatible destination with only a bounded template ID", () => {
    expect(createTemplatePreviewDestination("wedding-classic")).toEqual({
      pathname: "/template-preview",
      params: { templateId: "wedding-classic" }
    });
    expect(createTemplatePreviewDestination("../builder/step1-basic")).toBeNull();
    expect(createTemplatePreviewDestination("a".repeat(81))).toBeNull();
  });
});
