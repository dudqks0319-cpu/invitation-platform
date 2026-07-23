import { describe, expect, it } from "vitest";
import { getInvitationArtworkPresentation } from "./invitation-artwork-presentation";

function channel(value: string, offset: number) {
  const component = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
  return component <= 0.04045 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
}

function luminance(value: string) {
  return channel(value, 1) * 0.2126 + channel(value, 3) * 0.7152 + channel(value, 5) * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe("invitation artwork fixed typography presentation", () => {
  it("shows fixed decorative details only when the measured safe area fits them", () => {
    const normal = getInvitationArtworkPresentation({
      artworkHeight: 560,
      safeAreaTopPct: 35,
      safeAreaBottomPct: 70,
      fontScale: 1
    });

    expect(normal.safeHeight).toBe(196);
    expect(normal.safeHeight).toBeGreaterThanOrEqual(normal.fullRequiredHeight);
    expect(normal).toMatchObject({ mode: "full", showTitle: true, showDetails: true });
    expect(contrastRatio(normal.textColor, normal.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });

  it("reduces a compressed measured safe area to the title only", () => {
    const compressed = getInvitationArtworkPresentation({
      artworkHeight: 560,
      safeAreaTopPct: 70,
      safeAreaBottomPct: 88,
      fontScale: 1
    });

    expect(compressed.safeHeight).toBeCloseTo(100.8);
    expect(compressed).toMatchObject({ mode: "title-only", showTitle: true, showDetails: false });
  });

  it("uses title-only fixed artwork at fontScale 2 while external details remain scalable", () => {
    const largeText = getInvitationArtworkPresentation({
      artworkHeight: 560,
      safeAreaTopPct: 35,
      safeAreaBottomPct: 70,
      fontScale: 2
    });

    expect(largeText.safeHeight).toBeGreaterThanOrEqual(largeText.fullRequiredHeight);
    expect(largeText).toMatchObject({ mode: "title-only", showTitle: true, showDetails: false });
  });

  it("hides artwork copy when measured padding and title cannot fit", () => {
    const tiny = getInvitationArtworkPresentation({
      artworkHeight: 120,
      safeAreaTopPct: 80,
      safeAreaBottomPct: 90,
      fontScale: 1
    });

    expect(tiny.safeHeight).toBeLessThan(tiny.minimalRequiredHeight);
    expect(tiny).toMatchObject({ mode: "hidden", showTitle: false, showDetails: false });
  });

  it("splits identity copy above and event copy below a centered subject", () => {
    const split = getInvitationArtworkPresentation({
      artworkHeight: 560,
      safeAreas: [
        { topPct: 8, bottomPct: 25 },
        { topPct: 76, bottomPct: 94 }
      ],
      fontScale: 1
    });

    expect(split.mode).toBe("full");
    expect(split.zones).toEqual([
      expect.objectContaining({
        content: "identity",
        showHeadline: true,
        showBadge: true,
        showTitle: true,
        showDateTime: false,
        showVenue: false
      }),
      expect.objectContaining({
        content: "event",
        showHeadline: false,
        showBadge: false,
        showTitle: false,
        showDateTime: true,
        showVenue: true
      })
    ]);
  });

  it("fails closed to one title above the subject at large Dynamic Type scales", () => {
    const split = getInvitationArtworkPresentation({
      artworkHeight: 560,
      safeAreas: [
        { topPct: 8, bottomPct: 25 },
        { topPct: 76, bottomPct: 94 }
      ],
      fontScale: 2
    });

    expect(split).toMatchObject({ mode: "title-only", showTitle: true, showDetails: false });
    expect(split.zones[0]).toMatchObject({ content: "identity", showTitle: true });
    expect(split.zones[1]).toMatchObject({
      content: "event",
      showDateTime: false,
      showVenue: false
    });
  });

  it("does not show orphan event details when the identity zone cannot fit a title", () => {
    const split = getInvitationArtworkPresentation({
      artworkHeight: 120,
      safeAreas: [
        { topPct: 8, bottomPct: 25 },
        { topPct: 50, bottomPct: 94 }
      ],
      fontScale: 1
    });

    expect(split).toMatchObject({ mode: "hidden", showTitle: false, showDetails: false });
    expect(split.zones[1]).toMatchObject({ showDateTime: false, showVenue: false });
  });
});
