import { useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { resolveTemplateTextLayout } from "@invitehub/shared";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import {
  getTemplateSampleOverlayContent,
  getTemplateSampleOverlayPresentation
} from "@/lib/template-sample-overlay-presentation";

export function TemplateSampleTextOverlay({
  template
}: {
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
      label: content[index] ?? ""
    });
  });
  const showContent = content.length === layout.areas.length
    && presentations.every((presentation) => presentation.showTitle);

  if (content.length === 0) return null;

  return (
    <>
      {layout.areas.map((safeArea, index) => {
        const label = content[index];
        if (!label) return null;
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
              backgroundColor: showContent ? presentation.backgroundColor : "transparent",
              borderRadius: 8,
              paddingHorizontal: presentation.paddingHorizontal,
              paddingVertical: presentation.paddingVertical
            }}
          >
            {showContent ? (
              <Text
                allowFontScaling={presentation.allowFontScaling}
                numberOfLines={1}
                style={{
                  color: presentation.textColor,
                  fontSize: presentation.titleFontSize,
                  fontWeight: "900",
                  lineHeight: presentation.titleLineHeight,
                  textAlign: "center",
                  width: "100%"
                }}
              >
                {label}
              </Text>
            ) : null}
          </View>
        );
      })}
    </>
  );
}
