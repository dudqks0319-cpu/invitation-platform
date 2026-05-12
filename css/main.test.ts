import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "css/main.css"), "utf8");

describe("responsive and focus CSS", () => {
  it("prevents template showcase overflow on narrow mobile widths", () => {
    expect(css).toContain("grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr))");
  });

  it("stacks dashboard rows and actions on mobile widths", () => {
    expect(css).toContain("@media (max-width: 860px)");
    expect(css).toContain(".dashboard-invitation-row");
    expect(css).toContain("grid-template-columns: 1fr");
    expect(css).toContain("@media (max-width: 420px)");
    expect(css).toContain(".dashboard-row-actions a,");
    expect(css).toContain("width: 100%");
  });

  it("replaces global outline removal with visible keyboard focus styles", () => {
    expect(css).toContain("button:focus-visible");
    expect(css).toContain(".btn-primary:focus-visible");
    expect(css).toContain(".overlay-btn:focus-visible");
    expect(css).toContain("outline: 3px solid rgba(201,147,90,0.45)");
  });
});
