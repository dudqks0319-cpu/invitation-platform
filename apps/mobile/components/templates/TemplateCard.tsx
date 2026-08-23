import { memo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { getTemplatePreviewSource } from "@/lib/template-image-source";
import {
  createTemplateImageRecoveryState,
  resolveRecoverableTemplateImage,
  synchronizeTemplateImageRecoveryState
} from "@/lib/template-image-recovery";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { getTemplateCardExternalMetadata } from "@/lib/template-sample-overlay-presentation";
import { getUniqueTemplateTags } from "@/lib/template-tags";
import { theme } from "@/components/ui/theme";

type TemplateCardProps = {
  template: MobileTemplateGalleryItem;
  onOpenPreview: (template: MobileTemplateGalleryItem) => void;
  onStart?: (template: MobileTemplateGalleryItem) => void;
  startDisabled?: boolean;
  starting?: boolean;
  width?: number;
};

export const TemplateCard = memo(function TemplateCard({
  template,
  onOpenPreview,
  onStart,
  startDisabled = false,
  starting = false,
  width
}: TemplateCardProps) {
  const metadata = getTemplateCardExternalMetadata(template);
  const resolvedSource = getTemplatePreviewSource(template);
  const [imageState, setImageState] = useState(() => createTemplateImageRecoveryState(resolvedSource));
  const synchronizedImageState = synchronizeTemplateImageRecoveryState(imageState, resolvedSource);
  if (imageState !== synchronizedImageState) {
    setImageState(synchronizedImageState);
  }
  const { sourceIdentity, visibleSource: previewSource } = resolveRecoverableTemplateImage(
    resolvedSource,
    synchronizedImageState.failed ? synchronizedImageState.sourceIdentity : null
  );
  const imageFailed = synchronizedImageState.failed && synchronizedImageState.sourceIdentity === sourceIdentity;
  const previewHeight = width ? Math.max(220, Math.min(420, Math.round(width * 1.3))) : 220;

  return (
    <View
      accessibilityLabel={`예시, ${template.name}, ${template.badge}, ${template.desc}${imageFailed ? ", 이미지 표시 실패" : ""}`}
      style={{
        width,
        minWidth: 44,
        minHeight: 44,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: "hidden",
        ...theme.shadow.card
      }}
    >
      <View
        accessible={false}
        style={{
          height: previewHeight,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.surfaceSoft,
          padding: 10
        }}
      >
        {previewSource ? (
          <View style={{ height: "100%", aspectRatio: 941 / 1672, borderRadius: theme.radius.md, overflow: "hidden" }}>
            <Image
              alt=""
              accessible={false}
              accessibilityElementsHidden
              accessibilityIgnoresInvertColors
              importantForAccessibility="no-hide-descendants"
              key={sourceIdentity}
              onError={() => setImageState({ sourceIdentity, failed: true })}
              resizeMode="cover"
              source={previewSource}
              style={{ width: "100%", height: "100%" }}
            />
            {template.sampleTextOverlay ? <TemplateSampleTextOverlay compact template={template} /> : null}
          </View>
        ) : (
          <View
            accessible={false}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.colors.blush }}
          >
            <Text style={{ color: theme.colors.ink, fontSize: 13, fontWeight: "700", textAlign: "center" }}>
              {imageFailed ? "미리보기 이미지를 표시할 수 없어요" : "미리보기 준비 중"}
            </Text>
          </View>
        )}
      </View>

      <View style={{ padding: 14, gap: 10 }}>
        <Text style={{ color: theme.colors.ink, fontSize: 12, fontWeight: "800" }}>{template.badge}</Text>
        <Text style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>
          {metadata.name}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
          {metadata.description}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {getUniqueTemplateTags(template.tags).slice(0, 3).map((tag) => (
            <View key={tag} style={{ borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceSoft, paddingHorizontal: 9, paddingVertical: 5 }}>
              <Text style={{ color: theme.colors.ink, fontSize: 11, fontWeight: "700" }}>{tag}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityHint="가상 행사 정보가 적용된 전체 디자인 미리보기를 엽니다. 초안은 만들지 않습니다."
          accessibilityLabel={`${template.name} 전체 보기`}
          accessibilityRole="button"
          onPress={() => onOpenPreview(template)}
          style={({ pressed }) => ({
            minHeight: 44,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: theme.colors.primaryDark,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1
          })}
        >
          <Text style={{ color: theme.colors.primaryDark, fontSize: 15, fontWeight: "800" }}>전체 보기</Text>
        </Pressable>
        {onStart ? (
          <Pressable
            accessibilityHint="이 디자인으로 편집 가능한 초안을 한 번 만들고 편집 화면을 엽니다."
            accessibilityLabel={starting ? `${template.name} 초대장을 만드는 중` : `${template.name} 이 디자인으로 시작`}
            accessibilityRole="button"
            accessibilityState={{ busy: starting, disabled: startDisabled }}
            disabled={startDisabled}
            onPress={() => onStart(template)}
            style={({ pressed }) => ({
              minHeight: 48,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: startDisabled ? 0.58 : pressed ? 0.76 : 1
            })}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>
              {starting ? "초대장을 만드는 중" : "이 디자인으로 시작"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
