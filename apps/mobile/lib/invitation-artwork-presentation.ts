import { theme } from "../components/ui/theme";

export const INVITATION_ARTWORK_LARGE_TEXT_SCALE = 1.6;
export const INVITATION_ARTWORK_COMPRESSED_SPAN_PCT = 22;

const ARTWORK_VERTICAL_PADDING = 6;
const MINIMAL_TITLE_LINE_HEIGHT = 20;
const FULL_LINE_HEIGHTS = [14, 14, 20, 14, 14] as const;
const FULL_GAPS_AND_DIVIDER = 17;
const IDENTITY_LINE_HEIGHTS = [14, 14, 20] as const;
const IDENTITY_GAPS = 4;
const EVENT_LINE_HEIGHTS = [14, 14] as const;
const EVENT_GAPS = 2;

type SafeAreaBounds = {
  topPct: number;
  bottomPct: number;
};

export function getInvitationArtworkPresentation({
  artworkHeight,
  safeAreas,
  safeAreaTopPct,
  safeAreaBottomPct,
  fontScale
}: {
  artworkHeight: number;
  safeAreas?: readonly SafeAreaBounds[];
  safeAreaTopPct?: number;
  safeAreaBottomPct?: number;
  fontScale: number;
}) {
  const normalizedAreas = safeAreas?.length
    ? safeAreas
    : [{ topPct: safeAreaTopPct ?? 0, bottomPct: safeAreaBottomPct ?? 0 }];
  const getSafeHeight = ({ topPct, bottomPct }: SafeAreaBounds) => Number.isFinite(artworkHeight)
    ? Math.max(0, artworkHeight) * Math.max(0, bottomPct - topPct) / 100
    : 0;
  const safeHeight = normalizedAreas.reduce((sum, area) => sum + getSafeHeight(area), 0);
  const minimalRequiredHeight = ARTWORK_VERTICAL_PADDING * 2 + MINIMAL_TITLE_LINE_HEIGHT;
  const fullRequiredHeight = ARTWORK_VERTICAL_PADDING * 2
    + FULL_LINE_HEIGHTS.reduce((sum, height) => sum + height, 0)
    + FULL_GAPS_AND_DIVIDER;
  const identityRequiredHeight = ARTWORK_VERTICAL_PADDING * 2
    + IDENTITY_LINE_HEIGHTS.reduce((sum, height) => sum + height, 0)
    + IDENTITY_GAPS;
  const eventRequiredHeight = ARTWORK_VERTICAL_PADDING * 2
    + EVENT_LINE_HEIGHTS.reduce((sum, height) => sum + height, 0)
    + EVENT_GAPS;
  const largeText = !Number.isFinite(fontScale) || fontScale >= INVITATION_ARTWORK_LARGE_TEXT_SCALE;
  const split = normalizedAreas.length === 2;
  const measuredZones = normalizedAreas.map((area, index) => {
    const zoneSafeHeight = getSafeHeight(area);
    const compressed = area.bottomPct - area.topPct <= INVITATION_ARTWORK_COMPRESSED_SPAN_PCT;
    const content = split ? (index === 0 ? "identity" as const : "event" as const) : "combined" as const;
    const showTitle = content !== "event" && zoneSafeHeight >= minimalRequiredHeight;
    const showCombinedDetails = content === "combined"
      && showTitle
      && !compressed
      && !largeText
      && zoneSafeHeight >= fullRequiredHeight;
    const showIdentityDetails = content === "identity"
      && showTitle
      && !largeText
      && zoneSafeHeight >= identityRequiredHeight;
    const showEventDetails = content === "event"
      && !largeText
      && zoneSafeHeight >= eventRequiredHeight;

    return {
      area,
      content,
      safeHeight: zoneSafeHeight,
      showHeadline: showCombinedDetails || showIdentityDetails,
      showBadge: showCombinedDetails || showIdentityDetails,
      showTitle,
      showDateTime: showCombinedDetails || showEventDetails,
      showVenue: showCombinedDetails || showEventDetails
    };
  });
  const splitIdentityVisible = !split || measuredZones[0]?.showTitle;
  const zones = measuredZones.map((zone) => zone.content === "event" && !splitIdentityVisible
    ? { ...zone, showDateTime: false, showVenue: false }
    : zone);
  const showTitle = zones.some((zone) => zone.showTitle);
  const showDetails = zones.some((zone) => (
    zone.showHeadline || zone.showBadge || zone.showDateTime || zone.showVenue
  ));
  const full = split
    ? zones[0]?.showHeadline && zones[0]?.showBadge && zones[1]?.showDateTime && zones[1]?.showVenue
    : showDetails;

  return {
    mode: !showTitle ? "hidden" as const : full ? "full" as const : "title-only" as const,
    safeHeight,
    minimalRequiredHeight,
    fullRequiredHeight,
    identityRequiredHeight,
    eventRequiredHeight,
    paddingVertical: ARTWORK_VERTICAL_PADDING,
    backgroundColor: theme.colors.paper,
    textColor: theme.colors.ink,
    showTitle,
    showDetails,
    zones
  };
}
