import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";

const inputStyle = {
  minHeight: 48,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  color: theme.colors.text
} as const;

type ActionKey = "email-sign-in" | "email-sign-up" | "apple" | "kakao";
type AuthActionResult = {
  error?: Error | { message?: string } | null;
  data?: { session?: unknown; user?: unknown } | { provider?: unknown; url?: string | null } | null;
};

export default function LoginScreen() {
  const {
    authCallbackPath,
    configMessage,
    configMissingKeys,
    configured,
    signInWithApple,
    signInWithKakao,
    signInWithPassword,
    signUpWithPassword,
    status,
    user
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<"" | ActionKey>("");
  const hasEmailCredentials = email.trim().length > 0 && password.trim().length > 0;
  const isAuthenticated = status === "authenticated";

  async function runAction(actionKey: ActionKey, action: () => Promise<AuthActionResult>) {
    if ((actionKey === "email-sign-in" || actionKey === "email-sign-up") && !hasEmailCredentials) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      setMessage("");
      return;
    }

    setPendingAction(actionKey);
    setError("");
    setMessage("");

    try {
      const result = await action();
      const nextError = result?.error;

      if (nextError) {
        const nextMessage = nextError instanceof Error ? nextError.message : nextError.message ?? "로그인에 실패했습니다.";
        setError(nextMessage);
      } else {
        const hasSession =
          result?.data && typeof result.data === "object" && "session" in result.data && Boolean(result.data.session);

        if (actionKey === "email-sign-up") {
          setMessage(
            hasSession
              ? "계정을 만들고 바로 로그인했습니다."
              : "계정을 만들었습니다. 이메일 인증이 필요하다면 메일함을 확인해 주세요."
          );
        } else if (actionKey === "kakao") {
          setMessage("Kakao 인증 창을 열었습니다. 인증을 마치고 앱으로 돌아오면 연결됩니다.");
        } else if (actionKey === "apple") {
          setMessage("Apple 로그인을 처리했습니다. 세션이 연결되면 내 초대장 화면으로 이동할 수 있습니다.");
        } else {
          setMessage("로그인 요청을 처리했습니다.");
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인 중 오류가 발생했습니다.");
    } finally {
      setPendingAction("");
    }
  }

  return (
    <Screen
      subtitle="작성자는 앱에서 초대장을 만들고 관리합니다. 공개 초대장은 웹 링크로 공유됩니다."
      title="로그인"
    >
      {status === "loading" ? <Loading label="세션 상태를 확인하는 중..." /> : null}
      {!configured ? (
        <ErrorView description={configMessage} />
      ) : null}
      {error ? <ErrorView description={error} title="로그인 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="인증 진행 중">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <Card eyebrow="현재 세션" title={status === "authenticated" ? "로그인됨" : "로그인 전"}>
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>
          {status === "authenticated"
            ? user?.email ?? "사용자 정보 없음"
            : configured
              ? "아직 연결된 계정이 없습니다. 이메일 또는 소셜 로그인을 선택해 주세요."
              : "Supabase 설정이 없어서 현재는 둘러보기 전용 상태입니다."}
        </Text>
        <Text style={{ color: "#766452", lineHeight: 22, marginTop: 8 }}>
          Kakao OAuth callback: {authCallbackPath}
        </Text>
        <Text style={{ color: "#766452", lineHeight: 22, marginTop: 8 }}>
          현재 상태: {isAuthenticated ? "원격 저장과 운영 데이터 동기화 가능" : "로컬 초안만 생성 가능"}
        </Text>
        {!configured && configMissingKeys.length > 0 ? (
          <Text style={{ color: "#8d5a2b", lineHeight: 22, marginTop: 8 }}>
            누락된 환경변수: {configMissingKeys.join(", ")}
          </Text>
        ) : null}
      </Card>

      {isAuthenticated ? (
        <Card eyebrow="다음 단계" title="이제 내 초대장을 관리할 수 있습니다">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>
            로그인 세션이 연결되었습니다. 내 초대장 화면에서 저장본과 RSVP, 방명록, 통계를 확인할 수 있습니다.
          </Text>
          <View style={{ marginTop: 12 }}>
            <Link asChild href="/(tabs)/my-invitations">
              <Pressable
                accessibilityLabel="내 초대장으로 이동"
                style={{
                  minHeight: 48,
                  borderRadius: 16,
                  backgroundColor: theme.colors.accent,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>내 초대장으로 이동</Text>
              </Pressable>
            </Link>
          </View>
        </Card>
      ) : null}

      {!isAuthenticated ? (
        <Card eyebrow="이메일 로그인" title="기본 인증">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="example@email.com"
          style={inputStyle}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
          style={[inputStyle, { marginTop: 12 }]}
          value={password}
        />
        <View style={{ marginTop: 12 }}>
          <Pressable
            accessibilityLabel="이메일로 로그인"
            disabled={!configured || pendingAction !== ""}
            onPress={() => runAction("email-sign-in", () => signInWithPassword(email, password))}
            style={{
              minHeight: 48,
              borderRadius: 16,
              backgroundColor: configured ? theme.colors.accent : "#d8cfc4",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {pendingAction === "email-sign-in" ? "로그인 중..." : "이메일로 로그인"}
            </Text>
          </Pressable>
        </View>
        <View style={{ marginTop: 10 }}>
          <Pressable
            accessibilityLabel="이메일로 계정 생성"
            disabled={!configured || pendingAction !== ""}
            onPress={() => runAction("email-sign-up", () => signUpWithPassword(email, password))}
            style={{
              minHeight: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#d8c3b0",
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#2e231a", fontWeight: "700" }}>
              {pendingAction === "email-sign-up" ? "계정 생성 중..." : "이메일 계정 만들기"}
            </Text>
          </Pressable>
        </View>
        <Text style={{ color: "#766452", lineHeight: 22, marginTop: 10 }}>
          처음 사용하는 이메일이면 가입 버튼으로 계정을 만든 뒤 바로 로그인 상태를 확인합니다.
        </Text>
        </Card>
      ) : null}

      {!isAuthenticated ? (
        <Card eyebrow="소셜 로그인" title="Apple · Kakao">
        <View style={{ gap: 12 }}>
          <Pressable
            accessibilityLabel="Apple로 로그인"
            disabled={!configured || pendingAction !== ""}
            onPress={() => runAction("apple", signInWithApple)}
            style={{
              minHeight: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#d8c3b0",
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#2e231a", fontWeight: "700" }}>
              {pendingAction === "apple" ? "Apple 로그인 중..." : "Apple로 로그인"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Kakao로 로그인"
            disabled={!configured || pendingAction !== ""}
            onPress={() => runAction("kakao", signInWithKakao)}
            style={{
              minHeight: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#d8c3b0",
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#2e231a", fontWeight: "700" }}>
              {pendingAction === "kakao" ? "Kakao 로그인 중..." : "Kakao로 로그인"}
            </Text>
          </Pressable>
        </View>
        <Text style={{ color: "#766452", lineHeight: 22, marginTop: 10 }}>
          Kakao 로그인 후 브라우저에서 앱으로 돌아오면 내 초대장 탭으로 연결됩니다.
        </Text>
        </Card>
      ) : null}

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
