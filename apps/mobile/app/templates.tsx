/* eslint-disable jsx-a11y/alt-text */

import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { mobileTemplateCategories, mobileTemplateGallery, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { getInviteHubBaseUrl } from "@/lib/web-links";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";

function getTemplatePreviewUrl(template: MobileTemplateGalleryItem) {
  if (!template.previewPath) return null;
  if (template.previewPath.startsWith("http")) return template.previewPath;
  return `${getInviteHubBaseUrl()}${template.previewPath}`;
}

function getTemplatePreviewSource(template: MobileTemplateGalleryItem) {
  const bundledSource = getBundledTemplatePreviewSource(template.id);
  if (bundledSource) {
    return bundledSource;
  }

  const imageUrl = getTemplatePreviewUrl(template);
  return imageUrl ? { uri: imageUrl } : null;
}

export default function TemplatesScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);
  const [category, setCategory] = useState<string>(mobileTemplateCategories[0].key);

  const filteredTemplates = useMemo(
    () => mobileTemplateGallery.filter((template) => template.category === category),
    [category]
  );

  async function handleUseTemplate(template: MobileTemplateGalleryItem) {
    const draft = await createAndPersistDraft(draftOwnerId, {
      templateId: template.id,
      eventType: template.category,
      title: `${template.badge} 초대장`
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
              width: 42,
              height: 42,
              borderRadius: 21,
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
          <View style={{ width: 42 }} />
        </View>

        <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
          앱 안에서 템플릿을 비교하고, 마음에 드는 디자인으로 바로 시작할 수 있습니다.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 8 }}
        >
          {mobileTemplateCategories.map((item) => (
            <Pressable key={item.key} onPress={() => setCategory(item.key)}>
              <Pill active={item.key === category} label={`${item.emoji} ${item.label}`} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ gap: 18 }}>
          {filteredTemplates.map((template) => {
            const previewSource = getTemplatePreviewSource(template);
            return (
              <View
                key={template.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 28,
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
                    height: 440,
                    backgroundColor: "#f4ece2",
                    padding: 18,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {previewSource ? (
                    <Image
                      source={previewSource}
                      style={{ width: "100%", height: "100%", borderRadius: 22 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: "72%",
                        aspectRatio: 0.58,
                        borderRadius: 28,
                        backgroundColor: "rgba(255,250,244,0.92)",
                        borderWidth: 1,
                        borderColor: "rgba(172,137,102,0.12)",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 18
                      }}
                    >
                      <Text style={{ color: "#b28a5f", fontSize: 12, letterSpacing: 3, textAlign: "center" }}>
                        INVITATION
                      </Text>
                      <Text
                        style={{
                          color: "#7d5d42",
                          fontSize: 28,
                          fontStyle: "italic",
                          marginTop: 12,
                          textAlign: "center"
                        }}
                      >
                        {template.name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ padding: 22, gap: 12 }}>
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
                  <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "700" }}>{template.name}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 26 }}>{template.desc}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {template.tags.map((tag) => (
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
                  <Button accessibilityLabel={`${template.name} 템플릿으로 시작`} onPress={() => void handleUseTemplate(template)}>
                    이 템플릿으로 시작하기
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
