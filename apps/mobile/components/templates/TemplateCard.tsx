import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { getTemplatePreviewSource } from "@/lib/template-image-source";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { theme } from "@/components/ui/theme";

type TemplateCardProps = {
  template: MobileTemplateGalleryItem;
  onOpenPreview: (template: MobileTemplateGalleryItem) => void;
  width?: number;
};

export function TemplateCard({ template, onOpenPreview, width }: TemplateCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const previewSource = imageFailed ? null : getTemplatePreviewSource(template);

  return (
    <Pressable
      accessibilityLabel={`예시, ${template.name}, ${template.badge}, ${template.desc}, 미리보기 열기`}
      accessibilityRole="button"
      onPress={() => onOpenPreview(template)}
      style={({ pressed }) => ({
        width,
        minWidth: 44,
        minHeight: 44,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: pressed ? theme.colors.primary : theme.colors.border,
        overflow: "hidden",
        opacity: pressed ? 0.88 : 1,
        ...theme.shadow.card
      })}
    >
      <View accessible={false} style={{ height: 220, backgroundColor: theme.colors.surfaceSoft, padding: 10 }}>
        {previewSource ? (
          <Image
            alt=""
            accessible={false}
            accessibilityElementsHidden
            accessibilityIgnoresInvertColors
            importantForAccessibility="no-hide-descendants"
            onError={() => setImageFailed(true)}
            resizeMode="cover"
            source={previewSource}
            style={{ width: "100%", height: "100%", borderRadius: theme.radius.md }}
          />
        ) : (
          <View
            accessible={false}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.colors.blush }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "700" }}>미리보기 준비 중</Text>
          </View>
        )}
      </View>

      <View accessible={false} style={{ padding: 14, gap: 8 }}>
        <Text style={{ color: theme.colors.primaryDark, fontSize: 12, fontWeight: "800" }}>{template.badge}</Text>
        <Text numberOfLines={1} style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>
          {template.name}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
          {template.desc}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {template.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={{ borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceSoft, paddingHorizontal: 9, paddingVertical: 5 }}>
              <Text style={{ color: theme.colors.textLight, fontSize: 11, fontWeight: "700" }}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}
