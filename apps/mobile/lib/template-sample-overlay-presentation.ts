import type { MobileTemplateGalleryItem } from "./template-gallery";
import { getTemplatePreviewExample } from "./template-preview-flow";
import { theme } from "../components/ui/theme";

const TEMPLATE_SAMPLE_HEADLINES = {
  wedding: "WE ARE GETTING MARRIED",
  dol: "FIRST BIRTHDAY",
  hwangap: "WITH GRATITUDE",
  bridal: "BRIDAL SHOWER",
  birthday: "HAPPY BIRTHDAY",
  housewarming: "WELCOME HOME",
  baby: "BABY SHOWER",
  graduation: "GRADUATION",
  business: "YOU ARE INVITED"
} as const;

export const templateOverlayTypography = {
  eyebrowFontSize: 11,
  eyebrowLineHeight: 15,
  titleFontSize: 16,
  titleLineHeight: 21,
  detailFontSize: 12,
  detailLineHeight: 16,
  lineGap: 3,
  compactTitleFontSize: 12,
  compactTitleLineHeight: 15
} as const;
const MINIMUM_SAFE_WIDTH = 64;

export type TemplateSampleOverlayContent = {
  eyebrow?: string;
  title: string;
  detail?: string;
  venue?: string;
};

type TemplateSampleOverlayPresentationInput = {
  safeAreaHeight: number;
  safeAreaWidth: number;
  fontScale: number;
  content?: TemplateSampleOverlayContent;
};

export function getTemplateSampleOverlayPresentation({
  safeAreaHeight,
  safeAreaWidth,
  content
}: TemplateSampleOverlayPresentationInput) {
  const {
    eyebrowLineHeight,
    titleLineHeight,
    detailLineHeight,
    lineGap
  } = templateOverlayTypography;
  const titleNumberOfLines = content && Array.from(content.title).length > 14 ? 2 : 1;
  const textLineHeights = [
    content?.eyebrow ? eyebrowLineHeight : 0,
    content?.title ? titleLineHeight * titleNumberOfLines : 0,
    content?.detail ? detailLineHeight : 0,
    content?.venue ? detailLineHeight : 0
  ].filter((height) => height > 0);
  const requiredHeight = textLineHeights.reduce((total, height) => total + height, 0)
    + Math.max(0, textLineHeights.length - 1) * lineGap;
  const titleRequiredHeight = content?.title ? titleLineHeight * titleNumberOfLines : 0;
  const hasMeasuredRoom = Boolean(content)
    && Number.isFinite(safeAreaHeight)
    && safeAreaHeight >= titleRequiredHeight
    && Number.isFinite(safeAreaWidth)
    && safeAreaWidth >= MINIMUM_SAFE_WIDTH;
  const showFullContent = hasMeasuredRoom && safeAreaHeight >= requiredHeight;

  return {
    allowFontScaling: false as const,
    textColor: theme.colors.ink,
    eyebrowFontSize: templateOverlayTypography.eyebrowFontSize,
    eyebrowLineHeight,
    titleFontSize: templateOverlayTypography.titleFontSize,
    titleLineHeight,
    titleNumberOfLines,
    detailFontSize: templateOverlayTypography.detailFontSize,
    detailLineHeight,
    lineGap,
    requiredHeight,
    requiredWidth: MINIMUM_SAFE_WIDTH,
    showContent: hasMeasuredRoom,
    showEyebrow: showFullContent && Boolean(content?.eyebrow),
    showDetail: showFullContent && Boolean(content?.detail),
    showVenue: showFullContent && Boolean(content?.venue)
  };
}

export function getTemplateSampleHeadline(category: string) {
  return Object.prototype.hasOwnProperty.call(TEMPLATE_SAMPLE_HEADLINES, category)
    ? TEMPLATE_SAMPLE_HEADLINES[category as keyof typeof TEMPLATE_SAMPLE_HEADLINES]
    : null;
}

function formatTemplateSampleDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[1]}. ${match[2]}. ${match[3]}. ${match[4]}:${match[5]}`;
}

function removeExamplePrefix(value: string) {
  return value.replace(/^예시\s+/, "");
}

export function getTemplateSampleOverlayContent({
  arrangement,
  category
}: {
  arrangement: "single" | "top-and-bottom";
  category: string;
}): TemplateSampleOverlayContent[] {
  const example = getTemplatePreviewExample(category);
  const eyebrow = getTemplateSampleHeadline(category);
  if (!example || !eyebrow) {
    return [];
  }
  const date = formatTemplateSampleDate(example.dateTime);
  const venue = removeExamplePrefix(example.venueName);
  const title = category === "wedding"
    ? `${example.primaryName} ♡ ${example.secondaryName}`
    : example.title;

  if (arrangement === "top-and-bottom") {
    return [
      { eyebrow, title },
      { title: date, detail: venue }
    ];
  }

  return [{ eyebrow, title, detail: date, venue }];
}

export function getTemplateCardExternalMetadata(
  template: Pick<MobileTemplateGalleryItem, "name" | "desc">
) {
  return {
    name: template.name,
    description: template.desc
  };
}
