import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { configured, status, user } = useAuth();
  const userId = user?.id ?? "";

  const load = useCallback(async () => {
    setError("");

    try {
      const localItems = await listDrafts();

      if (configured && status === "authenticated" && userId) {
        const remoteItems = await listRemoteInvitations(userId);
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
    }
  }, [configured, status, userId]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);

    return () => clearTimeout(timer);
  }, [load]);

  function getStatusSummary(draft: MobileInvitationDraft) {
    if (draft.serverId && draft.isDirty) {
      return "최근 수정 내용 저장 대기";
    }

    if (draft.serverId) {
      return "안전하게 저장됨";
    }

    return "이 기기에 저장됨";
  }

  function isLocalOnlyDraft(draft: MobileInvitationDraft) {
    return !draft.serverId;
  }

  async function handleDeleteLocalDraft(draft: MobileInvitationDraft) {
    setPendingDeleteId(draft.localId);
    setMessage("");
    setError("");

    try {
      await deleteDraft(draft.localId);
      setDrafts((current) => current.filter((item) => item.localId !== draft.localId));
      setMessage("이 기기에 저장된 초대장을 삭제했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "저장된 초대장을 삭제하지 못했습니다.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  function confirmDeleteLocalDraft(draft: MobileInvitationDraft) {
    if (pendingDeleteId) {
      return;
    }

    Alert.alert(
      "초대장 삭제",
      "이 기기에만 저장된 초대장을 삭제합니다. 삭제한 내용은 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => void handleDeleteLocalDraft(draft)
        }
      ]
    );
  }

  return (
    <Screen subtitle="저장한 초대장과 참석 여부를 한곳에서 관리합니다." title="내 초대장">
      <View style={{ gap: 12 }}>
        {message ? (
          <Card eyebrow="상태" title="작업 완료">
            <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{message}</Text>
          </Card>
        ) : null}
        {error ? <ErrorView description={error} title="목록 불러오기 실패" /> : null}
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
          eyebrow={draft.payload.isPublished ? "공개 초대장" : "작성 중"}
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
            <Pill active={Boolean(draft.serverId)} label={draft.serverId ? "저장 완료" : "이 기기 저장"} />
            {draft.isDirty ? <Pill active label="수정 내용 저장 중" /> : null}
            {draft.pendingPhotos.length > 0 ? <Pill active label={`사진 저장 중 ${draft.pendingPhotos.length}`} /> : null}
            <Pill active={Boolean(draft.payload.isPublished)} label={draft.payload.isPublished ? "공개 중" : "비공개"} />
          </View>
          <View style={{ marginTop: 12, gap: 10 }}>
            <Link asChild href={{ pathname: "/invitation/[id]", params: { id: draft.serverId ?? draft.localId } }}>
              <Button accessibilityLabel="초대장 관리 화면으로 이동">
                초대장 관리하기
              </Button>
            </Link>
            {draft.payload.isPublished && draft.payload.share.slug ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    accessibilityLabel="카카오톡으로 초대장 보내기"
                    onPress={() => {
                      setMessage("");
                      setError("");
                      void shareInvitationLink(draft.payload.share.slug, draft.payload.title || "오삼오삼 초대장")
                        .then(() => setMessage("보낼 앱 선택 화면을 열었습니다."))
                        .catch((caught) =>
                          setError(caught instanceof Error ? caught.message : "공유 시트를 열지 못했습니다.")
                        );
                    }}
                    variant="outline"
                  >
                    카카오톡으로 보내기
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
                accessibilityLabel="이 기기에 저장된 초대장 삭제"
                onPress={() => confirmDeleteLocalDraft(draft)}
                style={{ alignItems: "center", paddingVertical: 6 }}
              >
                <Text style={{ color: theme.colors.primaryDark, fontSize: 13, fontWeight: "700" }}>
                  {pendingDeleteId === draft.localId ? "삭제 중..." : "이 기기에서 삭제"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
