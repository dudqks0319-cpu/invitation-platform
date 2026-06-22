import { useState } from "react";
import { Link } from "expo-router";
import { Alert, Text, View } from "react-native";
import * as ExpoLinking from "expo-linking";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { hasFullAccount } from "@/lib/auth-access";
import { useAuth } from "@/hooks/useAuth";
import { getFaqUrl, getInviteHubBaseUrl, getPrivacyUrl, getSupportUrl, getTermsUrl } from "@/lib/web-links";

export default function MyPageScreen() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<"" | "support" | "faq" | "privacy" | "terms" | "delete" | "logout">("");
  const { configMessage, configMissingKeys, configured, session, signOut, status, user } = useAuth();
  const isAuthenticated = hasFullAccount(status === "authenticated" ? user : null);
  const isGuestMode = status === "authenticated" && !isAuthenticated;

  async function openUrl(
    action: "support" | "faq" | "privacy" | "terms",
    url: string,
    doneMessage: string
  ) {
    setError("");
    setMessage("");
    setPendingAction(action);

    try {
      await ExpoLinking.openURL(url);
      setMessage(doneMessage);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "외부 링크를 열지 못했습니다.");
    } finally {
      setPendingAction("");
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "계정 삭제",
      "계정을 삭제하면 초대장과 관련 기록이 함께 제거되며 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            if (!session?.access_token) {
              setError("로그인 세션을 확인할 수 없습니다.");
              return;
            }

            setError("");
            setMessage("");
            setPendingAction("delete");

            void fetch(`${getInviteHubBaseUrl()}/api/account/delete`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            })
              .then(async (response) => {
                const result = (await response.json().catch(() => ({}))) as { message?: string; success?: boolean };
                if (!response.ok || !result.success) {
                  throw new Error(result.message || "계정 삭제에 실패했습니다.");
                }

                return signOut();
              })
              .then(() => setMessage("계정을 삭제했습니다."))
              .catch((caught) => setError(caught instanceof Error ? caught.message : "계정 삭제에 실패했습니다."))
              .finally(() => setPendingAction(""));
          }
        }
      ]
    );
  }

  return (
    <Screen subtitle="계정, 정책, 고객 지원 흐름을 이 탭에 배치합니다." title="마이페이지">
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      {error ? (
        <Card eyebrow="상태" title="작업 실패">
          <Text style={{ color: theme.colors.primaryDark, lineHeight: 22 }}>{error}</Text>
        </Card>
      ) : null}
      <Card eyebrow="계정" title={isAuthenticated ? "로그인됨" : isGuestMode ? "게스트 모드" : "로그인 전"}>
        <Text style={{ color: theme.colors.text, lineHeight: 22 }}>
          {isAuthenticated ? user?.email ?? "이메일 정보 없음" : isGuestMode ? "무료 기능을 게스트 모드로 사용 중입니다." : "아직 연결된 계정이 없습니다."}
        </Text>
        <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 8 }}>
          Supabase 설정: {configured ? "활성" : "비활성"}
        </Text>
        <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 8 }}>
          계정 상태: {isAuthenticated ? "원격 저장 · RSVP · 방명록 관리 가능" : isGuestMode ? "무료 초대장 저장 · 발행 가능" : "로컬 초안만 관리"}
        </Text>
        <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 8 }}>
          {isAuthenticated
            ? "지금은 서버 저장본을 불러오고 공개 링크를 발행할 수 있습니다."
            : isGuestMode
              ? "계정 삭제와 원격 저장 관리는 이메일 또는 소셜 로그인 후 사용할 수 있습니다."
              : "로그인하면 원격 저장과 계정 관리를 사용할 수 있습니다."}
        </Text>
        <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 8 }}>{configMessage}</Text>
        {!configured && configMissingKeys.length > 0 ? (
          <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginTop: 8 }}>
            누락된 환경변수: {configMissingKeys.join(", ")}
          </Text>
        ) : null}
      </Card>

      <Card eyebrow="요금제" title="현재 제공 기능 무료">
        <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>
          템플릿 선택, 사진 업로드, 초안 작성, 미리보기, 공개 링크 발행을 무료로 제공합니다.
        </Text>
      </Card>

      <Card eyebrow="지원" title="약관과 문의">
        <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>
          FAQ, 이용약관, 개인정보처리방침, 문의하기, 계정 삭제 요청을 여기서 연결합니다.
        </Text>
      </Card>

      <View style={{ gap: 16 }}>
        {!isAuthenticated ? (
          <Link asChild href="/login">
            <Button accessibilityLabel="로그인 화면으로 이동">로그인 화면 열기</Button>
          </Link>
        ) : null}
        <Button
          accessibilityLabel="지원 페이지 열기"
          onPress={() => void openUrl("support", getSupportUrl(), "지원 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "support" ? "지원 여는 중..." : "지원"}
        </Button>
        <Button
          accessibilityLabel="FAQ 열기"
          onPress={() => void openUrl("faq", getFaqUrl(), "FAQ 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "faq" ? "FAQ 여는 중..." : "FAQ"}
        </Button>
        <Button
          accessibilityLabel="개인정보처리방침 열기"
          onPress={() => void openUrl("privacy", getPrivacyUrl(), "개인정보처리방침 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "privacy" ? "페이지 여는 중..." : "개인정보처리방침"}
        </Button>
        <Button
          accessibilityLabel="이용약관 열기"
          onPress={() => void openUrl("terms", getTermsUrl(), "이용약관 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "terms" ? "페이지 여는 중..." : "이용약관"}
        </Button>
        <Button
          accessibilityLabel="계정 삭제"
          onPress={isAuthenticated ? confirmDeleteAccount : undefined}
          variant="outline"
        >
          {pendingAction === "delete" ? "계정 삭제 중..." : isAuthenticated ? "계정 삭제" : "로그인 후 사용 가능"}
        </Button>
        {isAuthenticated ? (
          <Button
            accessibilityLabel="로그아웃"
            onPress={() => {
              setError("");
              setMessage("");
              setPendingAction("logout");
              void signOut()
                .then(() => setMessage("로그아웃했습니다."))
                .catch((caught) => setError(caught instanceof Error ? caught.message : "로그아웃에 실패했습니다."))
                .finally(() => setPendingAction(""));
            }}
            variant="outline"
          >
            {pendingAction === "logout" ? "로그아웃 중..." : "로그아웃"}
          </Button>
        ) : null}
      </View>
    </Screen>
  );
}
