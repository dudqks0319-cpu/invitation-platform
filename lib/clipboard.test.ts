import { afterEach, describe, expect, it, vi } from "vitest";
import { copyTextWithFallback } from "@/lib/clipboard";

describe("copyTextWithFallback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies text with the Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValue(null);

    await expect(copyTextWithFallback("https://invite.test/i/rose")).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledWith("https://invite.test/i/rose");
    expect(promptSpy).not.toHaveBeenCalled();
  });

  it("falls back to a prompt when clipboard writing fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    const promptSpy = vi.spyOn(window, "prompt").mockReturnValue(null);

    await expect(copyTextWithFallback("https://invite.test/i/rose", "링크를 복사해 주세요.")).resolves.toBe(false);

    expect(promptSpy).toHaveBeenCalledWith("링크를 복사해 주세요.", "https://invite.test/i/rose");
  });
});
