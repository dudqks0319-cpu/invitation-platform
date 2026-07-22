import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTemplatePreviewDraftController,
  findRecoverableTemplateDraft,
  getTemplatePreviewExample,
  templatePreviewExamples
} from "./template-preview-flow";
import { recordRecentlyViewedTemplate } from "./template-preview-recent";

describe("template preview fixtures", () => {
  it("provides one clearly fictional, contact-free example for every supported event", () => {
    expect(Object.keys(templatePreviewExamples)).toHaveLength(9);
    for (const example of Object.values(templatePreviewExamples)) {
      expect(example.isExample).toBe(true);
      expect(example.title.length).toBeGreaterThan(0);
      expect(JSON.stringify(example)).not.toMatch(/phone|contact|010-|@/i);
    }
    expect(getTemplatePreviewExample("unknown")).toBeNull();
  });
});

describe("recently viewed templates", () => {
  it("can open and close five previews without creating a draft and stores IDs only", async () => {
    let raw: string | null = null;
    const storage = {
      getItem: vi.fn(async () => raw),
      setItem: vi.fn(async (_key: string, value: string) => {
        raw = value;
      })
    };
    const createDraft = vi.fn();

    for (const id of ["one", "two", "three", "four", "five"]) {
      await recordRecentlyViewedTemplate(id, storage);
    }

    expect(createDraft).not.toHaveBeenCalled();
    expect(JSON.parse(raw ?? "[]")).toEqual(["five", "four", "three", "two", "one"]);
    expect(raw).not.toMatch(/payload|ownerId|title/);
  });

  it("deduplicates and bounds recent IDs to six", async () => {
    let raw: string | null = JSON.stringify(["six", "five", "four", "three", "two", "one"]);
    const storage = {
      getItem: vi.fn(async () => raw),
      setItem: vi.fn(async (_key: string, value: string) => {
        raw = value;
      })
    };

    await recordRecentlyViewedTemplate("three", storage);
    await recordRecentlyViewedTemplate("seven", storage);

    expect(JSON.parse(raw ?? "[]")).toEqual(["seven", "three", "six", "five", "four", "two"]);
  });
});

describe("intentional draft creation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("coalesces rapid CTA taps into one draft and one navigation", async () => {
    let resolveDraft!: (draft: { localId: string }) => void;
    const createDraft = vi.fn(() => new Promise<{ localId: string }>((resolve) => {
      resolveDraft = resolve;
    }));
    const navigate = vi.fn();
    const controller = createTemplatePreviewDraftController({ createDraft, navigate });
    const template = { id: "wedding-classic", category: "wedding", badge: "결혼식" };

    const first = controller.start(template);
    const second = controller.start(template);
    expect(first).toBe(second);
    expect(createDraft).toHaveBeenCalledTimes(1);
    resolveDraft({ localId: "draft-1" });
    await Promise.all([first, second]);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("draft-1");
    expect(controller.getState()).toEqual({ status: "success", error: null });
  });

  it("preserves the selection after failure and permits one clean retry without bad navigation", async () => {
    const createDraft = vi.fn()
      .mockRejectedValueOnce(new Error("storage unavailable"))
      .mockResolvedValueOnce({ localId: "draft-retry" });
    const navigate = vi.fn();
    const controller = createTemplatePreviewDraftController({ createDraft, navigate });
    const template = { id: "dol-cute", category: "dol", badge: "돌잔치" };

    await expect(controller.start(template)).rejects.toThrow("storage unavailable");
    expect(controller.getSelection()).toEqual(template);
    expect(controller.getState().status).toBe("failed");
    expect(navigate).not.toHaveBeenCalled();

    await controller.retry();
    expect(createDraft).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("draft-retry");
  });

  it("retries navigation without creating a second draft when routing fails after persistence", async () => {
    const createDraft = vi.fn(async () => ({ localId: "draft-persisted" }));
    const navigate = vi.fn()
      .mockImplementationOnce(() => {
        throw new Error("router temporarily unavailable");
      })
      .mockImplementationOnce(() => undefined);
    const controller = createTemplatePreviewDraftController({ createDraft, navigate });
    const template = { id: "birthday-fun", category: "birthday", badge: "생일파티" };

    await expect(controller.start(template)).rejects.toThrow("router temporarily unavailable");
    await controller.retry();

    expect(createDraft).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenLastCalledWith("draft-persisted");
  });

  it("requires explicit resume or new selection for a recoverable draft and never overwrites it", async () => {
    const existing = {
      localId: "existing-1",
      localUpdatedAt: "2026-07-23T10:00:00.000Z",
      payload: { ownerId: "local-preview-owner", templateId: "wedding-classic", isPublished: false }
    };
    expect(findRecoverableTemplateDraft([existing], "local-preview-owner")).toEqual(existing);

    const createDraft = vi.fn(async () => ({ localId: "new-1" }));
    const navigate = vi.fn();
    const controller = createTemplatePreviewDraftController({ createDraft, navigate });

    controller.resume(existing.localId);
    expect(createDraft).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("existing-1");

    const freshController = createTemplatePreviewDraftController({ createDraft, navigate });
    await freshController.start({ id: "wedding-classic", category: "wedding", badge: "결혼식" });
    expect(createDraft).toHaveBeenCalledTimes(1);
    expect(createDraft).not.toHaveBeenCalledWith(expect.objectContaining({ localId: "existing-1" }));
  });
});
