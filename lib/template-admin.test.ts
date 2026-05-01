import { describe, expect, it } from "vitest";
import { isTemplateAdminEmail, parseTemplateAdminEmails } from "@/lib/template-admin";

describe("template admin auth", () => {
  it("parses comma and whitespace separated admin emails", () => {
    expect(parseTemplateAdminEmails("owner@example.com, admin@example.com\nops@example.com")).toEqual([
      "owner@example.com",
      "admin@example.com",
      "ops@example.com"
    ]);
  });

  it("requires allowlisted email when an allowlist exists", () => {
    expect(isTemplateAdminEmail("owner@example.com", { allowlist: ["owner@example.com"], nodeEnv: "production" })).toBe(true);
    expect(isTemplateAdminEmail("guest@example.com", { allowlist: ["owner@example.com"], nodeEnv: "production" })).toBe(false);
  });

  it("denies production access when no allowlist is configured", () => {
    expect(isTemplateAdminEmail("owner@example.com", { allowlist: [], nodeEnv: "production" })).toBe(false);
  });
});

