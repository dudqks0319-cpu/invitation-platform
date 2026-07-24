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

const EYEBROW_FONT_SIZE = 5.5;
const EYEBROW_LINE_HEIGHT = 8;
const TITLE_FONT_SIZE = 8;
const TITLE_LINE_HEIGHT = 11;
const DETAIL_FONT_SIZE = 6;
const DETAIL_LINE_HEIGHT = 9;
const LINE_GAP = 1;
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
  const titleNumberOfLines = content && Array.from(content.title).length > 14 ? 2 : 1;
  const textLineHeights = [
    content?.eyebrow ? EYEBROW_LINE_HEIGHT : 0,
    content?.title ? TITLE_LINE_HEIGHT * titleNumberOfLines : 0,
    content?.detail ? DETAIL_LINE_HEIGHT : 0,
    content?.venue ? DETAIL_LINE_HEIGHT : 0
  ].filter((height) => height > 0);
  const requiredHeight = textLineHeights.reduce((total, height) => total + height, 0)
    + Math.max(0, textLineHeights.length - 1) * LINE_GAP;
  const titleRequiredHeight = content?.title ? TITLE_LINE_HEIGHT * titleNumberOfLines : 0;
  const hasMeasuredRoom = Boolean(content)
    && Number.isFinite(safeAreaHeight)
    && safeAreaHeight >= titleRequiredHeight
    && Number.isFinite(safeAreaWidth)
    && safeAreaWidth >= MINIMUM_SAFE_WIDTH;
  const showFullContent = hasMeasuredRoom && safeAreaHeight >= requiredHeight;

  return {
    allowFontScaling: false as const,
    textColor: theme.colors.ink,
    eyebrowFontSize: EYEBROW_FONT_SIZE,
    eyebrowLineHeight: EYEBROW_LINE_HEIGHT,
    titleFontSize: TITLE_FONT_SIZE,
    titleLineHeight: TITLE_LINE_HEIGHT,
    titleNumberOfLines,
    detailFontSize: DETAIL_FONT_SIZE,
    detailLineHeight: DETAIL_LINE_HEIGHT,
    lineGap: LINE_GAP,
    requiredHeight,
    requiredWidth: MINIMUM_SAFE_WIDTH,
    showContent: hasMeasuredRoom,
    showEyebrow: showFullContent && Boolean(content?.eyebrow),
    showDetail: showFullContent && Boolean(content?.detail),
    showVenue: showFullContent && Boolean(content?.venue)
  };
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
  if (
    !example
    || !Object.prototype.hasOwnProperty.call(TEMPLATE_SAMPLE_HEADLINES, category)
  ) {
    return [];
  }

  const eyebrow = TEMPLATE_SAMPLE_HEADLINES[
    category as keyof typeof TEMPLATE_SAMPLE_HEADLINES
  ];
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
