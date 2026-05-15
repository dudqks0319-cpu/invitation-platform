import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Pill } from "@/components/ui/Pill";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { deleteDraft, listDrafts } from "@/lib/drafts";
import { listRemoteInvitations } from "@/lib/invitations";
import { openInvitationPublicPage, openWebBuilder, shareInvitationLink } from "@/lib/share";
import { useAuth } from "@/hooks/useAuth";

export default function MyInvitationsScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<MobileInvitationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { configMessage, configured, status, user } = useAuth();

  const load = useCallback(async () => {
    setError("");
    setRefreshing(true);

    try {
      const localItems = await listDrafts();

      if (configured && status === "authenticated" && user?.id) {
        const remoteItems = await listRemoteInvitations(user.id);
        const localOnly = localItems.filter(
          (localItem) => !remoteItems.some((remoteItem) => remoteItem.serverId === localItem.serverId && localItem.serverId)
        );

        setDrafts(
          [...remoteItems, ...localOnly].sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt))
        );
        return;
      }

      setDrafts(localItems);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "초대장 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [configured, status, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function getStatusSummary(draft: MobileInvitationDraft) {
    if (draft.serverId && draft.isDirty) {
      return "온라인 저장본 있음 · 수정 내용 저장 대기";
    }

    if (draft.serverId) {
      return "온라인 저장 완료";
    }

    return "로컬 초안만 존재";
  }

  function isLocalOnlyDraft(draft: MobileInvitationDraft) {
    return !draft.serverId;
  }

  async function handleDeleteLocalDraft(draft: MobileInvitationDraft) {
    setPendingDeleteId(draft.localId);
    setMessage("");

    try {
      await deleteDraft(draft.localId);
      setDrafts((current) => current.filter((item) => item.localId !== draft.localId));
      setMessage("로컬 초안을 삭제했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로컬 초안을 삭제하지 못했습니다.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <Screen subtitle="저장한 초대장과 RSVP 현황을 한곳에서 관리합니다." title="내 초대장">
      <View style={{ gap: 12 }}>
        {message ? (
          <Card eyebrow="상태" title="작업 완료">
            <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{message}</Text>
          </Card>
        ) : null}
        {error ? <ErrorView description={error} title="목록 불러오기 실패" /> : null}
        <Card eyebrow="목록 상태" title="초안 동기화">
          <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>
            이 기기에 저장된 초안과 온라인 저장본을 함께 보여줍니다. 기기 전용 초안은 여기서 바로 지울 수 있습니다.
          </Text>
          {!configured ? (
            <Text style={{ color: theme.colors.primaryDark, lineHeight: 22, marginTop: 8 }}>
              온라인 기능 안내: {configMessage}
            </Text>
          ) : null}
          <View style={{ marginTop: 12 }}>
            <Button accessibilityLabel="초대장 목록 새로고침" onPress={() => void load()} variant="outline">
              {refreshing ? "새로고침 중..." : "목록 새로고침"}
            </Button>
          </View>
        </Card>
      </View>

      {loading ? <Loading label="저장된 초안을 불러오는 중..." variant="cards" /> : null}
      {!loading && drafts.length === 0 ? (
        <EmptyState
          actionLabel="첫 초대장 만들기"
          body="아직 저장된 초대장이 없습니다. 빌더에서 첫 초대장을 만들어 주세요."
          onAction={() => router.push("/builder/step1-basic")}
          title="저장된 초대장이 없습니다"
        />
      ) : null}
      {drafts.map((draft) => (
        <Card
          key={draft.localId}
          eyebrow={draft.syncStatus}
          title={draft.payload.title || "제목 없는 초대장"}
        >
          <Text style={{ color: theme.colors.text, lineHeight: 22 }}>
            {draft.payload.eventData.groom.name || "신랑"} ♡ {draft.payload.eventData.bride.name || "신부"}
          </Text>
          <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 6 }}>
            {[draft.payload.venueName, draft.payload.venueAddress].filter(Boolean).join(" · ") || "장소 미입력"}
          </Text>
          <Text style={{ color: theme.colors.muted, lineHeight: 22, marginTop: 6 }}>{getStatusSummary(draft)}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <Pill active={Boolean(draft.serverId)} label={draft.serverId ? "온라인 저장됨" : "기기 전용"} />
            <Pill active={draft.isDirty} label={draft.isDirty ? "미저장 변경" : "동기화 안정"} />
            <Pill active={draft.pendingPhotos.length > 0} label={`업로드 대기 ${draft.pendingPhotos.length}`} />
            <Pill active={Boolean(draft.payload.isPublished)} label={draft.payload.isPublished ? "공개 중" : "비공개"} />
          </View>
          <View style={{ marginTop: 12, gap: 10 }}>
            <Link asChild href={{ pathname: "/invitation/[id]", params: { id: draft.serverId ?? draft.localId } }}>
              <Button accessibilityLabel="초대장 운영 화면으로 이동">
                운영 화면 열기
              </Button>
            </Link>
            {draft.payload.isPublished && draft.payload.share.slug ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    accessibilityLabel="공개 링크 공유"
                    onPress={() => {
                      setMessage("");
                      setError("");
                      void shareInvitationLink(draft.payload.share.slug, draft.payload.title || "InviteHub 초대장")
                        .then(() => setMessage("공유 시트를 열었습니다."))
                        .catch((caught) =>
                          setError(caught instanceof Error ? caught.message : "공유 시트를 열지 못했습니다.")
                        );
                    }}
                    variant="outline"
                  >
                    공유하기
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    accessibilityLabel="웹 공개 페이지 열기"
                    onPress={() => {
                      setMessage("");
                      setError("");
                      void openInvitationPublicPage(draft.payload.share.slug)
                        .then(() => setMessage("웹 공개 페이지를 열었습니다."))
                        .catch((caught) =>
                          setError(caught instanceof Error ? caught.message : "웹 공개 페이지를 열지 못했습니다.")
                        );
                    }}
                    variant="outline"
                  >
                    웹에서 확인
                  </Button>
                </View>
              </View>
            ) : draft.serverId ? (
              <Button
                accessibilityLabel="웹 빌더 열기"
                onPress={() => {
                  setMessage("");
                  setError("");
                  void openWebBuilder({ invitationId: draft.serverId })
                    .then(() => setMessage("웹 빌더를 열었습니다."))
                    .catch((caught) =>
                      setError(caught instanceof Error ? caught.message : "웹 빌더를 열지 못했습니다.")
                    );
                }}
                variant="outline"
              >
                웹에서 이어서 편집
              </Button>
            ) : null}
            {isLocalOnlyDraft(draft) ? (
              <Pressable
                accessibilityLabel="로컬 초안 삭제"
                onPress={() => void handleDeleteLocalDraft(draft)}
                style={{ alignItems: "center", paddingVertical: 6 }}
              >
                <Text style={{ color: theme.colors.primaryDark, fontSize: 13, fontWeight: "700" }}>
                  {pendingDeleteId === draft.localId ? "삭제 중..." : "로컬 초안 삭제"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
