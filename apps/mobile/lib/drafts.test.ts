import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyInvitationDraft, getDefaultInvitationSample } from "./invitation-shared";
import { createAndPersistDraft, loadDraft } from "./drafts";

const asyncStorageMock = vi.hoisted(() => {
  const store = new Map<string, string>();

  return {
    clear: () => store.clear(),
    getStoredValue: (key: string) => store.get(key),
    seed: (key: string, value: string) => store.set(key, value),
    getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    })
  };
});

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: asyncStorageMock.getItem,
    setItem: asyncStorageMock.setItem
  }
}));

const DRAFT_STORAGE_KEY = "invitehub:mobile:drafts";

describe("mobile drafts", () => {
  beforeEach(() => {
    asyncStorageMock.clear();
    asyncStorageMock.getItem.mockClear();
    asyncStorageMock.setItem.mockClear();
  });

  it("starts template drafts empty instead of seeding demo invitation values", async () => {
    const draft = await createAndPersistDraft("owner-1", {
      eventType: "wedding",
      templateId: "wedding-rose-gold"
    });

    expect(draft.payload.templateId).toBe("wedding-rose-gold");
    expect(draft.payload.eventType).toBe("wedding");
    expect(draft.payload.title).toBe("");
    expect(draft.payload.eventDateTime).toBe("");
    expect(draft.payload.venueName).toBe("");
    expect(draft.payload.eventData.groom.name).toBe("");
    expect(draft.payload.eventData.bride.name).toBe("");
  });

  it("clears old unedited seeded samples when loading existing drafts", async () => {
    const staleDraft = createEmptyInvitationDraft("owner-1");
    const sample = getDefaultInvitationSample("wedding");

    staleDraft.localId = "draft-old";
    staleDraft.payload = {
      ...staleDraft.payload,
      templateId: "wedding-rose-gold",
      title: sample.title,
      eventDateTime: sample.eventDateTime,
      venueName: sample.venueName,
      venueAddress: sample.venueAddress,
      message: sample.message,
      eventData: {
        ...staleDraft.payload.eventData,
        groom: {
          ...staleDraft.payload.eventData.groom,
          name: sample.groomName
        },
        bride: {
          ...staleDraft.payload.eventData.bride,
          name: sample.brideName
        }
      }
    };

    asyncStorageMock.seed(DRAFT_STORAGE_KEY, JSON.stringify({ [staleDraft.localId]: staleDraft }));

    const loaded = await loadDraft("draft-old");

    expect(loaded?.payload.title).toBe("");
    expect(loaded?.payload.eventDateTime).toBe("");
    expect(loaded?.payload.venueName).toBe("");
    expect(loaded?.payload.venueAddress).toBe("");
    expect(loaded?.payload.message).toBe("");
    expect(loaded?.payload.eventData.groom.name).toBe("");
    expect(loaded?.payload.eventData.bride.name).toBe("");

    const storedDrafts = JSON.parse(asyncStorageMock.getStoredValue(DRAFT_STORAGE_KEY) ?? "{}") as Record<
      string,
      typeof staleDraft
    >;
    expect(storedDrafts["draft-old"].payload.title).toBe("");
  });
});
