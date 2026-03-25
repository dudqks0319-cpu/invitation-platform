import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/useAuth";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";
import { openInvitationPublicPage, shareInvitationLink } from "@/lib/share";

export default function BuilderPreviewScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { canShare, draft, loading, publicUrl, publishReadiness, saveToCloud } = useInvitationDraft("local-preview-owner", localId);
  const { configMessage, configured, status, user } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<"" | "save" | "publish" | "share">("");
  const names = draft
    ? `${draft.payload.eventData.groom.name || "신랑"} ♡ ${draft.payload.eventData.bride.name || "신부"}`
    : "";
  const shareSlug = draft?.payload.share.slug ?? "";

  async function handleSave(nextStatus: "draft" | "published") {
    if (!configured) {
      setError(configMessage);
      return;
    }

    if (status !== "authenticated" || !user?.id) {
      setError("로그인 후 서버 저장을 진행할 수 있습니다.");
      return;
    }

    if (nextStatus === "published" && !publishReadiness.canPublish) {
      setError(`공개 전 입력이 필요한 항목: ${publishReadiness.missingFields.join(", ")}`);
      setMessage("");
      return;
    }

    setPending(nextStatus === "published" ? "publish" : "save");
    setError("");
    setMessage("");

    try {
      const nextDraft = await saveToCloud(user.id, nextStatus);
      setMessage(
        nextStatus === "published"
          ? `공개 링크를 발행했습니다.\n${nextDraft.payload.share.slug ? `https://invitehub.co.kr/i/${nextDraft.payload.share.slug}` : ""}`
          : "서버에 초안을 저장했습니다."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "서버 저장에 실패했습니다.");
    } finally {
      setPending("");
    }
  }

  async function handleShare() {
    if (!canShare || !draft?.payload.share.slug) {
      setError("먼저 공개 링크를 발행해 주세요.");
      return;
    }

    setPending("share");
    setError("");
    setMessage("");

    try {
      await shareInvitationLink(draft.payload.share.slug, draft.payload.title || "InviteHub 초대장");
      setMessage("공유 시트를 열었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "공유에 실패했습니다.");
    } finally {
      setPending("");
    }
  }

  return (
    <Screen subtitle="실시간 폰 프리뷰를 이 화면의 시그니처로 키웁니다." title="미리보기">
      {loading ? <Loading label="초안을 불러오는 중..." /> : null}
      {error ? <ErrorView description={error} title="작업 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <View
        style={{
          backgroundColor: "#fffdf9",
          borderRadius: 28,
          borderWidth: 1,
          borderColor: "#e6d8c6",
          padding: 22,
          gap: 12,
          shadowColor: "rgba(102, 82, 63, 0.16)",
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 1,
          shadowRadius: 30,
          elevation: 6
        }}
      >
        <Text style={{ color: "#a07a52", fontSize: 12, fontWeight: "700", letterSpacing: 1.4, textAlign: "center" }}>
          WEDDING INVITATION
        </Text>
        <Text style={{ color: "#3a3028", fontSize: 30, fontWeight: "700", lineHeight: 38, textAlign: "center" }}>
          {names}
        </Text>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#9b6832", fontSize: 16, fontWeight: "600" }}>날짜 및 시간</Text>
          <Text style={{ color: "#5b4a3b", fontSize: 18, lineHeight: 26, textAlign: "center" }}>
            {draft?.payload.eventDateTime || "행사 일시를 입력해 주세요."}
          </Text>
        </View>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#9b6832", fontSize: 16, fontWeight: "600" }}>장소</Text>
          <Text style={{ color: "#5b4a3b", fontSize: 18, lineHeight: 26, textAlign: "center" }}>
            {[draft?.payload.venueName, draft?.payload.venueAddress].filter(Boolean).join(" · ") ||
              "예식장 정보를 입력해 주세요."}
          </Text>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#efe2d2",
            marginTop: 8,
            paddingTop: 16
          }}
        >
          <Text style={{ color: "#5b4a3b", fontSize: 16, lineHeight: 28, textAlign: "center" }}>
            {draft?.payload.message || "초대 메시지를 입력하면 이곳에 반영됩니다."}
          </Text>
        </View>
      </View>
      <Card eyebrow="공유 정보" title="계좌 · 위치">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          계좌: {draft?.payload.accounts.primary?.holder || "미입력"} / {draft?.payload.accounts.secondary?.holder || "미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 4 }}>
          지도 링크: {draft?.payload.location.naverMapUrl || "미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 4 }}>
          교통 안내: {draft?.payload.location.transportNote || "미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 4 }}>
          업로드 대기 사진: {draft?.pendingPhotos.length ?? 0}장
        </Text>
      </Card>
      <Card eyebrow="발행 상태" title={draft?.payload.isPublished ? "공개 중" : "비공개 초안"}>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          {draft?.payload.isPublished
            ? "현재 하객에게 전달 가능한 공개 링크가 있습니다."
            : "아직 공개되지 않았습니다. 필수 정보를 채운 뒤 공개 링크를 발행하세요."}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 4 }}>
          공유 URL: {publicUrl || "서버 저장 후 자동 생성"}
        </Text>
        {!publishReadiness.canPublish ? (
          <Text style={{ color: "#8d5a2b", lineHeight: 22, marginTop: 10 }}>
            공개 전 필요 항목: {publishReadiness.missingFields.join(", ")}
          </Text>
        ) : (
          <Text style={{ color: "#5b7d52", lineHeight: 22, marginTop: 10 }}>
            공개 필수 항목이 모두 준비되었습니다.
          </Text>
        )}
      </Card>
      {!configured ? (
        <Card eyebrow="원격 기능 안내" title="현재는 로컬 프리뷰 모드">
          <Text style={{ color: "#8d5a2b", lineHeight: 22 }}>{configMessage}</Text>
        </Card>
      ) : null}
      <View style={{ gap: 12 }}>
        <Link asChild href={{ pathname: "/builder/step5-location", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Button
          accessibilityLabel="서버에 초안 저장"
          onPress={() => void handleSave("draft")}
          variant="outline"
        >
          {pending === "save"
            ? "저장 중..."
            : !configured
              ? "Supabase 설정 필요"
              : status === "authenticated"
                ? "서버에 초안 저장"
                : "로그인 후 서버 저장"}
        </Button>
        <Button
          accessibilityLabel="공개 링크 발행"
          onPress={() => void handleSave("published")}
        >
          {pending === "publish"
            ? "발행 중..."
            : !configured
              ? "Supabase 설정 필요"
            : draft?.payload.isPublished
              ? "공개 상태 다시 저장"
              : "공개 링크 발행"}
        </Button>
        <Button
          accessibilityLabel="공유 시트 열기"
          onPress={canShare ? () => void handleShare() : undefined}
          variant="outline"
        >
          {pending === "share" ? "공유 중..." : canShare ? "공유하기" : "공개 후 공유 가능"}
        </Button>
        <Button
          accessibilityLabel="공개 페이지 열기"
          onPress={
            canShare && publicUrl
              ? () => {
                  setError("");
                  setMessage("");
                  void openInvitationPublicPage(shareSlug)
                    .then(() => setMessage("웹 공개 페이지를 열었습니다."))
                    .catch((caught) =>
                      setError(caught instanceof Error ? caught.message : "웹 공개 페이지를 열지 못했습니다.")
                    );
                }
              : undefined
          }
          variant="outline"
        >
          {canShare && publicUrl ? "웹 공개 페이지 열기" : "공개 후 웹 확인 가능"}
        </Button>
        <Link
          asChild
          href={{
            pathname: "/invitation/[id]/index",
            params: { id: localId ?? "demo" }
          }}
        >
          <Button accessibilityLabel="운영 화면 예시로 이동">운영 화면 보기</Button>
        </Link>
      </View>
    </Screen>
  );
}
