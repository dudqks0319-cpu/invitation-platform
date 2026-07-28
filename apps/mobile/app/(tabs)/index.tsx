import { useRouter } from "expo-router";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroSection } from "@/components/home/HeroSection";
import { theme } from "@/components/ui/theme";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { createTemplateDiscoveryEntryKey } from "@/lib/template-discovery-entry";
import { createTemplatePreviewDestination } from "@/lib/template-discovery-navigation";

export default function HomeScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const usesStackedHeader = fontScale >= 1.8;

  function handleOpenPreview(template: MobileTemplateGalleryItem) {
    const destination = createTemplatePreviewDestination(template.id);
    if (destination) router.push(destination);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 44
        }}
      >
        <View
          style={{
            paddingHorizontal: 24,
            minHeight: 68,
            paddingVertical: usesStackedHeader ? 12 : 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: "rgba(255,255,255,0.92)",
            flexDirection: usesStackedHeader ? "column" : "row",
            alignItems: usesStackedHeader ? "stretch" : "center",
            justifyContent: "space-between"
          }}
        >
          <Text style={{ color: theme.colors.accent, fontSize: 20, fontWeight: "800" }}>💌 오삼오삼</Text>
          <Pressable
            accessibilityHint="로그인 화면을 엽니다."
            accessibilityLabel="로그인"
            accessibilityRole="button"
            onPress={() => {
              router.push("/login");
            }}
            style={{
              minHeight: 44,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.accent,
              paddingHorizontal: 14,
              paddingVertical: 8,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: usesStackedHeader ? "stretch" : "auto",
              marginTop: usesStackedHeader ? 8 : 0
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "700" }}>로그인</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
          <Pressable
            accessibilityHint="개발계획서의 8개 새 화면을 실제 템플릿으로 순서대로 확인합니다."
            accessibilityLabel="새 UI 전체 흐름 보기"
            accessibilityRole="button"
            onPress={() => router.push("/uiux-preview")}
            style={({ pressed }) => ({
              minHeight: 52,
              marginBottom: 18,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primaryLight,
              paddingHorizontal: 16,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.78 : 1
            })}
          >
            <Text style={{ color: theme.colors.primaryDark, fontSize: 15, fontWeight: "800" }}>
              새 UI 8개 화면 전체 보기
            </Text>
          </Pressable>
          <HeroSection
            onOpenCategory={(category) => {
              const entryKey = createTemplateDiscoveryEntryKey();
              router.push({ pathname: "/templates", params: { category, entryKey } });
            }}
            onOpenPreview={handleOpenPreview}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
