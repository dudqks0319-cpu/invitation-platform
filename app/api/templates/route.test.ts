import { describe, expect, it, vi } from "vitest";
import { defaultSafeTemplates } from "@/lib/safe-templates";

const { fetchSafeTemplatesMock } = vi.hoisted(() => ({
  fetchSafeTemplatesMock: vi.fn()
}));

vi.mock("@/lib/template-repository", () => ({
  fetchSafeTemplates: fetchSafeTemplatesMock
}));

import { GET } from "@/app/api/templates/route";
import { buildTemplateResponse } from "@/lib/template-api-response";

describe("GET /api/templates", () => {
  it("returns active templates with public response metadata", async () => {
    fetchSafeTemplatesMock.mockResolvedValue(defaultSafeTemplates.slice(0, 2));

    const response = await GET();
    const payload = await response.json();

    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    expect(payload.templates).toHaveLength(2);
    expect(payload.meta).toEqual({
      count: 2,
      categories: ["wedding"]
    });
  });

  it("builds deterministic metadata for mixed categories", () => {
    const payload = buildTemplateResponse(defaultSafeTemplates);

    expect(payload.meta.count).toBe(defaultSafeTemplates.length);
    expect(payload.meta.categories).toEqual(["anniversary", "birthday", "firstBirthday", "wedding"]);
  });
});
