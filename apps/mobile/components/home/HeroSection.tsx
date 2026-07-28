/* eslint-disable jsx-a11y/alt-text */

import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View
} from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import {
  getFinishedHomeHeroCompositeSource,
  getFinishedHomeHeroSource
} from "@/lib/home-hero-finished-source";
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
  const previewHeight = Math.min(240, Math.max(196, Math.round(cardWidth * 1.35)));

  return (
    <Pressable
      accessibilityHint="선택하면 예시 미리보기로 이동합니다."
      accessibilityLabel={`${template.name} 디자인 미리보기${imageFailed ? ", 이미지 표시 실패" : ""}`}
      accessibilityRole="button"
      onPress={() => onOpenPreview(template)}
      style={{
        width: cardWidth,
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: "rgba(139,115,85,0.16)",
        overflow: "hidden",
        shadowColor: "#6E5548",
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.11,
        shadowRadius: 12,
        elevation: 2
      }}
    >
      <View
        style={{
          height: previewHeight,
          backgroundColor: "#F7EFE6",
          alignItems: "center",
          justifyContent: "center",
          padding: 8
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            minHeight: 28,
            borderRadius: 999,
            backgroundColor: "rgba(41,35,29,0.76)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 9
          }}
        >
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>보기</Text>
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
              <TemplateSampleTextOverlay compact template={template} />
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

      <View style={{ padding: 11, gap: 5 }}>
        <Text style={{ color: theme.colors.gold, fontSize: 11, fontWeight: "800" }}>{template.badge}</Text>
        <Text numberOfLines={1} style={{ color: theme.colors.ink, fontSize: 15, fontWeight: "800", lineHeight: 20 }}>
          {template.name}
        </Text>
        <Text numberOfLines={2} style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }}>
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
  const [selectedEventKey, setSelectedEventKey] = useState<
    "wedding" | "dol" | "hwangap" | "housewarming"
  >("wedding");
  const [finishedHeroCompositeFailed, setFinishedHeroCompositeFailed] = useState(false);
  const carouselViewportWidth = Math.max(280, width - 36);
  const cardWidth = Math.min(188, Math.max(134, (carouselViewportWidth - 12) / 2));
  const heroStackWidth = Math.min(360, Math.max(284, width - 36));
  const heroStackHeight = heroStackWidth * 1.02;
  const heroTemplates = getHomeHeroTemplates(templates);
  const heroFeaturedTemplate = heroTemplates[1] ?? heroTemplates[0];
  const finishedHeroCompositeSource = getFinishedHomeHeroCompositeSource();
  const sections = getHomeTemplateSections(templates);
  const eventEntries = [
    {
      key: "wedding" as const,
      label: "청첩장",
      description: "두 사람의 사진과 예식 정보를 담는 디자인",
      preferredTemplateId: "wedding-barunson-anime-09"
    },
    {
      key: "dol" as const,
      label: "돌잔치",
      description: "아이 사진과 첫돌 문구에 맞는 디자인",
      preferredTemplateId: "dol-cute"
    },
    {
      key: "hwangap" as const,
      label: "환갑·칠순",
      description: "가족 호칭과 큰 글자가 편안한 디자인",
      preferredTemplateId: "hwangap-anime-2026"
    },
    {
      key: "housewarming" as const,
      label: "집들이",
      description: "주소와 일정이 또렷한 따뜻한 디자인",
      preferredTemplateId: "house-warm"
    }
  ].map((entry) => {
    const template =
      templates.find((template) => template.id === entry.preferredTemplateId) ??
      templates.find((template) => template.category === entry.key) ??
      null;

    return {
      ...entry,
      template,
      previewSource:
      entry.key === "wedding"
        ? finishedHeroCompositeSource
        : template
          ? getTemplatePreviewSource(template)
          : null
    };
  });

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
          어떤 초대를
          {"\n"}
          만드시나요?
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 26 }}>
          행사를 고르면 문구와 기존 디자인을 추천해드려요.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {eventEntries.map((entry) => {
          const selected = selectedEventKey === entry.key;

          return (
            <Pressable
              accessibilityHint="선택한 행사에 맞는 추천 디자인을 준비합니다."
              accessibilityLabel={`${entry.label} 선택`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={entry.key}
              onPress={() => setSelectedEventKey(entry.key)}
              style={({ pressed }) => ({
                height: 132,
                flexDirection: "row",
                borderRadius: 20,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: theme.colors.surface,
                overflow: "hidden",
                opacity: pressed ? 0.8 : 1,
                ...theme.shadow.card
              })}
            >
              <View style={{ flex: 1.15, padding: 18, gap: 7, justifyContent: "center" }}>
                <Text style={{ color: theme.colors.ink, fontSize: 22, fontWeight: "800" }}>{entry.label}</Text>
                <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
                  {entry.description}
                </Text>
              </View>
              <View style={{ flex: 0.85, backgroundColor: theme.colors.surfaceSoft }}>
                {entry.previewSource ? (
                  <Image
                    accessibilityIgnoresInvertColors
                    resizeMode="cover"
                    source={entry.previewSource}
                    style={
                      entry.key === "wedding"
                        ? { width: "100%", height: "100%" }
                        : {
                            position: "absolute",
                            right: 0,
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            height: 244
                          }
                    }
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityHint="선택한 행사에 맞는 전체 디자인 목록을 엽니다."
          accessibilityLabel="추천 디자인 보기"
          accessibilityRole="button"
          onPress={() => onOpenCategory(selectedEventKey)}
          style={({ pressed }) => ({
            minHeight: 52,
            borderRadius: 16,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
            ...theme.shadow.heroButton
          })}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>추천 디자인 보기</Text>
        </Pressable>
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
          {!finishedHeroCompositeFailed && heroFeaturedTemplate ? (
            <Pressable
              accessibilityHint="선택하면 가운데 초대장 예시 미리보기로 이동합니다."
              accessibilityLabel="완성 초대장 3종이 부채꼴로 겹친 오삼오삼 웨딩 디자인 셀렉션"
              accessibilityRole="button"
              onPress={() => onOpenPreview(heroFeaturedTemplate)}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 24,
                overflow: "hidden"
              }}
            >
              <Image
                accessible={false}
                accessibilityIgnoresInvertColors
                onError={() => setFinishedHeroCompositeFailed(true)}
                resizeMode="cover"
                source={finishedHeroCompositeSource}
                style={{ width: "100%", height: "100%" }}
              />
            </Pressable>
          ) : (
            heroTemplates.map((template, index) => (
              <HeroStackCard
                key={template.id}
                onOpenPreview={onOpenPreview}
                position={index === 0 ? "left" : index === 1 ? "center" : "right"}
                stackWidth={heroStackWidth}
                template={template}
              />
            ))
          )}
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
