import { useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { resolveTemplateTextSafeArea } from "@invitehub/shared";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import {
  getTemplateSampleLabel,
  getTemplateSampleOverlayPresentation
} from "@/lib/template-sample-overlay-presentation";

export function TemplateSampleTextOverlay({
  template
}: {
  template: MobileTemplateGalleryItem;
}) {
  const [safeAreaSize, setSafeAreaSize] = useState({ width: 0, height: 0 });
  const { fontScale } = useWindowDimensions();
  const label = getTemplateSampleLabel(template.category);
  const safeArea = template.textSafeArea ?? resolveTemplateTextSafeArea({
    templateId: template.id,
    category: template.category,
    textPlacement: template.textPlacement
  });
  const presentation = getTemplateSampleOverlayPresentation({
    safeAreaHeight: safeAreaSize.height,
    safeAreaWidth: safeAreaSize.width,
    fontScale,
    label: label ?? ""
  });

  if (!label) return null;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      onLayout={({ nativeEvent }) => {
        const { width, height } = nativeEvent.layout;
        setSafeAreaSize((currentSize) => (
          Math.abs(currentSize.width - width) < 0.5 && Math.abs(currentSize.height - height) < 0.5
            ? currentSize
            : { width, height }
        ));
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
        backgroundColor: presentation.backgroundColor,
        borderRadius: 8,
        paddingHorizontal: presentation.paddingHorizontal,
        paddingVertical: presentation.paddingVertical
      }}
    >
      {presentation.showTitle ? (
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
}
