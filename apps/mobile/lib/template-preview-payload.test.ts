import { describe, expect, it } from "vitest";
import { createTemplatePreviewPayload } from "./template-preview-payload";
import { mobileTemplateGallery } from "./template-gallery";

describe("createTemplatePreviewPayload", () => {
  it("keeps home/template previews aligned with the selected template id and event type", () => {
    const template = mobileTemplateGallery.find((item) => item.id === "wedding-rose-gold");

    expect(template).toBeDefined();
    const payload = createTemplatePreviewPayload(template!);

    expect(payload.templateId).toBe("wedding-rose-gold");
    expect(payload.eventType).toBe("wedding");
    expect(payload.eventData.type).toBe("wedding");
    expect(payload.eventData.groom.name).toBe("이준서");
    expect(payload.eventData.bride.name).toBe("김은재");
    expect(payload.venueName).toBe("라비에벨 가든홀");
  });

  it("uses category-specific sample copy for non-wedding templates", () => {
    const template = mobileTemplateGallery.find((item) => item.id === "dol-nature");

    expect(template).toBeDefined();
    const payload = createTemplatePreviewPayload(template!);

    expect(payload.templateId).toBe("dol-nature");
    expect(payload.eventType).toBe("dol");
    expect(payload.title).toBe("첫돌에 초대합니다");
    expect(payload.eventData.groom.name).toBe("서하");
  });
});
