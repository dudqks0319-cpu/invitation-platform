import { describe, expect, it } from "vitest";
import { createTemplateDiscoveryEntryKey } from "./template-discovery-entry";

describe("template discovery entry keys", () => {
  it("creates distinct non-PII keys even within the same millisecond", () => {
    const first = createTemplateDiscoveryEntryKey(1234);
    const second = createTemplateDiscoveryEntryKey(1234);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^templates-entry-[a-z0-9]+-[a-z0-9]+$/);
    expect(first).not.toMatch(/@|\+|user|email|phone/i);
  });
});
