import { existsSync } from "node:fs";
import path from "node:path";

import { mobileTemplateGallery } from "../apps/mobile/lib/template-gallery";
import { getTemplateDefaultTextPlacement, templates } from "@/lib/templates";

const newWeddingTemplateIds = [
  "wedding-photo-minimal",
  "wedding-blush-petal",
  "wedding-traditional-knot",
  "wedding-envelope-photo",
  "wedding-gold-botanical",
  "wedding-illustration-curtain",
  "wedding-botanical-vertical",
  "wedding-photo-overlay",
  "wedding-photo-hero",
  "wedding-green-arch",
  "wedding-anime-textspace-01",
  "wedding-anime-textspace-02",
  "wedding-anime-textspace-03",
  "wedding-anime-textspace-04",
  "wedding-anime-textspace-05",
  "wedding-anime-textspace-06",
  "wedding-anime-textspace-07",
  "wedding-anime-textspace-08",
  "wedding-anime-textspace-09",
  "wedding-anime-textspace-10"
] as const;

const newCelebrationTemplateIds = [
  "housewarming-barunson-anime-04",
  "housewarming-barunson-anime-05",
  "housewarming-barunson-anime-06",
  "housewarming-barunson-anime-07",
  "housewarming-barunson-anime-08",
  "hwangap-barunson-anime-04",
  "hwangap-barunson-anime-05",
  "hwangap-barunson-anime-06",
  "chilsun-barunson-anime-01",
  "chilsun-barunson-anime-02",
  "chilsun-barunson-anime-03",
  "palsun-barunson-anime-01",
  "palsun-barunson-anime-02",
  "palsun-barunson-anime-03"
] as const;

const referenceStyleTemplates = [
  { id: "wedding-barunson-anime-19", category: "wedding" },
  { id: "wedding-barunson-anime-20", category: "wedding" },
  { id: "wedding-barunson-anime-21", category: "wedding" },
  { id: "wedding-barunson-anime-22", category: "wedding" },
  { id: "wedding-barunson-anime-23", category: "wedding" },
  { id: "wedding-barunson-anime-24", category: "wedding" },
  { id: "dol-barunson-anime-14", category: "dol" },
  { id: "dol-barunson-anime-15", category: "dol" },
  { id: "housewarming-barunson-anime-09", category: "housewarming" },
  { id: "birthday-barunson-anime-04", category: "birthday" },
  { id: "baby-barunson-anime-04", category: "baby" },
  { id: "hwangap-barunson-anime-07", category: "hwangap" }
] as const;

const expandedReferenceStyleTemplates = [
  ["wedding", 25, 34],
  ["dol", 16, 25],
  ["birthday", 5, 14],
  ["baby", 5, 14],
  ["housewarming", 10, 19],
  ["hwangap", 8, 17]
].flatMap(([category, start, end]) =>
  Array.from({ length: Number(end) - Number(start) + 1 }, (_, index) => ({
    id: `${category}-barunson-anime-${String(Number(start) + index).padStart(2, "0")}`,
    category
  }))
);

const representativeTemplates = [
  { id: "wedding-classic", removedEmoji: "🌸" },
  { id: "dol-cute", removedEmoji: "👶" },
  { id: "hwangap-classic", removedEmoji: "🕊️" },
  { id: "bridal-pink", removedEmoji: "👑" },
  { id: "birthday-fun", removedEmoji: "🎉" },
  { id: "house-warm", removedEmoji: "🏡" },
  { id: "baby-shower", removedEmoji: "⭐💫⭐" },
  { id: "graduation", removedEmoji: "🎓" },
  { id: "business", removedEmoji: "📋" }
] as const;

describe("template artwork mapping", () => {
  it("centers copy on border artwork while keeping photo artwork details below", () => {
    const centeredTemplate = templates.find((template) => template.id === "wedding-rose-gold");
    const photoTemplate = templates.find((template) => template.id === "wedding-barunson-anime-04");

    expect(centeredTemplate).toBeDefined();
    expect(photoTemplate).toBeDefined();
    expect(getTemplateDefaultTextPlacement(centeredTemplate!)).toBe("center");
    expect(getTemplateDefaultTextPlacement(photoTemplate!)).toBe("bottom");
  });

  it("maps representative templates to local genspark artwork instead of emoji-only hero visuals", () => {
    for (const { id, removedEmoji } of representativeTemplates) {
      const template = templates.find((item) => item.id === id);

      expect(template, `${id} template should exist`).toBeDefined();
      expect(template?.html).toContain("/images/");
      expect(template?.html).not.toContain(removedEmoji);
    }
  });

  it("registers the new textless wedding artwork templates as editable canvases", () => {
    for (const id of newWeddingTemplateIds) {
      const template = templates.find((item) => item.id === id);

      expect(template, `${id} template should exist`).toBeDefined();
      expect(template?.category).toBe("wedding");
      expect(template?.html).toContain("tmpl-standalone-art");
      expect(template?.html).toContain("/images/custom/wedding/");
      expect(template?.html).toContain(".png");
    }
  });

  it("registers every mobile template id for public invitation rendering", () => {
    const webTemplateIds = new Set(templates.map((template) => template.id));
    const missingWebTemplates = mobileTemplateGallery
      .filter((template) => !webTemplateIds.has(template.id))
      .map((template) => template.id);

    expect(missingWebTemplates).toEqual([]);
  });

  it("registers new housewarming and milestone birthday anime templates with local png artwork", () => {
    for (const id of newCelebrationTemplateIds) {
      const template = templates.find((item) => item.id === id);

      expect(template, `${id} template should exist`).toBeDefined();
      expect(template?.html).toContain("/images/custom/barunson-category-anime-2026/");
      expect(template?.html).toContain(".png");
    }
  });

  it("registers the reference-style artwork at a centered, text-safe placement", () => {
    for (const { id, category } of referenceStyleTemplates) {
      const template = templates.find((item) => item.id === id);

      expect(template, `${id} template should exist`).toBeDefined();
      expect(template?.category).toBe(category);
      expect(template?.html).toContain("/images/custom/barunson-category-anime-2026/");
      expect(template?.html).toContain(".png");
      expect(getTemplateDefaultTextPlacement(template!)).toBe("center");
    }
  });

  it("registers 10 distinct new invitation backgrounds for each expanded event category", () => {
    expect(expandedReferenceStyleTemplates).toHaveLength(60);

    for (const { id, category } of expandedReferenceStyleTemplates) {
      const template = templates.find((item) => item.id === id);

      expect(template, `${id} template should exist`).toBeDefined();
      expect(template?.category).toBe(category);
      expect(template?.html).toContain(`/images/custom/barunson-category-anime-2026/${category}-`);
      expect(template?.html).toContain(".png");
      expect(getTemplateDefaultTextPlacement(template!)).toBe("center");
    }
  });

  it("serves every template image from public assets", () => {
    const missingImages = templates
      .map((template) => {
        const src = template.html.match(/src="([^"]+)"/)?.[1] ?? "";
        const publicPath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
        return existsSync(publicPath) ? null : `${template.id}:${src}`;
      })
      .filter((entry): entry is string => Boolean(entry));

    expect(missingImages).toEqual([]);
  });
});
