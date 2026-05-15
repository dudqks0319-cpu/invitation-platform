import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { TemplateCanvasPreview } from "@/components/invitation/TemplateCanvasPreview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { mobileTemplateCategories, mobileTemplateGallery, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { createTemplatePreviewPayload } from "@/lib/template-preview-payload";

const templateCanvasAspectRatio = 768 / 1376;

export default function TemplatesScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const { width } = useWindowDimensions();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);
  const [category, setCategory] = useState<string>(mobileTemplateCategories[0].key);
  const cardWidth = Math.max(148, Math.floor((width - 54) / 2));
  const maxCanvasWidth = Math.max(112, cardWidth - 20);
  const rawPreviewHeight = Math.round(maxCanvasWidth / templateCanvasAspectRatio);
  const templatePreviewHeight = Math.min(292, Math.max(232, rawPreviewHeight));
  const templateCanvasWidth = Math.min(maxCanvasWidth, Math.round(templatePreviewHeight * templateCanvasAspectRatio));

  const filteredTemplates = useMemo(
    () => mobileTemplateGallery.filter((template) => template.category === category),
    [category]
  );

  async function handleUseTemplate(template: MobileTemplateGalleryItem) {
    const draft = await createAndPersistDraft(draftOwnerId, {
      templateId: template.id,
      eventType: template.category
    });
    router.push({ pathname: "/builder/step1-basic", params: { localId: draft.localId } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 20, paddingBottom: 36 }}>
        <View
          style={{
            height: 68,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Pressable
            accessibilityLabel="뒤로가기"
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.border
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>‹</Text>
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>디자인 둘러보기</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
          분위기에 맞는 디자인을 고르면 편집 화면에서 이름, 날짜, 장소만 바꾸면 됩니다.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 8 }}
        >
          {mobileTemplateCategories.map((item) => (
            <Pressable
              key={item.key}
              accessibilityLabel={`${item.label} 템플릿 보기`}
              accessibilityRole="button"
              accessibilityState={{ selected: item.key === category }}
              onPress={() => setCategory(item.key)}
            >
              <Pill active={item.key === category} label={`${item.emoji} ${item.label}`} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {filteredTemplates.map((template) => {
            const previewPayload = createTemplatePreviewPayload(template);
            return (
              <Pressable
                accessibilityLabel={`${template.name} 템플릿으로 시작`}
                key={template.id}
                onPress={() => void handleUseTemplate(template)}
                style={{
                  width: cardWidth,
                  backgroundColor: "#fff",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  overflow: "hidden",
                  shadowColor: theme.shadow.card.shadowColor,
                  shadowOffset: { width: 0, height: 14 },
                  shadowOpacity: 1,
                  shadowRadius: 26,
                  elevation: 5
                }}
              >
                <View
                  style={{
                    height: templatePreviewHeight,
                    backgroundColor: "#F7EFE6",
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <TemplateCanvasPreview
                    payload={previewPayload}
                    scale="thumbnail"
                    style={{ height: "100%", width: templateCanvasWidth, borderRadius: 18, overflow: "hidden" }}
                  />
                </View>

                <View style={{ padding: 14, gap: 9 }}>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: theme.colors.primaryLight,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6
                    }}
                  >
                    <Text style={{ color: theme.colors.primaryDark, fontSize: 12, fontWeight: "700" }}>{template.badge}</Text>
                  </View>
                  <Text style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23 }}>{template.name}</Text>
                  <Text numberOfLines={2} style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19 }}>
                    {template.desc}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {template.tags.slice(0, 2).map((tag) => (
                      <View
                        key={tag}
                        style={{
                          borderRadius: 999,
                          backgroundColor: theme.colors.surfaceSoft,
                          paddingHorizontal: 12,
                          paddingVertical: 7
                        }}
                      >
                        <Text style={{ color: theme.colors.textLight, fontSize: 13, fontWeight: "600" }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
