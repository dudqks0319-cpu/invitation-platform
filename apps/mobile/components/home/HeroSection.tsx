/* eslint-disable jsx-a11y/alt-text */

import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import {
  getHomeHeroTemplates,
  getHomeTemplateSections,
  type MobileTemplateGalleryItem
} from "@/lib/template-gallery";
import { getTemplatePreviewSource } from "@/lib/template-image-source";

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
  const previewSource = getTemplatePreviewSource(template);

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
          <View style={{ height: "100%", aspectRatio: 941 / 1672, borderRadius: 6, overflow: "hidden" }}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={`${template.name} 초대장 완성 예시`}
              resizeMode="cover"
              source={previewSource}
              style={{ width: "100%", height: "100%" }}
            />
            {template.sampleTextOverlay ? (
              <TemplateSampleTextOverlay category={template.category} textPlacement={template.textPlacement} />
            ) : null}
          </View>
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

function WeddingHeroInvitationOverlay() {
  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0 }}>
      <View
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: "6%",
          alignItems: "center"
        }}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          style={{ color: "rgba(116,82,62,0.78)", fontSize: 9, fontStyle: "italic", fontWeight: "700" }}
        >
          WE ARE GETTING MARRIED
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          style={{
            color: "rgba(58,50,44,0.82)",
            fontSize: 10,
            fontWeight: "800",
            marginTop: 3,
            textAlign: "center",
            width: "100%"
          }}
        >
          2026. 09. 20 · SUN 12:30
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: "7%",
          alignItems: "center"
        }}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          style={{ color: "#2B2927", fontSize: 15, fontWeight: "900", textAlign: "center", width: "100%" }}
        >
          이준서 ♥ 김은재
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{ color: "rgba(55,55,55,0.78)", fontSize: 9, fontWeight: "800", marginTop: 4, textAlign: "center", width: "100%" }}
        >
          라비에벨 가든홀
        </Text>
      </View>
    </View>
  );
}

function HeroStackCard({
  position,
  stackWidth,
  onUseTemplate,
  template
}: {
  position: "left" | "center" | "right";
  stackWidth: number;
  onUseTemplate: (template: MobileTemplateGalleryItem) => void;
  template: MobileTemplateGalleryItem;
}) {
  const previewSource = getTemplatePreviewSource(template);
  const isCenter = position === "center";
  const cardWidth = isCenter ? Math.min(190, stackWidth * 0.54) : Math.min(160, stackWidth * 0.45);
  const cardHeight = cardWidth / (941 / 1672);
  const horizontalOffset = position === "left" ? 0 : position === "right" ? stackWidth - cardWidth : (stackWidth - cardWidth) / 2;
  const rotation = position === "left" ? "-7deg" : position === "right" ? "7deg" : "0deg";

  return (
    <Pressable
      accessibilityHint="선택하면 이 디자인으로 제작을 시작합니다."
      accessibilityLabel={`${template.name} 메인 디자인 선택`}
      accessibilityRole="button"
      onPress={() => onUseTemplate(template)}
      style={{
        position: "absolute",
        left: horizontalOffset,
        top: isCenter ? 0 : 28,
        width: cardWidth,
        height: cardHeight,
        borderRadius: isCenter ? 20 : 17,
        borderWidth: 5,
        borderColor: "rgba(255,255,255,0.98)",
        backgroundColor: "#FFF9F3",
        overflow: "hidden",
        shadowColor: "#6E5548",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: isCenter ? 0.2 : 0.13,
        shadowRadius: 20,
        elevation: isCenter ? 8 : 4,
        zIndex: isCenter ? 3 : 1,
        transform: [{ rotate: rotation }]
      }}
    >
      {previewSource ? (
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`${template.name} 웨딩 이미지`}
          resizeMode="cover"
          source={previewSource}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
      <WeddingHeroInvitationOverlay />
    </Pressable>
  );
}

export function HeroSection({ onOpenCategory, onUseTemplate }: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const { templates } = useTemplateCatalog();
  const cardWidth = Math.min(224, Math.max(176, width * 0.52));
  const heroStackWidth = Math.min(360, Math.max(284, width - 36));
  const heroCenterCardWidth = Math.min(190, heroStackWidth * 0.54);
  const heroStackHeight = heroCenterCardWidth / (941 / 1672) + 24;
  const heroTemplates = getHomeHeroTemplates(templates);
  const sections = getHomeTemplateSections(templates);

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

      <View
        accessibilityLabel="오삼오삼 웨딩 디자인 셀렉션"
        style={{
          alignItems: "center",
          gap: 14,
          paddingTop: 2
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(184,107,122,0.24)",
            backgroundColor: "rgba(255,255,255,0.82)",
            paddingHorizontal: 13,
            paddingVertical: 8
          }}
        >
          <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "800" }}>✦ 오삼오삼 셀렉션</Text>
        </View>

        <View style={{ width: heroStackWidth, height: heroStackHeight }}>
          {heroTemplates.map((template, index) => (
            <HeroStackCard
              key={template.id}
              onUseTemplate={onUseTemplate}
              position={index === 0 ? "left" : index === 1 ? "center" : "right"}
              stackWidth={heroStackWidth}
              template={template}
            />
          ))}
        </View>
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
