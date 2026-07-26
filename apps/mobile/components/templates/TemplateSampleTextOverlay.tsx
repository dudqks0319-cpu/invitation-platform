import { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { resolveTemplateTextLayout } from "@invitehub/shared";
import { appFonts } from "@/components/ui/typography";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import {
  getTemplateSampleOverlayContent,
  getTemplateSampleOverlayPresentation,
  templateOverlayTypography
} from "@/lib/template-sample-overlay-presentation";

export function TemplateSampleTextOverlay({
  compact = false,
  template
}: {
  compact?: boolean;
  template: MobileTemplateGalleryItem;
}) {
  const [safeAreaSizes, setSafeAreaSizes] = useState<Record<number, { width: number; height: number }>>({});
  const { fontScale } = useWindowDimensions();
  const layout = resolveTemplateTextLayout({
    templateId: template.id,
    category: template.category,
    textPlacement: template.textPlacement,
    fallbackSafeArea: template.textSafeArea
  });
  const content = getTemplateSampleOverlayContent({
    arrangement: layout.arrangement,
    category: template.category
  });
  const presentations = layout.areas.map((_, index) => {
    const safeAreaSize = safeAreaSizes[index] ?? { width: 0, height: 0 };
    return getTemplateSampleOverlayPresentation({
      safeAreaHeight: safeAreaSize.height,
      safeAreaWidth: safeAreaSize.width,
      fontScale,
      content: content[index]
    });
  });
  const showContent = content.length === layout.areas.length
    && presentations.every((presentation) => presentation.showContent);

  if (content.length === 0) return null;

  return (
    <>
      {layout.areas.map((safeArea, index) => {
        const zoneContent = content[index];
        if (!zoneContent) return null;
        const presentation = presentations[index];
        if (!presentation) return null;

        return (
          <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            key={`${index}-${safeArea.topPct}-${safeArea.bottomPct}`}
            onLayout={({ nativeEvent }) => {
              const { width, height } = nativeEvent.layout;
              setSafeAreaSizes((currentSizes) => {
                const currentSize = currentSizes[index];
                return currentSize
                  && Math.abs(currentSize.width - width) < 0.5
                  && Math.abs(currentSize.height - height) < 0.5
                  ? currentSizes
                  : { ...currentSizes, [index]: { width, height } };
              });
            }}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: `${safeArea.leftPct}%`,
              right: `${100 - safeArea.rightPct}%`,
              top: `${safeArea.topPct}%`,
              bottom: `${100 - safeArea.bottomPct}%`,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent"
            }}
          >
            {showContent ? (
              <View
                style={{
                  maxWidth: "100%",
                  alignItems: "center",
                  gap: presentation.lineGap
                }}
              >
                {presentation.showEyebrow && !compact ? (
                  <Text
                    allowFontScaling={presentation.allowFontScaling}
                    numberOfLines={1}
                    style={{
                      color: presentation.textColor,
                      fontSize: presentation.eyebrowFontSize,
                      fontWeight: "600",
                      letterSpacing: 1.1,
                      lineHeight: presentation.eyebrowLineHeight,
                      textAlign: "center"
                    }}
                  >
                    {zoneContent.eyebrow}
                  </Text>
                ) : null}
                <Text
                  allowFontScaling={presentation.allowFontScaling}
                  numberOfLines={compact ? 3 : presentation.titleNumberOfLines}
                  style={{
                    color: presentation.textColor,
                    fontSize: compact
                      ? templateOverlayTypography.compactTitleFontSize
                      : presentation.titleFontSize,
                    fontFamily: appFonts.invitationBold,
                    fontWeight: "800",
                    lineHeight: compact
                      ? templateOverlayTypography.compactTitleLineHeight
                      : presentation.titleLineHeight,
                    textAlign: "center"
                  }}
                >
                  {zoneContent.title}
                </Text>
                {presentation.showDetail ? (
                  <Text
                    allowFontScaling={presentation.allowFontScaling}
                    numberOfLines={1}
                    style={{
                      color: presentation.textColor,
                      fontSize: presentation.detailFontSize,
                      fontWeight: "700",
                      lineHeight: presentation.detailLineHeight,
                      textAlign: "center"
                    }}
                  >
                    {zoneContent.detail}
                  </Text>
                ) : null}
                {presentation.showVenue ? (
                  <Text
                    allowFontScaling={presentation.allowFontScaling}
                    numberOfLines={1}
                    style={{
                      color: presentation.textColor,
                      fontSize: presentation.detailFontSize,
                      lineHeight: presentation.detailLineHeight,
                      textAlign: "center"
                    }}
                  >
                    {zoneContent.venue}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
}
