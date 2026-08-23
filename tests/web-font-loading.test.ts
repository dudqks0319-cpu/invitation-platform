import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
const globalStyles = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
const landingStyles = readFileSync(join(process.cwd(), "css/main.css"), "utf8");

describe("web font loading", () => {
  it("keeps production builds independent from Google Fonts", () => {
    expect(layoutSource).not.toContain("next/font/google");
    expect(globalStyles).toContain("--font-body:");
    expect(globalStyles).toContain("--font-serif:");
    expect(globalStyles).toContain("--font-display:");
  });

  it("does not overwrite the selected or hovered home category contrast", () => {
    expect(landingStyles).toContain(".home-page .cat-tab:not(:hover):not(.active),");
  });
});
