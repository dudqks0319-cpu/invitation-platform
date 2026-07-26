import type { TextStyle } from "react-native";

export const appFonts = {
  bodyRegular: "Pretendard-Regular",
  bodyMedium: "Pretendard-Medium",
  bodySemiBold: "Pretendard-SemiBold",
  bodyBold: "Pretendard-Bold",
  bodyExtraBold: "Pretendard-ExtraBold",
  bodyBlack: "Pretendard-Black",
  invitationRegular: "GowunBatang-Regular",
  invitationBold: "GowunBatang-Bold"
} as const;

export function resolveBodyFontFamily(fontWeight: TextStyle["fontWeight"]) {
  if (fontWeight === "bold") return appFonts.bodyBold;

  const numericWeight = typeof fontWeight === "number"
    ? fontWeight
    : Number.parseInt(fontWeight ?? "400", 10);

  if (numericWeight >= 900) return appFonts.bodyBlack;
  if (numericWeight >= 800) return appFonts.bodyExtraBold;
  if (numericWeight >= 700) return appFonts.bodyBold;
  if (numericWeight >= 600) return appFonts.bodySemiBold;
  if (numericWeight >= 500) return appFonts.bodyMedium;

  return appFonts.bodyRegular;
}
