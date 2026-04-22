import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Image, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { mobileTemplateCategories, mobileTemplateGallery, type MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { getInviteHubBaseUrl } from "@/lib/web-links";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";

const categoryDescription: Record<string, string> = {
  wedding: "두 사람의 새로운 시작을 함께 축하해주세요",
  dol: "사랑스러운 우리 아기의 첫 생일을 축하해 주세요",
  birthday: "소중한 사람의 특별한 하루를 축하해주세요",
  anniversary: "우리의 소중한 추억을 기념하며 마음을 전하세요",
  hwangap: "인생의 아름다운 순간, 축하의 마음을 전하세요",
  other: "다양한 상황에 맞는 초대장을 선택해보세요",
  bridal: "결혼을 앞둔 설렘을 부드럽게 담아보세요",
  baby: "새로운 가족을 맞이하는 따뜻한 시간을 전하세요",
  graduation: "새로운 출발을 축하하는 마음을 전하세요",
  housewarming: "새 보금자리의 따뜻한 시간을 초대하세요",
  business: "격식 있는 행사 안내를 차분하게 전달하세요"
};

function getTemplatePreviewUrl(template: MobileTemplateGalleryItem) {
  if (!template.previewPath) return null;
  if (template.previewPath.startsWith("http")) return template.previewPath;
  return `${getInviteHubBaseUrl()}${template.previewPath}`;
}

function getTemplatePreviewSource(template: MobileTemplateGalleryItem) {
  const bundledSource = getBundledTemplatePreviewSource(template.id);
  if (bundledSource) return bundledSource;

  const imageUrl = getTemplatePreviewUrl(template);
  return imageUrl ? { uri: imageUrl } : null;
}

function TemplatePoster({
  onPress,
  template
}: {
  onPress: () => void;
  template: MobileTemplateGalleryItem;
}) {
  const previewSource = getTemplatePreviewSource(template);

  return (
    <Pressable
      accessibilityLabel={`${template.name} 템플릿으로 시작`}
      onPress={onPress}
      style={{
        width: "48%",
        gap: 6,
        marginBottom: 12
      }}
    >
      <View
        style={{
          aspectRatio: 0.62,
          borderRadius: 8,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.shadow.card.shadowColor,
          shadowOffset: { width: 0, height: 9 },
          shadowOpacity: 0.9,
          shadowRadius: 18,
          elevation: 4
        }}
      >
        {previewSource ? (
          <Image alt="" source={previewSource} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 12 }}>
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "800", textAlign: "center" }}>
              {template.name}
            </Text>
          </View>
        )}
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "700" }} numberOfLines={1}>
        {template.name}
      </Text>
    </Pressable>
  );
}

export default function TemplatesScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);
  const isWeb = Platform.OS === "web";

  const grouped = useMemo(
    () =>
      mobileTemplateCategories
        .map((category) => ({
          ...category,
          description: categoryDescription[category.key] ?? "상황에 맞는 초대장을 선택해보세요",
          items: mobileTemplateGallery.filter((template) => template.category === category.key)
        }))
        .filter((category) => category.items.length > 0),
    []
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
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 34,
          alignItems: isWeb ? "center" : "stretch"
        }}
      >
        <View style={{ width: "100%", maxWidth: isWeb ? 1180 : undefined, gap: 24 }}>
          <View style={{ height: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable accessibilityLabel="뒤로가기" onPress={() => router.back()}>
              <Ionicons color={theme.colors.text} name="chevron-back" size={24} />
            </Pressable>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "800" }}>초대장 템플릿</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ alignItems: "center", gap: 8 }}>
            <Text style={{ color: theme.colors.muted, fontSize: 15 }}>다양한 상황에 맞는</Text>
            <Text style={{ color: theme.colors.text, fontSize: isWeb ? 42 : 34, fontWeight: "500", lineHeight: isWeb ? 52 : 43 }}>
              초대장 템플릿
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 22, textAlign: "center" }}>
              특별한 날을 더욱 빛내줄 다정한 디자인의 초대장을 선택해보세요.
            </Text>
          </View>

          <View style={{ gap: 28 }}>
            {grouped.map((category) => (
              <View key={category.key} style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 24 }}>{category.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "800" }}>{category.label} 템플릿</Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                      {category.description}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                  {category.items.map((template) => (
                    <TemplatePoster
                      key={template.id}
                      onPress={() => void handleUseTemplate(template)}
                      template={template}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
