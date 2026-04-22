import { useState } from "react";
import { Link } from "expo-router";
import { Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";

const inputStyle = {
  minHeight: 48,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.surface,
  paddingHorizontal: 14,
  color: theme.colors.text
} as const;

type ActionKey = "email-sign-in" | "email-sign-up" | "google" | "apple" | "kakao";
type AuthActionResult = {
  error?: Error | { message?: string } | null;
  data?: { session?: unknown; user?: unknown } | { provider?: unknown; url?: string | null } | null;
};

function SocialCircle({
  disabled,
  label,
  onPress,
  tone
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  tone: "green" | "yellow" | "white";
}) {
  const backgroundColor = tone === "green" ? "#35C96F" : tone === "yellow" ? "#F4D64B" : "#FFFFFF";
  const textColor = tone === "green" ? "#FFFFFF" : "#2B2824";

  return (
    <Pressable
      accessibilityLabel={`${label}로 로그인`}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        borderWidth: tone === "white" ? 1 : 0,
        borderColor: theme.colors.border,
        opacity: disabled ? 0.45 : 1,
        shadowColor: theme.shadow.card.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.9,
        shadowRadius: 18,
        elevation: 3
      }}
    >
      <Text style={{ color: textColor, fontSize: 18, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const {
    configured,
    hasFullAccount,
    isAnonymousSession,
    signInWithGoogle,
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hasEmailCredentials = email.trim().length > 0 && password.trim().length > 0;
  const isWebPreview = Platform.OS === "web";
  const authActionsEnabled = configured && pendingAction === "" && !isWebPreview;
  const visualAuthEnabled = pendingAction === "" && (authActionsEnabled || isWebPreview);

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
      } else if (actionKey === "email-sign-up") {
        const hasSession =
          result?.data && typeof result.data === "object" && "session" in result.data && Boolean(result.data.session);
        setMessage(hasSession ? "계정을 만들고 바로 로그인했습니다." : "계정을 만들었습니다. 메일함을 확인해 주세요.");
      } else if (actionKey === "google") {
        setMessage("Google 인증 창을 열었습니다.");
      } else if (actionKey === "kakao") {
        setMessage("Kakao 인증 창을 열었습니다.");
      } else if (actionKey === "apple") {
        setMessage("Apple 로그인을 처리했습니다.");
      } else {
        setMessage("로그인 요청을 처리했습니다.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인 중 오류가 발생했습니다.");
    } finally {
      setPendingAction("");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 26,
          paddingVertical: 28
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", gap: 20 }}>
          <View style={{ alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.text,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 20 }}>♡</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "500", letterSpacing: 0 }}>
              invite
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 22, textAlign: "center" }}>
              소중한 순간을{"\n"}특별한 초대장으로
            </Text>
          </View>

          {status === "loading" ? <Loading label="계정 상태를 확인하는 중..." /> : null}
          {!configured && !isWebPreview ? (
            <ErrorView description="일부 온라인 기능을 준비 중입니다." title="로그인을 잠시 사용할 수 없어요" />
          ) : null}
          {error ? <ErrorView description={error} title="로그인을 완료하지 못했어요" /> : null}

          <View style={{ width: "100%", gap: 12 }}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="이메일을 입력해주세요"
              placeholderTextColor={theme.colors.textLight}
              style={inputStyle}
              value={email}
            />
            <View style={[inputStyle, { flexDirection: "row", alignItems: "center", paddingHorizontal: 0 }]}>
              <TextInput
                onChangeText={setPassword}
                placeholder="비밀번호를 입력해주세요"
                placeholderTextColor={theme.colors.textLight}
                secureTextEntry={!passwordVisible}
                style={{ flex: 1, minHeight: 48, paddingHorizontal: 14, color: theme.colors.text }}
                value={password}
              />
              <Pressable
                accessibilityLabel={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
                onPress={() => setPasswordVisible((current) => !current)}
                style={{ minHeight: 48, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: theme.colors.textLight, fontWeight: "700" }}>
                  {passwordVisible ? "숨기기" : "보기"}
                </Text>
              </Pressable>
            </View>
            <Button
              accessibilityLabel="이메일로 로그인"
              onPress={() => {
                if (isWebPreview) {
                  setError("");
                  setMessage("브라우저 미리보기에서는 실제 로그인 대신 화면만 확인합니다.");
                  return;
                }

                if (authActionsEnabled) {
                  void runAction("email-sign-in", () => signInWithPassword(email, password));
                }
              }}
            >
              {pendingAction === "email-sign-in" ? "로그인 중..." : "로그인"}
            </Button>

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 28 }}>
              <Pressable accessibilityLabel="비밀번호 찾기" onPress={undefined}>
                <Text style={{ color: theme.colors.muted, fontSize: 12 }}>비밀번호 찾기</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="회원가입"
                onPress={
                  visualAuthEnabled
                    ? () => void runAction("email-sign-up", () => signUpWithPassword(email, password))
                    : undefined
                }
              >
                <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                  {pendingAction === "email-sign-up" ? "가입 중..." : "회원가입"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={{ width: "100%", flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
            <Text style={{ color: theme.colors.muted, fontSize: 12 }}>또는 소셜 계정으로 로그인</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 24 }}>
            <SocialCircle
              disabled={!visualAuthEnabled}
              label="N"
              onPress={() => {
                if (isWebPreview) {
                  setMessage("브라우저 미리보기에서는 실제 소셜 로그인을 실행하지 않습니다.");
                  return;
                }
                void runAction("kakao", signInWithKakao);
              }}
              tone="green"
            />
            <SocialCircle
              disabled={!visualAuthEnabled}
              label="●"
              onPress={() => {
                if (isWebPreview) {
                  setMessage("브라우저 미리보기에서는 실제 소셜 로그인을 실행하지 않습니다.");
                  return;
                }
                void runAction("apple", signInWithApple);
              }}
              tone="yellow"
            />
            <SocialCircle
              disabled={!visualAuthEnabled}
              label="G"
              onPress={() => {
                if (isWebPreview) {
                  setMessage("브라우저 미리보기에서는 실제 소셜 로그인을 실행하지 않습니다.");
                  return;
                }
                void runAction("google", signInWithGoogle);
              }}
              tone="white"
            />
          </View>

          {message ? (
            <Text style={{ color: theme.colors.accent, fontSize: 13, lineHeight: 21, textAlign: "center" }}>{message}</Text>
          ) : null}
          {hasFullAccount ? (
            <View style={{ width: "100%", gap: 10 }}>
              <Text style={{ color: theme.colors.muted, fontSize: 13, textAlign: "center" }}>
                {user?.email ?? "계정 정보가 연결되었습니다."}
              </Text>
              <Link asChild href="/(tabs)/my-invitations">
                <Button accessibilityLabel="내 초대장으로 이동">내 초대장으로 이동</Button>
              </Link>
            </View>
          ) : null}
          {isAnonymousSession ? (
            <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 19, textAlign: "center" }}>
              게스트 모드입니다. 계정을 연결하면 저장본과 발행 내역을 이어서 관리할 수 있어요.
            </Text>
          ) : null}
          {isWebPreview ? (
            <Text style={{ color: theme.colors.accent, fontSize: 12, lineHeight: 19, textAlign: "center" }}>
              브라우저 미리보기에서는 로그인 버튼이 비활성화됩니다.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
