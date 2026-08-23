/* eslint-disable jsx-a11y/alt-text */

import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { getHomeTemplateSections, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";

type HeroSectionProps = {
  onOpenCategory: (categoryKey: string) => void;
  onUseTemplate: (template: MobileTemplateGalleryItem) => void;
};

function TemplateCard({
  cardWidth,
  onUseTemplate,
  template
}: {
  cardWidth: number;
  onUseTemplate: (template: MobileTemplateGalleryItem) => void;
  template: MobileTemplateGalleryItem;
}) {
  const previewSource = getBundledTemplatePreviewSource(template.id);

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
          height: 244,
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
        {previewSource ? (
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel={`${template.name} 초대장 완성 예시`}
            resizeMode="contain"
            source={previewSource}
            style={{ width: "100%", height: "100%", borderRadius: 6 }}
          />
        ) : (
          <View
            style={{
              width: "72%",
              aspectRatio: 0.58,
              borderRadius: 8,
              backgroundColor: theme.colors.paper,
              borderWidth: 1,
              borderColor: "rgba(172,137,102,0.18)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 18
            }}
          >
            <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800", textAlign: "center" }}>
              INVITATION
            </Text>
            <Text style={{ color: theme.colors.ink, fontSize: 24, fontWeight: "800", lineHeight: 31, marginTop: 12, textAlign: "center" }}>
              {template.name}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: 13, gap: 7 }}>
        <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800" }}>{template.badge}</Text>
        <Text numberOfLines={1} style={{ color: theme.colors.ink, fontSize: 18, fontWeight: "800", lineHeight: 24 }}>
          {template.name}
        </Text>
        <Text numberOfLines={2} style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 21 }}>
          {template.desc}
        </Text>
      </View>
    </Pressable>
  );
}

export function HeroSection({ onOpenCategory, onUseTemplate }: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(224, Math.max(176, width * 0.52));
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
          <View style={{ gap: 6 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12
              }}
            >
              <Pressable
                accessibilityLabel={`${section.title} 전체 보기`}
                accessibilityRole="button"
                onPress={() => onOpenCategory(section.categoryKeys[0])}
                style={{ flex: 1, minHeight: 44, justifyContent: "center" }}
              >
                <Text style={{ color: theme.colors.ink, fontSize: 22, fontWeight: "800", lineHeight: 29 }}>
                  {section.title}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`${section.title} 전체 보기`}
                accessibilityRole="button"
                onPress={() => onOpenCategory(section.categoryKeys[0])}
                style={{
                  minHeight: 44,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(139,115,85,0.22)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 14
                }}
              >
                <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "800" }}>전체 보기</Text>
              </Pressable>
            </View>
            <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              {section.subtitle} · {section.templates.length}개
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 18 }}
            snapToInterval={cardWidth + 12}
          >
            {section.templates.map((template) => (
              <TemplateCard
                cardWidth={cardWidth}
                key={template.id}
                onUseTemplate={onUseTemplate}
                template={template}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}
