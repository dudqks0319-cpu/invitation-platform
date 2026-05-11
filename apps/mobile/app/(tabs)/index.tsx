import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeroSection } from "@/components/home/HeroSection";
import { theme } from "@/components/ui/theme";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { getMobileHomeLayoutMode, getTemplateScrollTargetY } from "@/lib/home-layout";
import { useAuth } from "@/hooks/useAuth";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";

export default function HomeScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);
  const homeLayoutMode = getMobileHomeLayoutMode(status, user);
  const scrollRef = useRef<ScrollViewType>(null);
  const [templateAreaY, setTemplateAreaY] = useState(0);

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
        ref={scrollRef}
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
          {homeLayoutMode === "resume-first" ? (
            <View
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.16)",
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 18,
                paddingVertical: 18,
                marginBottom: 22,
                gap: 12
              }}
            >
              <View style={{ gap: 4 }}>
                <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800" }}>내 작업</Text>
                <Text style={{ color: theme.colors.ink, fontSize: 22, fontWeight: "800", lineHeight: 29 }}>
                  내 초대장 이어가기
                </Text>
                <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 21 }}>
                  저장한 초대장과 공개 링크를 먼저 확인한 뒤 새 디자인을 고를 수 있습니다.
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  accessibilityLabel="내 초대장 목록으로 이동"
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/my-invitations")}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: 999,
                    backgroundColor: theme.colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 14
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>이어가기</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="새 디자인 템플릿 둘러보기"
                  accessibilityRole="button"
                  onPress={() => {
                    scrollRef.current?.scrollTo({
                      y: getTemplateScrollTargetY(templateAreaY),
                      animated: true
                    });
                  }}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 14
                  }}
                >
                  <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "800" }}>새 디자인</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <View
            onLayout={(event) => {
              setTemplateAreaY(event.nativeEvent.layout.y);
            }}
          >
            <HeroSection
              onUseTemplate={(template) => {
                void handleUseTemplate(template);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
