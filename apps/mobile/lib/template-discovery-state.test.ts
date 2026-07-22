import { describe, expect, it } from "vitest";
import {
  createInitialTemplateDiscoveryState,
  enterTemplateDiscovery,
  updateTemplateDiscoveryScrollOffset
} from "./template-discovery-state";

describe("template discovery route preservation", () => {
  it("preserves a wedding entry across preview return, then resets for a fresh birthday entry", () => {
    const initial = createInitialTemplateDiscoveryState();
    const categories = new Set(["wedding", "dol", "birthday"]);
    const routed = enterTemplateDiscovery(initial, { entryKey: "entry-wedding-1", category: "wedding" }, categories);
    const changed = {
      ...routed,
      filters: { query: "플라워", category: "dol", moods: ["pastel"] }
    };
    const scrolled = updateTemplateDiscoveryScrollOffset(changed, 812.4);
    const returned = enterTemplateDiscovery(
      scrolled,
      { entryKey: "entry-wedding-1", category: "wedding" },
      categories
    );

    expect(returned.filters).toEqual({ query: "플라워", category: "dol", moods: ["pastel"] });
    expect(returned.scrollOffset).toBe(812.4);

    const freshBirthday = enterTemplateDiscovery(
      returned,
      { entryKey: "entry-birthday-2", category: "birthday" },
      categories
    );
    expect(freshBirthday.filters).toEqual({ query: "", category: "birthday", moods: [] });
    expect(freshBirthday.scrollOffset).toBe(0);
  });

  it("rejects invalid route categories and unsafe scroll offsets", () => {
    const initial = createInitialTemplateDiscoveryState();
    expect(
      enterTemplateDiscovery(initial, { entryKey: "entry-invalid", category: "unknown" }, new Set(["wedding"])).filters.category
    ).toBe("all");
    expect(updateTemplateDiscoveryScrollOffset(initial, Number.NaN).scrollOffset).toBe(0);
    expect(updateTemplateDiscoveryScrollOffset(initial, -42).scrollOffset).toBe(0);
  });
});
