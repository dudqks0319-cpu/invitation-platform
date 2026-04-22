import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createAndPersistDraft } from "@/lib/drafts";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { icon: "heart-outline" as const, label: "결혼식" },
  { icon: "person-outline" as const, label: "돌잔치" },
  { icon: "flower-outline" as const, label: "샤워" },
  { icon: "home-outline" as const, label: "집들이" },
  { icon: "sparkles-outline" as const, label: "환갑" }
];

const recommended = [
  "wedding-flower-garden",
  "dol-cute",
  "bridal-pink",
  "house-warm",
  "hwangap-classic",
  "wedding-modern"
];

export default function HomeScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const draftOwnerId = getDraftOwnerId(status === "authenticated" ? user : null);
  const isWeb = Platform.OS === "web";
  const heroSource = getBundledTemplatePreviewSource("wedding-flower-garden");

  async function startDraft() {
    const draft = await createAndPersistDraft(draftOwnerId);
    router.push({ pathname: "/builder/step1-basic", params: { localId: draft.localId } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: isWeb ? "center" : "stretch",
          paddingBottom: 34
        }}
      >
        <View style={{ width: "100%", maxWidth: isWeb ? 420 : undefined, paddingHorizontal: 14, paddingTop: 8 }}>
          <View
            style={{
              height: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Ionicons color={theme.colors.text} name="menu-outline" size={24} />
            <Text style={{ color: theme.colors.text, fontSize: 23, fontWeight: "500" }}>invite</Text>
            <Ionicons color={theme.colors.text} name="notifications-outline" size={21} />
          </View>

          <View
            style={{
              minHeight: 194,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: theme.colors.surface,
              marginTop: 10
            }}
          >
            {heroSource ? (
              <Image
                alt=""
                source={heroSource}
                style={{ position: "absolute", width: "100%", height: "100%", right: 0 }}
                resizeMode="cover"
              />
            ) : null}
            <View
              style={{
                minHeight: 194,
                justifyContent: "center",
                paddingHorizontal: 28,
                backgroundColor: "rgba(248,245,240,0.72)"
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 19, lineHeight: 31, fontWeight: "500" }}>
                소중한 순간을{"\n"}특별한 초대장으로
              </Text>
              <Pressable
                accessibilityLabel="초대장 만들기"
                onPress={() => void startDraft()}
                style={{
                  alignSelf: "flex-start",
                  minHeight: 42,
                  borderRadius: 7,
                  backgroundColor: theme.colors.charcoal,
                  justifyContent: "center",
                  paddingHorizontal: 18,
                  marginTop: 20
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>초대장 만들기</Text>
              </Pressable>
            </View>
          </View>

          <View
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              backgroundColor: "rgba(255,253,249,0.9)",
              paddingHorizontal: 14,
              paddingVertical: 12,
              gap: 4
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: "900" }}>공유 링크</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text
                numberOfLines={1}
                style={{ flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: "800" }}
              >
                invitehub.kr/i/junseo-eunjae
              </Text>
              <View
                style={{
                  borderRadius: 999,
                  backgroundColor: theme.colors.charcoal,
                  paddingHorizontal: 10,
                  paddingVertical: 6
                }}
              >
                <Text style={{ color: "#FFFDF9", fontSize: 11, fontWeight: "900" }}>복사</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 24, gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "800" }}>카테고리</Text>
              <Pressable accessibilityLabel="전체 카테고리 보기" onPress={() => router.push("/templates")}>
                <Text style={{ color: theme.colors.muted, fontSize: 12 }}>전체보기 ›</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              {categories.map((category, index) => (
                <Pressable
                  accessibilityLabel={`${category.label} 템플릿 보기`}
                  key={category.label}
                  onPress={() => router.push("/templates")}
                  style={{ alignItems: "center", flex: 1, gap: 7 }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: index === 0 ? "#F4DCD8" : theme.colors.surfaceSoft
                    }}
                  >
                    <Ionicons color={index === 0 ? "#C4776D" : theme.colors.accent} name={category.icon} size={22} />
                  </View>
                  <Text style={{ color: theme.colors.text, fontSize: 11 }}>{category.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 26, gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "800" }}>추천 템플릿</Text>
              <Pressable accessibilityLabel="추천 템플릿 전체 보기" onPress={() => router.push("/templates")}>
                <Text style={{ color: theme.colors.muted, fontSize: 12 }}>전체보기 ›</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {recommended.map((templateId) => {
                const source = getBundledTemplatePreviewSource(templateId);

                return (
                <Pressable
                  accessibilityLabel="추천 템플릿 선택"
                  key={templateId}
                  onPress={() => router.push("/templates")}
                  style={{
                    width: "31.5%",
                    aspectRatio: 0.74,
                    borderRadius: 8,
                    overflow: "hidden",
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border
                  }}
                >
                  {source ? <Image alt="" source={source} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
                </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
