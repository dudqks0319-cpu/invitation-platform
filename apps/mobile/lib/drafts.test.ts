import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOrReuseTemplatePreviewDraft,
  inspectDraftsForTemplatePreview,
  listDrafts
} from "./drafts";
import { createTemplatePreviewDraftController } from "./template-preview-flow";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn()
  }
}));

const storage = vi.mocked(AsyncStorage);

describe("mobile draft storage recovery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    storage.getItem.mockReset();
    storage.removeItem.mockReset();
    storage.setItem.mockReset();
    storage.removeItem.mockResolvedValue(undefined);
    storage.setItem.mockResolvedValue(undefined);
  });

  it("backs up and clears corrupted local draft storage instead of throwing", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1778244000000);
    storage.getItem.mockResolvedValue("{broken-json");

    await expect(listDrafts()).resolves.toEqual([]);

    expect(storage.setItem).toHaveBeenCalledWith(
      "invitehub:mobile:drafts:corrupt:1778244000000",
      "{broken-json"
    );
    expect(storage.removeItem).toHaveBeenCalledWith("invitehub:mobile:drafts");
  });

  it("inspects corrupt preview storage read-only and fails closed without quarantine or deletion", async () => {
    storage.getItem.mockResolvedValue("{broken-json");

    await expect(inspectDraftsForTemplatePreview("owner-a")).rejects.toThrow("초안 저장소를 확인하지 못했어요");

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("returns only the requested owner's recoverable drafts without migrating legacy local drafts", async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({
      legacy: {
        localId: "legacy",
        localUpdatedAt: "2026-07-20T00:00:00.000Z",
        payload: { ownerId: "local-preview-owner", templateId: "wedding-classic", isPublished: false }
      },
      "account-a": {
        localId: "account-a",
        localUpdatedAt: "2026-07-21T00:00:00.000Z",
        payload: { ownerId: "account-a", templateId: "wedding-classic", isPublished: false }
      },
      "account-b": {
        localId: "account-b",
        localUpdatedAt: "2026-07-22T00:00:00.000Z",
        payload: { ownerId: "account-b", templateId: "wedding-classic", isPublished: false }
      }
    }));

    const drafts = await inspectDraftsForTemplatePreview("account-a");

    expect(drafts.map((draft) => draft.localId)).toEqual(["account-a"]);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("atomically reuses owner-template-intent drafts across concurrent calls and later remounts", async () => {
    let raw: string | null = null;
    storage.getItem.mockImplementation(async () => raw);
    storage.setItem.mockImplementation(async (_key, value) => {
      raw = value;
    });
    const input = {
      eventType: "wedding",
      templateId: "wedding-classic",
      title: "결혼식 초대장",
      previewIntentKey: "preview-intent-restart1"
    };

    const [first, concurrent] = await Promise.all([
      createOrReuseTemplatePreviewDraft("account-a", input),
      createOrReuseTemplatePreviewDraft("account-a", input)
    ]);
    const afterRemount = await createOrReuseTemplatePreviewDraft("account-a", input);

    expect(concurrent.localId).toBe(first.localId);
    expect(afterRemount.localId).toBe(first.localId);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(first.sourcePayload).toEqual({ templatePreviewIntentKey: "preview-intent-restart1" });
    expect(JSON.parse(raw ?? "{}")[first.localId].sourcePayload).toEqual({
      templatePreviewIntentKey: "preview-intent-restart1"
    });
  });

  it("never reuses the same intent across owners", async () => {
    let raw: string | null = null;
    storage.getItem.mockImplementation(async () => raw);
    storage.setItem.mockImplementation(async (_key, value) => {
      raw = value;
    });
    const input = {
      eventType: "wedding",
      templateId: "wedding-classic",
      title: "결혼식 초대장",
      previewIntentKey: "preview-intent-owner12"
    };

    const first = await createOrReuseTemplatePreviewDraft("account-a", input);
    const second = await createOrReuseTemplatePreviewDraft("account-b", input);

    expect(second.localId).not.toBe(first.localId);
    expect(second.payload.ownerId).toBe("account-b");
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  it("survives controller unmount and process-style restart with one draft and eventual navigation", async () => {
    let raw: string | null = null;
    storage.getItem.mockImplementation(async () => raw);
    storage.setItem.mockImplementation(async (_key, value) => {
      raw = value;
    });
    const template = { id: "wedding-classic", category: "wedding", badge: "결혼식" };
    const input = {
      eventType: template.category,
      templateId: template.id,
      title: "결혼식 초대장",
      previewIntentKey: "preview-intent-process1"
    };
    const createDraft = () => createOrReuseTemplatePreviewDraft("account-a", input);
    const firstNavigate = vi.fn(() => {
      throw new Error("app backgrounded before navigation");
    });
    const firstController = createTemplatePreviewDraftController({ createDraft, navigate: firstNavigate });
    await expect(firstController.start(template)).rejects.toThrow("app backgrounded before navigation");

    const remountedNavigate = vi.fn();
    const remountedController = createTemplatePreviewDraftController({ createDraft, navigate: remountedNavigate });
    await remountedController.start(template);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(Object.keys(JSON.parse(raw ?? "{}"))).toHaveLength(1);
    expect(firstNavigate).toHaveBeenCalledTimes(1);
    expect(remountedNavigate).toHaveBeenCalledTimes(1);
  });
});
