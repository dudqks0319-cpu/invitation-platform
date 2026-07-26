import { describe, expect, it } from "vitest";
import { appFonts, resolveBodyFontFamily } from "./typography";

describe("mobile typography", () => {
  it("maps every used text weight to a bundled Pretendard face", () => {
    expect(resolveBodyFontFamily(undefined)).toBe(appFonts.bodyRegular);
    expect(resolveBodyFontFamily("500")).toBe(appFonts.bodyMedium);
    expect(resolveBodyFontFamily("600")).toBe(appFonts.bodySemiBold);
    expect(resolveBodyFontFamily("700")).toBe(appFonts.bodyBold);
    expect(resolveBodyFontFamily("800")).toBe(appFonts.bodyExtraBold);
    expect(resolveBodyFontFamily("900")).toBe(appFonts.bodyBlack);
    expect(resolveBodyFontFamily("bold")).toBe(appFonts.bodyBold);
  });

  it("keeps the invitation font family separate from app UI copy", () => {
    expect(appFonts.invitationRegular).toBe("GowunBatang-Regular");
    expect(appFonts.invitationBold).toBe("GowunBatang-Bold");
    expect(appFonts.bodyRegular).toBe("Pretendard-Regular");
  });
});
