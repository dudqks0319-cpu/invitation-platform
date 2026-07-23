import type { MobileTemplateGalleryItem } from "./template-gallery";
import { theme } from "../components/ui/theme";

const TEMPLATE_SAMPLE_LABELS = {
  wedding: "결혼식",
  dol: "돌잔치",
  hwangap: "환갑",
  bridal: "브라이덜",
  birthday: "생일",
  housewarming: "집들이",
  baby: "베이비",
  graduation: "졸업",
  business: "비즈니스"
} as const;

const TITLE_FONT_SIZE = 12;
const TITLE_LINE_HEIGHT = 18;
const VERTICAL_PADDING = 6;
const HORIZONTAL_PADDING = 5;
const GLYPH_WIDTH_SAFETY_FACTOR = 1.1;

type TemplateSampleOverlayPresentationInput = {
  safeAreaHeight: number;
  safeAreaWidth: number;
  fontScale: number;
  label: string;
};

export function getTemplateSampleOverlayPresentation({
  safeAreaHeight,
  safeAreaWidth,
  label
}: TemplateSampleOverlayPresentationInput) {
  const requiredHeight = TITLE_LINE_HEIGHT + VERTICAL_PADDING * 2;
  const requiredWidth = getTemplateSampleLabelWidthBudget(label) + HORIZONTAL_PADDING * 2;

  return {
    allowFontScaling: false as const,
    backgroundColor: theme.colors.paper,
    textColor: theme.colors.ink,
    titleFontSize: TITLE_FONT_SIZE,
    titleLineHeight: TITLE_LINE_HEIGHT,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: VERTICAL_PADDING,
    requiredHeight,
    requiredWidth,
    showTitle: Number.isFinite(safeAreaHeight)
      && safeAreaHeight >= requiredHeight
      && Number.isFinite(safeAreaWidth)
      && safeAreaWidth >= requiredWidth
  };
}

export function getTemplateSampleLabel(category: string) {
  if (!Object.prototype.hasOwnProperty.call(TEMPLATE_SAMPLE_LABELS, category)) return null;
  return TEMPLATE_SAMPLE_LABELS[category as keyof typeof TEMPLATE_SAMPLE_LABELS];
}

export function getTemplateSampleLabelWidthBudget(label: string) {
  return Array.from(label).length * TITLE_FONT_SIZE * GLYPH_WIDTH_SAFETY_FACTOR;
}

export function getTemplateCardExternalMetadata(
  template: Pick<MobileTemplateGalleryItem, "name" | "desc">
) {
  return {
    name: template.name,
    description: template.desc
  };
}
