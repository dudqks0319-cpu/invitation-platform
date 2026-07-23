import { describe, expect, it, vi } from "vitest";
import { loadRecentlyViewedTemplates, recordRecentlyViewedTemplate } from "./template-preview-recent";

function createStorage(initialIds: unknown = []) {
  let raw: string | null = JSON.stringify(initialIds);
  return {
    storage: {
      getItem: vi.fn(async () => raw),
      setItem: vi.fn(async (_key: string, value: string) => {
        raw = value;
      })
    },
    readIds: () => JSON.parse(raw ?? "[]") as unknown
  };
}

describe("recent template discovery", () => {
  it("serializes overlapping preview records so neither ID is lost", async () => {
    let releaseFirstRead!: () => void;
    let raw: string | null = "[]";
    const firstReadBlocked = new Promise<void>((resolve) => {
      releaseFirstRead = resolve;
    });
    const storage = {
      getItem: vi.fn(async () => {
        if (storage.getItem.mock.calls.length === 1) await firstReadBlocked;
        return raw;
      }),
      setItem: vi.fn(async (_key: string, value: string) => {
        raw = value;
      })
    };

    const first = recordRecentlyViewedTemplate("wedding-one", storage);
    const second = recordRecentlyViewedTemplate("wedding-two", storage);
    await vi.waitFor(() => expect(storage.getItem).toHaveBeenCalledTimes(1));

    releaseFirstRead();
    await Promise.all([first, second]);

    expect(JSON.parse(raw ?? "[]")).toEqual(["wedding-two", "wedding-one"]);
  });

  it("returns at most six active catalog templates in recent order and removes stale IDs", async () => {
    const { storage, readIds } = createStorage([
      "stale-template",
      "template-7",
      "template-6",
      "template-5",
      "template-4",
      "template-3",
      "template-2",
      { id: "not-an-id", title: "user content must be discarded" }
    ]);
    const catalog = Array.from({ length: 7 }, (_, index) => ({ id: `template-${index + 1}`, name: `디자인 ${index + 1}` }));

    const recent = await loadRecentlyViewedTemplates(catalog, storage);

    expect(recent.map((template) => template.id)).toEqual([
      "template-7",
      "template-6",
      "template-5",
      "template-4",
      "template-3",
      "template-2"
    ]);
    expect(readIds()).toEqual(["template-7", "template-6", "template-5", "template-4", "template-3", "template-2"]);
    expect(JSON.stringify(readIds())).not.toMatch(/name|디자인/);
  });

  it("does not erase stored history when reading storage fails", async () => {
    const storage = {
      getItem: vi.fn(async () => {
        throw new Error("storage unavailable");
      }),
      setItem: vi.fn(async () => undefined)
    };

    await expect(loadRecentlyViewedTemplates([{ id: "wedding-one" }], storage)).resolves.toEqual([]);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
