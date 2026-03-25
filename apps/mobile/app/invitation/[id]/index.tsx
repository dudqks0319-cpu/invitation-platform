import { useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Pill } from "@/components/ui/Pill";
import { Screen } from "@/components/ui/Screen";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { deleteDraft, loadDraft, saveDraft } from "@/lib/drafts";
import { deleteRemoteInvitation, loadRemoteInvitation, saveDraftToSupabase } from "@/lib/invitations";
import { getPublicInvitationUrl, openInvitationPublicPage, shareInvitationLink } from "@/lib/share";
import { useAuth } from "@/hooks/useAuth";

export default function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { configMessage, configured, status, user } = useAuth();
  const publicUrl = draft?.payload.share.slug ? getPublicInvitationUrl(draft.payload.share.slug) : "";
  const shareSlug = draft?.payload.share.slug ?? "";

  useEffect(() => {
    let mounted = true;

    async function load(showSpinner = true) {
      if (!id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      if (configured && status === "authenticated" && user?.id) {
        const remote = await loadRemoteInvitation(id, user.id);
        if (!mounted) return;
        if (remote) {
          setDraft(remote);
          setRefreshing(false);
          setLoading(false);
          return;
        }
      }

      const local = await loadDraft(id);
      if (!mounted) return;
      setDraft(local);
      setRefreshing(false);
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [configured, id, status, user?.id]);

  const title = draft?.payload.title || "제목 없는 초대장";
  const names = `${draft?.payload.eventData.groom.name || "신랑"} ♡ ${draft?.payload.eventData.bride.name || "신부"}`;

  return (
    <Screen subtitle="앱 안에서는 공개 페이지 복제가 아니라 운영 대시보드 경험을 제공합니다." title="초대장 운영">
      {loading ? <Loading label="초대장 데이터를 불러오는 중..." /> : null}
      {error ? <ErrorView description={error} title="작업 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <Card eyebrow={draft?.syncStatus || "draft"} title={title}>
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>{names}</Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 6 }}>
          {draft?.payload.eventDateTime || "행사 일시 미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 6 }}>
          {[draft?.payload.venueName, draft?.payload.venueAddress].filter(Boolean).join(" · ") || "장소 미입력"}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <Pill active={Boolean(draft?.serverId)} label={draft?.serverId ? "원격 저장됨" : "로컬 초안"} />
          <Pill active={Boolean(draft?.isDirty)} label={draft?.isDirty ? "미저장 변경" : "동기화 안정"} />
          <Pill active={Boolean(draft?.payload.isPublished)} label={draft?.payload.isPublished ? "공개 중" : "비공개"} />
        </View>
      </Card>
      <Card eyebrow="공유 준비" title="공개 링크 · 계좌 · 지도">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          slug: {draft?.payload.share.slug || "(미정)"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          공개 URL: {publicUrl || "발행 후 자동 생성"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          카카오페이: {draft?.payload.accounts.kakaoPayLink || "미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          지도: {draft?.payload.location.naverMapUrl || "미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          업로드 대기 사진: {draft?.pendingPhotos.length ?? 0}장
        </Text>
        {!configured ? (
          <Text style={{ color: "#8d5a2b", lineHeight: 22 }}>
            원격 기능 안내: {configMessage}
          </Text>
        ) : null}
      </Card>
      <View style={{ gap: 12 }}>
        <Button
          accessibilityLabel="운영 화면 새로고침"
          onPress={() => {
            setMessage("");
            setError("");
            setRefreshing(true);
            void (async () => {
              try {
                if (configured && status === "authenticated" && user?.id && id) {
                  const remote = await loadRemoteInvitation(id, user.id);
                  if (remote) {
                    setDraft(remote);
                    setMessage("운영 데이터를 새로고침했습니다.");
                    return;
                  }
                }

                if (id) {
                  const local = await loadDraft(id);
                  setDraft(local);
                  setMessage("로컬 초안을 다시 불러왔습니다.");
                }
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "새로고침에 실패했습니다.");
              } finally {
                setRefreshing(false);
              }
            })();
          }}
          variant="outline"
        >
          {refreshing ? "새로고침 중..." : "운영 데이터 새로고침"}
        </Button>
        <Button
          accessibilityLabel="공개 링크 공유"
          onPress={() => {
            if (!draft?.payload.share.slug) {
              setError("공개 링크 slug가 없어 공유할 수 없습니다.");
              return;
            }
            setError("");
            setMessage("");
            void shareInvitationLink(draft.payload.share.slug, draft.payload.title || "InviteHub 초대장")
              .then(() => setMessage("공유 시트를 열었습니다."))
              .catch((caught) => setError(caught instanceof Error ? caught.message : "공유에 실패했습니다."));
          }}
        >
          공개 링크 공유
        </Button>
        <Button
          accessibilityLabel="웹 공개 페이지 열기"
          onPress={
            publicUrl
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
          {publicUrl ? "웹 공개 페이지 열기" : "발행 후 웹 확인 가능"}
        </Button>
        <Button
          accessibilityLabel="운영 화면에서 서버 저장"
          onPress={
            configured && status === "authenticated" && user?.id && draft
              ? () => {
                  setError("");
                  setMessage("");
                  void saveDraftToSupabase(draft, user.id, draft.payload.isPublished ? "published" : "draft")
                    .then(async (result) => {
                      const nextDraft: MobileInvitationDraft = {
                        ...draft,
                        serverId: result.serverId,
                        payload: result.payload,
                        pendingPhotos: result.pendingPhotos,
                        syncStatus: "synced",
                        isDirty: false,
                        localUpdatedAt: new Date().toISOString()
                      };
                      await saveDraft(nextDraft);
                      setDraft(nextDraft);
                      setMessage(result.payload.isPublished ? "공개 상태를 서버에 동기화했습니다." : "운영 화면에서 서버 초안을 저장했습니다.");
                    })
                    .catch((caught) => {
                      setError(caught instanceof Error ? caught.message : "서버 저장에 실패했습니다.");
                    });
                }
              : undefined
          }
          variant="outline"
        >
          {!configured
            ? "Supabase 설정 필요"
            : configured && status === "authenticated"
              ? "운영 화면에서 서버 저장"
              : "로그인 후 서버 저장"}
        </Button>
        <Button
          accessibilityLabel="초대장 삭제"
          onPress={() => {
            setError("");
            setMessage("");
            if (!draft) return;

            void deleteDraft(draft.localId)
              .then(async () => {
                if (configured && status === "authenticated" && user?.id && draft.serverId) {
                  await deleteRemoteInvitation(draft.serverId, user.id);
                }
                setMessage("초대장을 삭제했습니다.");
              })
              .catch((caught) => setError(caught instanceof Error ? caught.message : "삭제에 실패했습니다."));
          }}
          variant="outline"
        >
          초대장 삭제
        </Button>
        <Link asChild href={`/invitation/${id ?? "demo"}/rsvp`}>
          <Button accessibilityLabel="RSVP 관리 화면으로 이동">RSVP 관리</Button>
        </Link>
        <Link asChild href={`/invitation/${id ?? "demo"}/guestbook`}>
          <Button accessibilityLabel="방명록 관리 화면으로 이동" variant="outline">방명록 관리</Button>
        </Link>
        <Link asChild href={`/invitation/${id ?? "demo"}/stats`}>
          <Button accessibilityLabel="통계 화면으로 이동" variant="outline">통계</Button>
        </Link>
      </View>
    </Screen>
  );
}
