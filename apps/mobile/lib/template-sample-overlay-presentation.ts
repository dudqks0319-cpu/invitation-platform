import type { MobileTemplateGalleryItem } from "./template-gallery";
import { theme } from "../components/ui/theme";

const TITLE_FONT_SIZE = 13;
const TITLE_LINE_HEIGHT = 18;
const VERTICAL_PADDING = 6;

type TemplateSampleOverlayPresentationInput = {
  safeAreaHeight: number;
  fontScale: number;
};

export function getTemplateSampleOverlayPresentation({
  safeAreaHeight
}: TemplateSampleOverlayPresentationInput) {
  const requiredHeight = TITLE_LINE_HEIGHT + VERTICAL_PADDING * 2;

  return {
    allowFontScaling: false as const,
    backgroundColor: theme.colors.paper,
    textColor: theme.colors.ink,
    titleFontSize: TITLE_FONT_SIZE,
    titleLineHeight: TITLE_LINE_HEIGHT,
    paddingVertical: VERTICAL_PADDING,
    requiredHeight,
    showTitle: Number.isFinite(safeAreaHeight) && safeAreaHeight >= requiredHeight
  };
}

export function getTemplateCardExternalMetadata(
  template: Pick<MobileTemplateGalleryItem, "name" | "desc">
) {
  return {
    name: template.name,
    description: template.desc
  };
}
