import {
  attachPublishedTemplateSnapshot,
  buildPublishedTemplateSnapshot,
  getTemplateBackgroundImageUrl,
  templates
} from "@/lib/templates";
import { normalizeDraft } from "@/lib/invitation-payload";

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

  it("builds a stable template snapshot from the selected background artwork", () => {
    const snapshot = buildPublishedTemplateSnapshot("wedding-classic");

    expect(snapshot).toMatchObject({
      templateAssetId: "wedding-classic",
      templateAssetVersion: 1,
      canvas: {
        width: 1080,
        height: 1920
      }
    });
    expect(snapshot?.backgroundImageUrl).toBe(
      getTemplateBackgroundImageUrl(templates.find((item) => item.id === "wedding-classic")!)
    );
    expect(snapshot?.photoSlots[0]).toMatchObject({
      key: "main",
      required: false
    });
  });

  it("attaches a template snapshot to draft payloads before publishing", () => {
    const payload = attachPublishedTemplateSnapshot(normalizeDraft({ templateId: "wedding-classic" }));

    expect(payload.templateAssetId).toBe("wedding-classic");
    expect(payload.templateAssetVersion).toBe(1);
    expect(payload.templateSnapshot?.backgroundImageUrl).toContain("/images/");
  });
});
