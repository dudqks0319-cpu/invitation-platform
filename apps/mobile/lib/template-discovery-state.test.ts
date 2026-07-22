import { describe, expect, it } from "vitest";
import {
  createInitialTemplateDiscoveryState,
  initializeTemplateDiscoveryCategory,
  updateTemplateDiscoveryScrollOffset
} from "./template-discovery-state";

describe("template discovery route preservation", () => {
  it("initializes a route category once and preserves later filter and scroll choices", () => {
    const initial = createInitialTemplateDiscoveryState();
    const routed = initializeTemplateDiscoveryCategory(initial, "wedding", new Set(["wedding", "dol"]));
    const changed = {
      ...routed,
      filters: { query: "플라워", category: "dol", moods: ["pastel"] }
    };
    const scrolled = updateTemplateDiscoveryScrollOffset(changed, 812.4);
    const returned = initializeTemplateDiscoveryCategory(scrolled, "wedding", new Set(["wedding", "dol"]));

    expect(returned.filters).toEqual({ query: "플라워", category: "dol", moods: ["pastel"] });
    expect(returned.scrollOffset).toBe(812.4);
  });

  it("rejects invalid route categories and unsafe scroll offsets", () => {
    const initial = createInitialTemplateDiscoveryState();
    expect(initializeTemplateDiscoveryCategory(initial, "unknown", new Set(["wedding"])).filters.category).toBe("all");
    expect(updateTemplateDiscoveryScrollOffset(initial, Number.NaN).scrollOffset).toBe(0);
    expect(updateTemplateDiscoveryScrollOffset(initial, -42).scrollOffset).toBe(0);
  });
});
