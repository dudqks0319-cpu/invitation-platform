import { useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { resolveTemplateTextSafeArea } from "@invitehub/shared";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { getTemplateSampleOverlayPresentation } from "@/lib/template-sample-overlay-presentation";

const templateSampleTitle = {
  wedding: "우리 결혼합니다",
  dol: "도윤이의 첫돌",
  hwangap: "아버지의 환갑",
  bridal: "브라이덜샤워",
  birthday: "생일을 축하해요",
  housewarming: "새집에 초대합니다",
  baby: "아기를 기다려요",
  graduation: "졸업을 축하해요",
  business: "OPENING DAY"
} as const;

export function TemplateSampleTextOverlay({
  template
}: {
  template: MobileTemplateGalleryItem;
}) {
  const [safeAreaHeight, setSafeAreaHeight] = useState(0);
  const { fontScale } = useWindowDimensions();
  const title = templateSampleTitle[template.category as keyof typeof templateSampleTitle] ?? templateSampleTitle.wedding;
  const safeArea = template.textSafeArea ?? resolveTemplateTextSafeArea({
    templateId: template.id,
    category: template.category,
    textPlacement: template.textPlacement
  });
  const presentation = getTemplateSampleOverlayPresentation({ safeAreaHeight, fontScale });

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      onLayout={({ nativeEvent }) => {
        const nextHeight = nativeEvent.layout.height;
        setSafeAreaHeight((currentHeight) => Math.abs(currentHeight - nextHeight) < 0.5 ? currentHeight : nextHeight);
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
        paddingHorizontal: 5,
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
          {title}
        </Text>
      ) : null}
    </View>
  );
}
