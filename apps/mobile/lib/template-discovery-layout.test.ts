import { describe, expect, it } from "vitest";
import {
  getTemplateDiscoveryCardWidth,
  getTemplateDiscoveryColumnCount,
  TEMPLATE_DISCOVERY_COLUMN_GAP,
  TEMPLATE_DISCOVERY_HORIZONTAL_INSET
} from "./template-discovery-layout";

describe("template discovery grid layout", () => {
  it.each([375, 393, 430])("fits two cards within a %ipx content width", (contentWidth) => {
    const cardWidth = getTemplateDiscoveryCardWidth(contentWidth, 1);
    const occupied = TEMPLATE_DISCOVERY_HORIZONTAL_INSET * 2 + cardWidth * 2 + TEMPLATE_DISCOVERY_COLUMN_GAP;

    expect(getTemplateDiscoveryColumnCount(1)).toBe(2);
    expect(occupied).toBeLessThanOrEqual(contentWidth);
    expect(cardWidth).toBeGreaterThanOrEqual(150);
  });

  it("switches to one readable column at large dynamic type", () => {
    expect(getTemplateDiscoveryColumnCount(1.59)).toBe(2);
    expect(getTemplateDiscoveryColumnCount(1.6)).toBe(1);
    expect(getTemplateDiscoveryCardWidth(375, 1.6)).toBe(375 - TEMPLATE_DISCOVERY_HORIZONTAL_INSET * 2);
  });
});
