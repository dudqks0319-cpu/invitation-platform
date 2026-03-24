import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

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
  return (
    <Screen
      footer="v1.0은 결혼식 제작 흐름부터 검증합니다."
      subtitle="앱에서 초대장을 만들고, 손님은 웹 링크로 바로 확인합니다."
      title="InviteHub"
    >
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        <Pill active label="결혼식" />
        <Pill label="돌잔치 준비중" />
        <Pill label="환갑 준비중" />
      </View>

      <Card
        eyebrow="핵심 흐름"
        title="작성은 앱, 공유는 웹"
      >
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
        <Link asChild href="/builder/step1-basic">
          <Pressable
            accessibilityLabel="초대장 만들기 화면으로 이동"
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
        </Link>
      </Card>

      {templates.map((template) => (
        <Card
          key={template.id}
          eyebrow="추천 템플릿"
          title={template.title}
        >
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{template.description}</Text>
        </Card>
      ))}
    </Screen>
  );
}
