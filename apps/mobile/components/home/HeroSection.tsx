import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { TemplateCanvasPreview } from "@/components/invitation/TemplateCanvasPreview";
import { theme } from "@/components/ui/theme";
import { getHomeTemplateCardMetrics } from "@/lib/home-layout";
import { createTemplatePreviewPayload } from "@/lib/template-preview-payload";
import { getHomeTemplateSections, type MobileTemplateGalleryItem } from "@/lib/template-gallery";

type HeroSectionProps = {
  onUseTemplate: (template: MobileTemplateGalleryItem) => void;
};

function TemplateCard({
  cardWidth,
  onUseTemplate,
  previewHeight,
  template
}: {
  cardWidth: number;
  onUseTemplate: (template: MobileTemplateGalleryItem) => void;
  previewHeight: number;
  template: MobileTemplateGalleryItem;
}) {
  const previewPayload = createTemplatePreviewPayload(template);
  const canvasWidth = Math.round(previewHeight * 768 / 1376);

  return (
    <Pressable
      accessibilityHint="선택하면 제작 페이지로 이동합니다."
      accessibilityLabel={`${template.name} 디자인 선택`}
      accessibilityRole="button"
      onPress={() => onUseTemplate(template)}
      style={{
        width: cardWidth,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: "rgba(139,115,85,0.16)",
        overflow: "hidden",
        shadowColor: "rgba(79,55,36,0.12)",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 4
      }}
    >
      <View
        style={{
          height: previewHeight,
          backgroundColor: "#F7EFE6",
          alignItems: "center",
          justifyContent: "center",
          padding: 10
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1,
            minHeight: 32,
            borderRadius: 8,
            backgroundColor: "rgba(41,35,29,0.84)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 12
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>선택</Text>
        </View>
        <TemplateCanvasPreview
          payload={previewPayload}
          scale="thumbnail"
          style={{ height: "100%", width: canvasWidth, borderRadius: 6, overflow: "hidden" }}
        />
      </View>

      <View style={{ padding: 13, gap: 7 }}>
        <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800" }}>{template.badge}</Text>
        <Text numberOfLines={2} style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>
          {template.name}
        </Text>
        <Text numberOfLines={3} style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20 }}>
          {template.desc}
        </Text>
      </View>
    </Pressable>
  );
}

export function HeroSection({ onUseTemplate }: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const { cardGap, cardWidth, previewHeight } = getHomeTemplateCardMetrics(width);
  const sections = getHomeTemplateSections();

  return (
    <View
      style={{
        gap: 24
      }}
    >
      <View style={{ gap: 12 }}>
        <Text style={{ color: theme.colors.gold, fontSize: 13, fontWeight: "800", letterSpacing: 0 }}>
          초대장 플랫폼
        </Text>
        <Text
          style={{
            color: theme.colors.ink,
            fontSize: 33,
            fontWeight: "800",
            lineHeight: 41,
            letterSpacing: 0
          }}
        >
          디자인 고르고
          {"\n"}
          바로 제작하세요
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 26 }}>
          청첩장부터 돌잔치, 브라이덜샤워, 환갑잔치까지.
        </Text>
      </View>

      {sections.map((section) => (
        <View key={section.key} style={{ gap: 12 }}>
          <View style={{ gap: 3 }}>
            <Text style={{ color: theme.colors.ink, fontSize: 22, fontWeight: "800", lineHeight: 29 }}>
              {section.title}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 21 }}>{section.subtitle}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: cardGap }}
            snapToInterval={cardWidth + cardGap}
          >
            {section.templates.map((template) => (
              <TemplateCard
                cardWidth={cardWidth}
                key={template.id}
                onUseTemplate={onUseTemplate}
                previewHeight={previewHeight}
                template={template}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}
