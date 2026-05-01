import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroSection } from "@/components/home/HeroSection";
import { theme } from "@/components/ui/theme";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { useAuth } from "@/hooks/useAuth";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";

export default function HomeScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);

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
          <Text style={{ color: theme.colors.accent, fontSize: 20, fontWeight: "800" }}>💌 InviteHub</Text>
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
            onUseTemplate={(template) => {
              void handleUseTemplate(template);
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
