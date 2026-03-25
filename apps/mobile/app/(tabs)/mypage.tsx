import { useState } from "react";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import * as ExpoLinking from "expo-linking";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/useAuth";

export default function MyPageScreen() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<"" | "support" | "faq" | "privacy" | "terms" | "delete" | "logout">("");
  const { configMessage, configMissingKeys, configured, signOut, status, user } = useAuth();
  const isAuthenticated = status === "authenticated";

  async function openUrl(
    action: "support" | "faq" | "privacy" | "terms" | "delete",
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

  return (
    <Screen subtitle="계정, 정책, 고객 지원 흐름을 이 탭에 배치합니다." title="마이페이지">
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      {error ? (
        <Card eyebrow="상태" title="작업 실패">
          <Text style={{ color: "#8d5a2b", lineHeight: 22 }}>{error}</Text>
        </Card>
      ) : null}
      <Card eyebrow="계정" title={status === "authenticated" ? "로그인됨" : "로그인 전"}>
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>
          {isAuthenticated ? user?.email ?? "이메일 정보 없음" : "아직 연결된 계정이 없습니다."}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 8 }}>
          Supabase 설정: {configured ? "활성" : "비활성"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 8 }}>
          계정 상태: {isAuthenticated ? "원격 저장 · RSVP · 방명록 관리 가능" : "로컬 초안만 관리"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 8 }}>
          {isAuthenticated
            ? "지금은 서버 저장본을 불러오고 공개 링크를 발행할 수 있습니다."
            : "로그인하면 기기 밖에서도 초대장을 이어서 수정할 수 있습니다."}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 8 }}>{configMessage}</Text>
        {!configured && configMissingKeys.length > 0 ? (
          <Text style={{ color: "#8d5a2b", lineHeight: 22, marginTop: 8 }}>
            누락된 환경변수: {configMissingKeys.join(", ")}
          </Text>
        ) : null}
      </Card>

      <Card eyebrow="요금제" title="v1.0은 무료 전용">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          유료 업셀 없이 결혼식 초대장 핵심 기능을 먼저 완성합니다.
        </Text>
      </Card>

      <Card eyebrow="지원" title="약관과 문의">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          FAQ, 이용약관, 개인정보처리방침, 문의하기, 계정 삭제 요청을 여기서 연결합니다.
        </Text>
      </Card>

      <View style={{ gap: 12 }}>
        {!isAuthenticated ? (
          <Link asChild href="/login">
            <Button accessibilityLabel="로그인 화면으로 이동">로그인 화면 열기</Button>
          </Link>
        ) : null}
        <Button
          accessibilityLabel="문의 메일 열기"
          onPress={() => void openUrl("support", "mailto:support@invitehub.co.kr", "문의 메일 앱을 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "support" ? "문의 열기 중..." : "문의하기"}
        </Button>
        <Button
          accessibilityLabel="FAQ 열기"
          onPress={() => void openUrl("faq", "https://invitehub.co.kr/faq", "FAQ 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "faq" ? "FAQ 여는 중..." : "FAQ"}
        </Button>
        <Button
          accessibilityLabel="개인정보처리방침 열기"
          onPress={() => void openUrl("privacy", "https://invitehub.co.kr/privacy", "개인정보처리방침 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "privacy" ? "페이지 여는 중..." : "개인정보처리방침"}
        </Button>
        <Button
          accessibilityLabel="이용약관 열기"
          onPress={() => void openUrl("terms", "https://invitehub.co.kr/terms", "이용약관 페이지를 열었습니다.")}
          variant="outline"
        >
          {pendingAction === "terms" ? "페이지 여는 중..." : "이용약관"}
        </Button>
        <Button
          accessibilityLabel="계정 삭제 요청 열기"
          onPress={() =>
            void openUrl("delete", "https://invitehub.co.kr/account/delete-request", "계정 삭제 요청 페이지를 열었습니다.")
          }
          variant="outline"
        >
          {pendingAction === "delete" ? "요청 페이지 여는 중..." : "계정 삭제 요청"}
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
