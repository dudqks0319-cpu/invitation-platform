import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { loadDraft } from "@/lib/drafts";
import {
  listRemoteGuestbook,
  loadRemoteInvitation,
  type RemoteGuestbookEntry,
  updateRemoteGuestbookApproval
} from "@/lib/invitations";
import { useAuth } from "@/hooks/useAuth";

export default function InvitationGuestbookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [entries, setEntries] = useState<RemoteGuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { configured, status, user } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const local = await loadDraft(id);
        if (!mounted) return;
        const resolvedDraft =
          !local && configured && status === "authenticated" && user?.id
            ? await loadRemoteInvitation(id, user.id)
            : local;
        if (!mounted) return;
        setDraft(resolvedDraft);

        if (configured && resolvedDraft?.serverId) {
          const nextEntries = await listRemoteGuestbook(resolvedDraft.serverId);
          if (!mounted) return;
          setEntries(nextEntries);
        }
      } catch (caught) {
        if (!mounted) return;
        setError(caught instanceof Error ? caught.message : "방명록을 불러오지 못했습니다.");
      }

      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [configured, id, status, user?.id]);

  async function refresh() {
    if (!id) return;
    setRefreshing(true);
    setMessage("");
    setError("");

    try {
      const local = await loadDraft(id);
      const resolvedDraft =
        !local && configured && status === "authenticated" && user?.id
          ? await loadRemoteInvitation(id, user.id)
          : local;
      setDraft(resolvedDraft);

      if (configured && resolvedDraft?.serverId) {
        const nextEntries = await listRemoteGuestbook(resolvedDraft.serverId);
        setEntries(nextEntries);
        setMessage("방명록 목록을 새로고침했습니다.");
      } else {
        setMessage("로컬 초안 상태에서는 서버 방명록을 불러올 수 없습니다.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "방명록 목록을 새로고침하지 못했습니다.");
    }
    setRefreshing(false);
  }

  return (
    <Screen subtitle="승인 대기와 공개 중인 메시지를 분리해 관리합니다." title="방명록 관리">
      {loading ? <Loading label="초대장 정보를 불러오는 중..." /> : null}
      {error ? <ErrorView description={error} title="방명록 불러오기 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <Card eyebrow="모더레이션" title={draft?.payload.title || "초대장"}>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          승인 대기/공개 메시지를 이곳에서 검토합니다.
        </Text>
        <View style={{ marginTop: 12 }}>
          <Button accessibilityLabel="방명록 목록 새로고침" onPress={() => void refresh()} variant="outline">
            {refreshing ? "새로고침 중..." : "방명록 새로고침"}
          </Button>
        </View>
      </Card>
      {entries.length === 0 ? (
        <EmptyState body="아직 수신된 방명록이 없습니다." title="새 방명록이 오면 여기서 검토합니다" />
      ) : (
        entries.slice(0, 10).map((entry) => (
          <Card key={entry.id} eyebrow={entry.approved ? "공개" : "대기"} title={entry.nickname}>
            <Text style={{ color: "#6a5645", lineHeight: 22 }}>{entry.message}</Text>
            <View style={{ gap: 8, marginTop: 12 }}>
              <Button
                accessibilityLabel={entry.approved ? "비공개로 전환" : "공개로 승인"}
                onPress={() => {
                  setError("");
                  setMessage("");
                  setPendingId(entry.id);
                  void updateRemoteGuestbookApproval(entry.id, !entry.approved)
                    .then(() => {
                      setEntries((current) =>
                        current.map((item) =>
                          item.id === entry.id
                            ? {
                                ...item,
                                approved: !item.approved
                              }
                            : item
                        )
                      );
                      setMessage(entry.approved ? "방명록을 비공개로 전환했습니다." : "방명록을 공개로 승인했습니다.");
                    })
                    .catch((caught) =>
                      setError(caught instanceof Error ? caught.message : "방명록 상태를 변경하지 못했습니다.")
                    )
                    .finally(() => setPendingId(null));
                }}
                variant="outline"
              >
                {pendingId === entry.id ? "처리 중..." : entry.approved ? "비공개로 전환" : "공개로 승인"}
              </Button>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
