import { theme } from "../components/ui/theme";

export function getTemplateSampleOverlayPresentation(compressed: boolean) {
  return {
    backgroundColor: theme.colors.paper,
    textColor: theme.colors.ink,
    headlineFontSize: compressed ? 9 : 11,
    badgeFontSize: compressed ? 9 : 11,
    titleFontSize: compressed ? 12 : 16,
    titleLineHeight: compressed ? 14 : 18,
    titleNumberOfLines: compressed ? 1 : 2,
    detailFontSize: compressed ? 9 : 11,
    detailLineHeight: compressed ? 11 : 14,
    detailNumberOfLines: compressed ? 1 : 2,
    showDecoration: !compressed
  };
}
