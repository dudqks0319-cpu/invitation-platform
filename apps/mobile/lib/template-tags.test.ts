import { describe, expect, it } from "vitest";
import { getUniqueTemplateTags } from "./template-tags";

describe("template tag presentation", () => {
  it("deduplicates repeated labels while preserving stable source order", () => {
    expect(getUniqueTemplateTags(["#플라워", "#여백", "#플라워", "#애니", "#여백"])).toEqual([
      "#플라워",
      "#여백",
      "#애니"
    ]);
  });
});
