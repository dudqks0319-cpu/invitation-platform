import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createTemplatePreviewDestination,
  isValidTemplatePreviewIntentKey
} from "./template-discovery-navigation";
import { createTemplatePreviewDraftController } from "./template-preview-flow";

const homeSource = readFileSync(join(process.cwd(), "apps/mobile/components/home/HeroSection.tsx"), "utf8");
const templatesSource = readFileSync(join(process.cwd(), "apps/mobile/app/templates.tsx"), "utf8");
const cardSource = readFileSync(join(process.cwd(), "apps/mobile/components/templates/TemplateCard.tsx"), "utf8");
const filtersSource = readFileSync(join(process.cwd(), "apps/mobile/components/templates/TemplateFilters.tsx"), "utf8");
const previewSource = readFileSync(join(process.cwd(), "apps/mobile/app/template-preview.tsx"), "utf8");

describe("applied home to template to preview flow", () => {
  it("maps a bounded template selection to the guarded live-preview route", () => {
    const destination = createTemplatePreviewDestination("dol-cute", "preview-intent-home123");

    expect(destination).toEqual({
      pathname: "/template-preview",
      params: {
        templateId: "dol-cute",
        previewIntentKey: "preview-intent-home123"
      }
    });
    expect(isValidTemplatePreviewIntentKey(destination?.params.previewIntentKey)).toBe(true);
    expect(createTemplatePreviewDestination("../builder")).toBeNull();
  });

  it("keeps the applied screen copy and interaction contracts in the actual routes", () => {
    for (const copy of ["돌잔치", "환갑·칠순", "집들이", "다른 행사로 만들기", "추천 디자인 보기"]) {
      expect(homeSource).toContain(copy);
    }
    for (const copy of ["분위기별 디자인", "전체 보기", "이 디자인으로 시작"]) {
      expect(`${templatesSource}\n${cardSource}\n${filtersSource}`).toContain(copy);
    }
    for (const copy of ["실시간 미리보기", "360", "390", "430", "글자 크게 보기", "저속 모드 미리보기"]) {
      expect(previewSource).toContain(copy);
    }
  });

  it("opens preview without persistence and creates once for repeated explicit start presses", async () => {
    const openPreview = vi.fn();
    const createDraft = vi.fn(async () => ({ localId: "draft-once" }));
    const navigate = vi.fn();
    const controller = createTemplatePreviewDraftController({ createDraft, navigate });
    const template = { id: "dol-cute", category: "dol", badge: "돌잔치" };

    openPreview(createTemplatePreviewDestination(template.id, "preview-intent-preview1"));
    expect(createDraft).not.toHaveBeenCalled();

    await Promise.all([controller.start(template), controller.start(template)]);

    expect(openPreview).toHaveBeenCalledTimes(1);
    expect(createDraft).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("draft-once");
    expect(cardSource).toContain("onPress={() => onOpenPreview(template)}");
    expect(cardSource).toContain("onPress={() => onStart(template)}");
  });
});
