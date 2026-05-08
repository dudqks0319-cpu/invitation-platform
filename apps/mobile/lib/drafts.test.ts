import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listDrafts } from "./drafts";

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
});
