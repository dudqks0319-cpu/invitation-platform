import {
  filterTemplateCatalog,
  getTemplateCatalogMetadata,
  getTemplateCategoryOptions,
  templateProductGroups,
  templateStyleFilters
} from "@/lib/template-catalog";
import { templates } from "@/lib/templates";

const baseFilters = {
  productGroup: "all",
  category: "all",
  style: "all",
  photoSlot: "all",
  feature: "all",
  query: "",
  sort: "recommended"
} as const;

describe("template catalog filters", () => {
  it("exposes the product and style filters needed for catalog browsing", () => {
    expect(templateProductGroups.map((group) => group.label)).toEqual([
      "전체",
      "청첩장",
      "초대장",
      "비즈니스",
      "메시지카드"
    ]);
    expect(templateStyleFilters.map((style) => style.label)).toContain("포토형");
  });

  it("maps templates into catalog metadata", () => {
    const weddingTemplate = templates.find((template) => template.id === "wedding-classic");

    expect(weddingTemplate).toBeDefined();
    expect(getTemplateCatalogMetadata(weddingTemplate!).productGroup).toBe("wedding");
    expect(getTemplateCatalogMetadata(weddingTemplate!).features).toContain("coworkers");
  });

  it("filters by product group, category, and search query", () => {
    const result = filterTemplateCatalog({
      ...baseFilters,
      productGroup: "invitation",
      query: "돌잔치 파스텔"
    });

    expect(result.map((template) => template.id)).toContain("dol-cute");
    expect(result.every((template) => template.category !== "wedding")).toBe(true);
  });

  it("filters by photo slot and operation recommendation", () => {
    const result = filterTemplateCatalog({
      ...baseFilters,
      productGroup: "wedding",
      photoSlot: "polaroid",
      feature: "coworkers"
    });

    expect(result.map((template) => template.id)).toEqual(["wedding-green-arch"]);
  });

  it("returns only category options available inside a product group", () => {
    expect(getTemplateCategoryOptions("business").map((category) => category.key)).toEqual(["business"]);
    expect(getTemplateCategoryOptions("wedding").map((category) => category.key)).toEqual(["wedding"]);
  });
});
