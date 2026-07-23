import { describe, expect, it } from "vitest";
import {
  createTemplateImageRecoveryState,
  getTemplateImageSourceIdentity,
  resolveRecoverableTemplateImage,
  synchronizeTemplateImageRecoveryState
} from "./template-image-recovery";

describe("template image recovery", () => {
  it("hides only the failed source and reloads when URL or version changes", () => {
    const failed = { uri: "https://example.invalid/preview.png?v=1" };
    const corrected = { uri: "https://example.invalid/preview.png?v=2" };
    const failedIdentity = getTemplateImageSourceIdentity(failed);
    const failedState = { sourceIdentity: failedIdentity, failed: true };

    expect(resolveRecoverableTemplateImage(failed, failedIdentity).visibleSource).toBeNull();
    expect(synchronizeTemplateImageRecoveryState(failedState, failed)).toBe(failedState);
    expect(synchronizeTemplateImageRecoveryState(failedState, corrected)).toEqual({
      sourceIdentity: getTemplateImageSourceIdentity(corrected),
      failed: false
    });
    expect(resolveRecoverableTemplateImage(corrected, failedIdentity)).toEqual({
      sourceIdentity: getTemplateImageSourceIdentity(corrected),
      visibleSource: corrected
    });
  });

  it("uses stable identities for bundled assets and missing sources", () => {
    expect(createTemplateImageRecoveryState(42)).toEqual({ sourceIdentity: "asset:42", failed: false });
    expect(getTemplateImageSourceIdentity(42)).toBe("asset:42");
    expect(getTemplateImageSourceIdentity(null)).toBe("missing");
  });
});
