import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
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
        setMessage("온라인에 저장된 초대장에서 방명록을 확인할 수 있습니다.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "방명록 목록을 새로고침하지 못했습니다.");
    }
    setRefreshing(false);
  }

  return (
    <Screen subtitle="축하 메시지를 따뜻한 피드처럼 검토하고 공개 여부를 전환합니다." title="방명록">
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
          <View
            key={entry.id}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 18,
              shadowColor: theme.shadow.card.shadowColor,
              shadowOffset: { width: 0, height: 14 },
              shadowOpacity: 0.9,
              shadowRadius: 24,
              elevation: 5,
              gap: 12
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  backgroundColor: entry.approved ? "#ead8d8" : "#eceae5",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ color: theme.colors.muted, fontSize: 16, fontWeight: "700" }}>
                  {entry.nickname.slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700" }}>{entry.nickname}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{entry.approved ? "공개" : "승인 대기"}</Text>
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 18, lineHeight: 27 }}>{entry.message}</Text>
                <Text style={{ color: "#9d9187", fontSize: 13 }}>
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString("ko-KR") : "방금 전"}
                </Text>
              </View>
            </View>
            <View style={{ gap: 8 }}>
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
          </View>
        ))
      )}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 18,
          bottom: 22,
          width: 64,
          height: 64,
          borderRadius: 24,
          backgroundColor: "#f2b7bc",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.shadow.card.shadowColor,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.9,
          shadowRadius: 22,
          elevation: 6
        }}
      >
        <Ionicons color="#fff" name="create-outline" size={26} />
      </View>
    </Screen>
  );
}
