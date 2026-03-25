import { Link, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { createAndPersistDraft } from "@/lib/drafts";
import { useAuth } from "@/hooks/useAuth";
import { theme } from "@/components/ui/theme";

const templates = [
  {
    id: "wedding-classic",
    title: "클래식 로즈",
    description: "따뜻한 크림 톤의 웨딩 초대장"
  },
  {
    id: "wedding-modern",
    title: "다크 골드",
    description: "짙은 배경과 금색 포인트"
  },
  {
    id: "wedding-floral",
    title: "플로럴 블룸",
    description: "밝고 화사한 꽃무늬 감성"
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { status, user } = useAuth();
  const draftOwnerId = status === "authenticated" && user?.id ? user.id : "local-preview-owner";

  return (
    <Screen
      footer="v1.0은 결혼식 제작 흐름부터 검증합니다."
      subtitle="나만의 웨딩 무드를 앱에서 정리하고, 손님은 웹 링크로 바로 확인합니다."
      title="InviteHub"
    >
      <View
        style={{
          backgroundColor: "rgba(255,253,249,0.94)",
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: theme.shadow.card.shadowColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.7,
          shadowRadius: 24,
          elevation: 5
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>Weddy Mood</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Ionicons color={theme.colors.muted} name="notifications-outline" size={22} />
          <Ionicons color={theme.colors.muted} name="person-circle-outline" size={24} />
        </View>
      </View>

      <View style={{ gap: 8, marginTop: 6 }}>
        <Text style={{ color: "#8e8a84", fontSize: 18, letterSpacing: 0.8 }}>모바일 초대장 플랫폼</Text>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "500" }}>
          나만의 특별한 웨딩 데이
          <Text style={{ color: "#c89aa0" }}> ♡</Text>
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
        <Pill active label="결혼식" />
        <Pill label="돌잔치 준비중" />
        <Pill label="환갑 준비중" />
      </View>

      <Card eyebrow="핵심 흐름" title="작성은 앱, 공유는 웹">
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>
          사진과 문구를 앱에서 정리하고, 최종 초대장은 카카오톡 링크로 공유합니다.
        </Text>
        <Link asChild href="/login">
          <Pressable
            accessibilityLabel="로그인 화면으로 이동"
            style={{
              backgroundColor: "#8d5a2b",
              borderRadius: 16,
              marginTop: 16,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>로그인하고 시작하기</Text>
          </Pressable>
        </Link>
        <Pressable
          accessibilityLabel="새 초대장 만들기"
          onPress={async () => {
            const draft = await createAndPersistDraft(draftOwnerId);
            router.push({ pathname: "/builder/step1-basic", params: { localId: draft.localId } });
          }}
          style={{
            borderRadius: 16,
            marginTop: 12,
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#d2bba6"
          }}
        >
          <Text style={{ color: "#8d5a2b", fontWeight: "700" }}>바로 초대장 만들기</Text>
        </Pressable>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        {templates.map((template, index) => {
          const cardStyles = [
            {
              backgroundColor: "#fff5f0",
              accent: "#f0c9c2",
              subtitle: "저희 결혼합니다",
              image: true
            },
            {
              backgroundColor: "#fffdf8",
              accent: "#dce8dc",
              subtitle: "세상에서 가장 아름다운 날",
              image: false
            },
            {
              backgroundColor: "#fffaf6",
              accent: "#ead8c4",
              subtitle: "소중한 약속",
              image: true
            }
          ][index % 3];

          return (
            <View
              key={template.id}
              style={{
                width: "47%",
                minWidth: 156,
                backgroundColor: cardStyles.backgroundColor,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: 16,
                shadowColor: theme.shadow.card.shadowColor,
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.85,
                shadowRadius: 30,
                elevation: 5
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "700" }}>{template.title}</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Ionicons color={theme.colors.muted} name="create-outline" size={18} />
                  <Ionicons color={theme.colors.muted} name="share-social-outline" size={18} />
                </View>
              </View>
              {cardStyles.image ? (
                <View
                  style={{
                    marginTop: 14,
                    height: 118,
                    borderRadius: 20,
                    backgroundColor: cardStyles.accent
                  }}
                />
              ) : (
                <View
                  style={{
                    marginTop: 14,
                    minHeight: 118,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#d6c8b5",
                    padding: 16,
                    justifyContent: "space-between"
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                    {template.title === "다크 골드" ? "지우 & 수현" : "하은 & 준호"}
                  </Text>
                  <Text style={{ color: theme.colors.muted, lineHeight: 22, textAlign: "center" }}>
                    {cardStyles.subtitle}
                  </Text>
                </View>
              )}
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "700", marginTop: 14 }}>
                {cardStyles.subtitle}
              </Text>
              <Text style={{ color: theme.colors.muted, fontSize: 13, marginTop: 6 }}>2024.10.{12 + index}</Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
