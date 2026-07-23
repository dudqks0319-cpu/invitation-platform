/* eslint-disable jsx-a11y/alt-text */

import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { getFinishedHomeHeroSource } from "@/lib/home-hero-finished-source";
import {
  getHomeHeroTemplates,
  getHomeTemplateSections,
  type MobileTemplateGalleryItem
} from "@/lib/template-gallery";
import {
  createTemplateImageRecoveryState,
  resolveRecoverableTemplateImage,
  synchronizeTemplateImageRecoveryState
} from "@/lib/template-image-recovery";
import { getTemplatePreviewSource } from "@/lib/template-image-source";

type HeroSectionProps = {
  onOpenCategory: (categoryKey: string) => void;
  onOpenPreview: (template: MobileTemplateGalleryItem) => void;
};

function useRecoverablePreview(resolvedSource: ImageSourcePropType | null) {
  const [imageState, setImageState] = useState(() => createTemplateImageRecoveryState(resolvedSource));
  const synchronizedImageState = synchronizeTemplateImageRecoveryState(imageState, resolvedSource);
  if (imageState !== synchronizedImageState) {
    setImageState(synchronizedImageState);
  }
  const { sourceIdentity, visibleSource } = resolveRecoverableTemplateImage(
    resolvedSource,
    synchronizedImageState.failed ? synchronizedImageState.sourceIdentity : null
  );

  return {
    imageFailed: synchronizedImageState.failed && synchronizedImageState.sourceIdentity === sourceIdentity,
    onImageError: () => setImageState({ sourceIdentity, failed: true }),
    previewSource: visibleSource,
    sourceIdentity
  };
}

function TemplateCard({
  cardWidth,
  onOpenPreview,
  template
}: {
  cardWidth: number;
  onOpenPreview: (template: MobileTemplateGalleryItem) => void;
  template: MobileTemplateGalleryItem;
}) {
  const { imageFailed, onImageError, previewSource, sourceIdentity } = useRecoverablePreview(
    getTemplatePreviewSource(template)
  );

  return (
    <Pressable
      accessibilityHint="선택하면 예시 미리보기로 이동합니다."
      accessibilityLabel={`${template.name} 디자인 미리보기${imageFailed ? ", 이미지 표시 실패" : ""}`}
      accessibilityRole="button"
      onPress={() => onOpenPreview(template)}
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
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>미리보기</Text>
        </View>
        {previewSource ? (
          <View style={{ height: "100%", aspectRatio: 941 / 1672, borderRadius: 6, overflow: "hidden" }}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={`${template.name} 초대장 완성 예시`}
              key={sourceIdentity}
              onError={onImageError}
              resizeMode="cover"
              source={previewSource}
              style={{ width: "100%", height: "100%" }}
            />
            {template.sampleTextOverlay ? (
              <TemplateSampleTextOverlay template={template} />
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
              {imageFailed ? "이미지를 표시할 수 없어요" : "INVITATION"}
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


function HeroStackCard({
  position,
  stackWidth,
  onOpenPreview,
  template
}: {
  position: "left" | "center" | "right";
  stackWidth: number;
  onOpenPreview: (template: MobileTemplateGalleryItem) => void;
  template: MobileTemplateGalleryItem;
}) {
  const finishedHeroSource = getFinishedHomeHeroSource(template.id);
  const [finishedHeroImageFailed, setFinishedHeroImageFailed] = useState(false);
  const usesFinishedHeroImage = Boolean(finishedHeroSource && !finishedHeroImageFailed);
  const {
    imageFailed,
    onImageError: onFallbackImageError,
    previewSource,
    sourceIdentity
  } = useRecoverablePreview(
    usesFinishedHeroImage ? finishedHeroSource : getTemplatePreviewSource(template)
  );
  const isCenter = position === "center";
  const cardWidth = isCenter ? Math.min(190, stackWidth * 0.54) : Math.min(160, stackWidth * 0.45);
  const cardHeight = cardWidth / (941 / 1672);
  const horizontalOffset = position === "left" ? 0 : position === "right" ? stackWidth - cardWidth : (stackWidth - cardWidth) / 2;
  const rotation = position === "left" ? "-7deg" : position === "right" ? "7deg" : "0deg";

  return (
    <Pressable
      accessibilityHint="선택하면 예시 미리보기로 이동합니다."
      accessibilityLabel={`${template.name} 메인 디자인 미리보기${imageFailed ? ", 이미지 표시 실패" : ""}`}
      accessibilityRole="button"
      onPress={() => onOpenPreview(template)}
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
          key={sourceIdentity}
          onError={() => {
            if (usesFinishedHeroImage) {
              setFinishedHeroImageFailed(true);
              return;
            }
            onFallbackImageError();
          }}
          resizeMode="cover"
          source={previewSource}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <View
          accessible={false}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      )}
      {usesFinishedHeroImage ? null : <TemplateSampleTextOverlay template={template} />}
    </Pressable>
  );
}

export function HeroSection({ onOpenCategory, onOpenPreview }: HeroSectionProps) {
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
              onOpenPreview={onOpenPreview}
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
                accessibilityHint="선택한 종류의 전체 디자인 목록을 엽니다."
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
                accessibilityHint="선택한 종류의 전체 디자인 목록을 엽니다."
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
                onOpenPreview={onOpenPreview}
                template={template}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}
