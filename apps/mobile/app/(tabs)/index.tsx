import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroSection } from "@/components/home/HeroSection";
import { theme } from "@/components/ui/theme";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { createTemplateDiscoveryEntryKey } from "@/lib/template-discovery-entry";
import { createTemplatePreviewDestination } from "@/lib/template-discovery-navigation";

export default function HomeScreen() {
  const router = useRouter();

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
            height: 68,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: "rgba(255,255,255,0.92)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Text style={{ color: theme.colors.accent, fontSize: 20, fontWeight: "800" }}>💌 오삼오삼</Text>
          <Pressable
            accessibilityLabel="로그인"
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
              justifyContent: "center"
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "700" }}>로그인</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 24 }}>
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
