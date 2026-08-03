import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(import.meta.dirname, "builder-studio.tsx"),
  "utf8"
);

describe("builder publish security", () => {
  it("persists only a draft before asking the authenticated server to publish", () => {
    expect(source).toContain(
      'const writeStatus = status === "published" ? "draft" : status;'
    );
    expect(source).toContain("status: writeStatus");
    expect(source).toContain("published_at: null");
    expect(source).toContain('fetch("/api/payments/free-publish"');
  });

  it("does not delete uploaded assets after the draft row has been persisted", () => {
    expect(source).toContain(
      "if (!rowPersisted && rollbackPaths.length > 0)"
    );
  });
});
