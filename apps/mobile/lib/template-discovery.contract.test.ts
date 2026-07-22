import { describe, expect, it } from "vitest";
import { buildPublicMobileTemplateCatalog } from "../../../lib/mobile-template-catalog";
import { templates as canonicalTemplates } from "../../../lib/templates";
import { templateCatalogContract } from "./template-catalog.contract.fixture";
import { filterTemplateDiscoveryItems } from "./template-discovery";
import { mobileTemplateCategories, mobileTemplateGallery, type MobileTemplateGalleryItem } from "./template-gallery";

const remoteTemplates: MobileTemplateGalleryItem[] = buildPublicMobileTemplateCatalog(
  canonicalTemplates,
  "task-2-canonical-fixture"
).catalog.templates.map((template) => ({ ...template, remote: true }));

const representativeCases = [
  ["wedding", "결혼식", "wedding-barunson-anime-25"],
  ["wedding", "들꽃 아치", "wedding-barunson-anime-25"],
  ["wedding", "#웨딩", "wedding-barunson-anime-25"],
  ["dol", "돌잔치", "dol-barunson-anime-16"],
  ["dol", "달토끼 첫별", "dol-barunson-anime-16"],
  ["dol", "#캐릭터", "dol-barunson-anime-16"],
  ["hwangap", "환갑잔치", "hwangap-barunson-anime-08"],
  ["hwangap", "학과 붉은 모란", "hwangap-barunson-anime-08"],
  ["hwangap", "#민화", "hwangap-barunson-anime-08"],
  ["bridal", "브라이덜샤워", "bridal-barunson-anime-01"],
  ["bridal", "브라이덜 블룸 01", "bridal-barunson-anime-01"],
  ["bridal", "#브라이덜", "bridal-barunson-anime-01"],
  ["birthday", "생일파티", "birthday-barunson-anime-05"],
  ["birthday", "북극곰 케이크", "birthday-barunson-anime-05"],
  ["birthday", "#생일", "birthday-barunson-anime-05"],
  ["housewarming", "집들이", "housewarming-barunson-anime-10"],
  ["housewarming", "빨간 지붕 화분집", "housewarming-barunson-anime-10"],
  ["housewarming", "#홈", "housewarming-barunson-anime-10"],
  ["baby", "베이비샤워", "baby-barunson-anime-05"],
  ["baby", "달토끼 모빌", "baby-barunson-anime-05"],
  ["baby", "#베이비", "baby-barunson-anime-05"],
  ["graduation", "졸업파티", "graduation-barunson-anime-01"],
  ["graduation", "졸업 세리머니 01", "graduation-barunson-anime-01"],
  ["graduation", "#졸업", "graduation-barunson-anime-01"],
  ["business", "비즈니스", "business-barunson-anime-01"],
  ["business", "컨퍼런스 라이트 01", "business-barunson-anime-01"],
  ["business", "#컨퍼런스", "business-barunson-anime-01"]
] as const;

describe("template discovery catalog contracts", () => {
  it("renders every bundled item once", () => {
    const results = filterTemplateDiscoveryItems(
      mobileTemplateGallery,
      { query: "", category: "all", moods: [] },
      mobileTemplateCategories
    );
    expect(results).toHaveLength(templateCatalogContract.bundledTemplateCount);
    expect(new Set(results.map((item) => item.id)).size).toBe(templateCatalogContract.bundledTemplateCount);
  });

  it("uses the canonical public remote catalog with exactly 180 unique complete records", () => {
    expect(remoteTemplates).toHaveLength(templateCatalogContract.remoteTemplateCount);
    expect(new Set(remoteTemplates.map((item) => item.id)).size).toBe(templateCatalogContract.remoteTemplateCount);
    expect(
      remoteTemplates.filter((template) =>
        templateCatalogContract.remoteRequiredMetadata.some((field) => {
          const value = template[field as keyof typeof template];
          return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
        })
      )
    ).toEqual([]);
  });

  it.each(representativeCases)(
    "returns fixed canonical result %s / %s -> %s",
    (category, query, expectedId) => {
      const results = filterTemplateDiscoveryItems(
        remoteTemplates,
        { query, category, moods: [] },
        mobileTemplateCategories
      );
      expect(results.map((item) => item.id)).toContain(expectedId);
      expect(results.every((item) => item.category === category)).toBe(true);
    }
  );
});
