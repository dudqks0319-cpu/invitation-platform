import { theme } from "../components/ui/theme";

export const INVITATION_ARTWORK_LARGE_TEXT_SCALE = 1.6;
export const INVITATION_ARTWORK_COMPRESSED_SPAN_PCT = 22;

const ARTWORK_VERTICAL_PADDING = 6;
const MINIMAL_TITLE_LINE_HEIGHT = 20;
const FULL_LINE_HEIGHTS = [14, 14, 20, 14, 14] as const;
const FULL_GAPS_AND_DIVIDER = 17;

export function getInvitationArtworkPresentation({
  artworkHeight,
  safeAreaTopPct,
  safeAreaBottomPct,
  fontScale
}: {
  artworkHeight: number;
  safeAreaTopPct: number;
  safeAreaBottomPct: number;
  fontScale: number;
}) {
  const safeHeight = Number.isFinite(artworkHeight)
    ? Math.max(0, artworkHeight) * Math.max(0, safeAreaBottomPct - safeAreaTopPct) / 100
    : 0;
  const minimalRequiredHeight = ARTWORK_VERTICAL_PADDING * 2 + MINIMAL_TITLE_LINE_HEIGHT;
  const fullRequiredHeight = ARTWORK_VERTICAL_PADDING * 2
    + FULL_LINE_HEIGHTS.reduce((sum, height) => sum + height, 0)
    + FULL_GAPS_AND_DIVIDER;
  const compressed = safeAreaBottomPct - safeAreaTopPct <= INVITATION_ARTWORK_COMPRESSED_SPAN_PCT;
  const largeText = !Number.isFinite(fontScale) || fontScale >= INVITATION_ARTWORK_LARGE_TEXT_SCALE;
  const showTitle = safeHeight >= minimalRequiredHeight;
  const showDetails = showTitle && !compressed && !largeText && safeHeight >= fullRequiredHeight;

  return {
    mode: !showTitle ? "hidden" as const : showDetails ? "full" as const : "title-only" as const,
    safeHeight,
    minimalRequiredHeight,
    fullRequiredHeight,
    paddingVertical: ARTWORK_VERTICAL_PADDING,
    backgroundColor: theme.colors.paper,
    textColor: theme.colors.ink,
    showTitle,
    showDetails
  };
}
