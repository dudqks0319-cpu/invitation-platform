import { templates } from "@/lib/templates";

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
  "wedding-green-arch"
] as const;

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
});
