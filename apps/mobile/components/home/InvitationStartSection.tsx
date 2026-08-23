/* eslint-disable jsx-a11y/alt-text */

import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/components/ui/theme";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { getFinishedHomeHeroCompositeSource } from "@/lib/home-hero-finished-source";
import { getTemplatePreviewSource } from "@/lib/template-image-source";
import { uiuxEventOptions, type UiuxEventKey } from "@/lib/uiux-preview-flow";

type InvitationStartSectionProps = {
  selectedEventKey: UiuxEventKey;
  onSelectEvent: (eventKey: UiuxEventKey) => void;
  onContinue: (eventKey: UiuxEventKey) => void;
};

export function InvitationStartSection({
  selectedEventKey,
  onSelectEvent,
  onContinue
}: InvitationStartSectionProps) {
  const { templates } = useTemplateCatalog();
  const [weddingCompositeFailed, setWeddingCompositeFailed] = useState(false);
  const weddingCompositeSource = getFinishedHomeHeroCompositeSource();
  const eventEntries = uiuxEventOptions.map((entry) => {
    const template =
      templates.find((template) => template.id === entry.preferredTemplateId) ??
      templates.find((template) => template.category === entry.key) ??
      null;

    return {
      ...entry,
      previewSource:
        entry.key === "wedding" && !weddingCompositeFailed
          ? weddingCompositeSource
          : template
            ? getTemplatePreviewSource(template)
            : null
    };
  });

  return (
    <View style={{ gap: 24 }}>
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
              onPress={() => onSelectEvent(entry.key)}
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
                    onError={() => {
                      if (entry.key === "wedding") setWeddingCompositeFailed(true);
                    }}
                    resizeMode="cover"
                    source={entry.previewSource}
                    style={
                      entry.key === "wedding" && !weddingCompositeFailed
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
          onPress={() => onContinue(selectedEventKey)}
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
    </View>
  );
}
