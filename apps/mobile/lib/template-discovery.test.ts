import { describe, expect, it } from "vitest";
import type { MobileTemplateGalleryItem } from "./template-gallery";
import {
  filterTemplateDiscoveryItems,
  getTemplateDiscoveryActiveFilterSummary,
  normalizeTemplateDiscoveryQuery,
  TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH,
  type TemplateDiscoveryFilters
} from "./template-discovery";

const templates: MobileTemplateGalleryItem[] = [
  {
    id: "wedding-flower",
    category: "wedding",
    badge: "결혼식",
    name: "  봄  플라워  아치 ",
    desc: "따뜻한  여백의  모바일 청첩장",
    tags: ["#플라워", "#애니", "#여백"]
  },
  {
    id: "dol-pastel",
    category: "dol",
    badge: "돌잔치",
    name: "별빛 첫돌",
    desc: "포근한 파스텔 돌잔치 카드",
    tags: ["#파스텔", "#캐릭터"]
  },
  {
    id: "unclassified",
    category: "unknown-event",
    badge: "특별한 날",
    name: "우리의 모임",
    desc: "새로운 시작을 알리는 초대장",
    tags: ["#여백"]
  },
  {
    id: "wedding-flower-second",
    category: "wedding",
    badge: "결혼식",
    name: "플라워 편지",
    desc: "차분한 웨딩 디자인",
    tags: ["#플라워", "#애니"]
  }
];

const categories = [
  { key: "wedding", label: "결혼식", emoji: "💍" },
  { key: "dol", label: "돌잔치", emoji: "🎂" }
];

const allFilters: TemplateDiscoveryFilters = { query: "", category: "all", moods: [] };

describe("template discovery", () => {
  it("normalizes whitespace, case, hashtags, and safely caps unusually long queries", () => {
    expect(normalizeTemplateDiscoveryQuery("  #FLOWER   플라워  ")).toBe("flower 플라워");
    expect(normalizeTemplateDiscoveryQuery("#애니")).toBe("애니");
    expect(() => normalizeTemplateDiscoveryQuery("!@#$%^&*()[]{}?")).not.toThrow();
    expect(() => filterTemplateDiscoveryItems(templates, { ...allFilters, query: "!@#$%^&*()[]{}?" }, categories)).not.toThrow();
    const pastedQuery = normalizeTemplateDiscoveryQuery("가".repeat(TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH + 420));
    expect(pastedQuery).toHaveLength(TEMPLATE_DISCOVERY_QUERY_MAX_LENGTH);
  });

  it("searches only reviewed display metadata with Korean partial matching", () => {
    expect(filterTemplateDiscoveryItems(templates, { ...allFilters, query: "라워" }, categories).map((item) => item.id)).toEqual([
      "wedding-flower",
      "wedding-flower-second"
    ]);
    expect(filterTemplateDiscoveryItems(templates, { ...allFilters, query: "결혼" }, categories).map((item) => item.id)).toEqual([
      "wedding-flower",
      "wedding-flower-second"
    ]);
    expect(filterTemplateDiscoveryItems(templates, { ...allFilters, query: "#애니" }, categories).map((item) => item.id)).toEqual([
      "wedding-flower",
      "wedding-flower-second"
    ]);
  });

  it("combines category, every selected mood, and query with AND while preserving source order", () => {
    const filters: TemplateDiscoveryFilters = {
      category: "wedding",
      moods: ["floral", "animation"],
      query: "플라워"
    };

    expect(filterTemplateDiscoveryItems(templates, filters, categories).map((item) => item.id)).toEqual([
      "wedding-flower",
      "wedding-flower-second"
    ]);
    expect(filterTemplateDiscoveryItems(templates, filters, categories).map((item) => item.id)).toEqual(
      filterTemplateDiscoveryItems(templates, filters, categories).map((item) => item.id)
    );
  });

  it("keeps uncategorized templates in 전체 and never infers moods from file names", () => {
    expect(filterTemplateDiscoveryItems(templates, allFilters, categories).map((item) => item.id)).toContain("unclassified");
    expect(filterTemplateDiscoveryItems(templates, { ...allFilters, moods: ["animation"] }, categories).map((item) => item.id)).not.toContain(
      "unclassified"
    );
  });

  it("summarizes active filters using visible labels", () => {
    expect(getTemplateDiscoveryActiveFilterSummary({ category: "wedding", moods: ["floral"], query: "봄" }, categories)).toBe(
      "결혼식 · 플라워 · 봄"
    );
  });
});
