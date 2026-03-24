import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/useAuth";

const providerButtons = [
  { label: "Apple로 로그인", hint: "iOS 네이티브 인증" },
  { label: "Kakao로 로그인", hint: "웹 OAuth 후 앱 복귀" },
  { label: "이메일로 로그인", hint: "Supabase 기본 인증" }
];

export default function LoginScreen() {
  const { configured, status, user } = useAuth();

  return (
    <Screen
      subtitle="로그인 스캐폴드만 먼저 준비하고, 실제 인증 연결은 다음 구현 단계에서 붙입니다."
      title="로그인"
    >
      {status === "loading" ? <Loading label="세션 상태를 확인하는 중..." /> : null}
      {!configured ? (
        <ErrorView description="EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY가 없어서 실제 인증은 아직 비활성화되어 있습니다." />
      ) : null}
      <Card eyebrow="시작하기" title="작업실에 들어가기">
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>
          작성자는 앱에서 초대장을 만들고 관리합니다. 공개 초대장은 웹 링크로 공유됩니다.
        </Text>
        <Text style={{ color: "#766452", lineHeight: 22, marginTop: 8 }}>
          현재 세션 상태: {status === "authenticated" ? user?.email ?? "로그인됨" : "로그인 전"}
        </Text>

        <View style={{ gap: 12, marginTop: 18 }}>
          {providerButtons.map((provider) => (
            <Pressable
              key={provider.label}
              accessibilityLabel={provider.label}
              style={{
                minHeight: 48,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#d8c3b0",
                backgroundColor: configured ? "#fff" : "#f6f1eb",
                paddingHorizontal: 16,
                alignItems: "flex-start",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "#2e231a", fontWeight: "700" }}>{provider.label}</Text>
              <Text style={{ color: "#766452", marginTop: 4 }}>{provider.hint}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Link asChild href="/(tabs)">
        <Pressable
          accessibilityLabel="앱 홈으로 돌아가기"
          style={{
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "#8d5a2b", fontWeight: "700" }}>둘러보기로 돌아가기</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}
