import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { loadDraft } from "@/lib/drafts";
import {
  getRemoteRsvpSummary,
  listRemoteRsvps,
  loadRemoteInvitation,
  type RemoteRsvpEntry,
  type RemoteRsvpSummary
} from "@/lib/invitations";
import { useAuth } from "@/hooks/useAuth";
import { getDraftOwnerId } from "@/lib/auth-access";

export default function InvitationRsvpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [entries, setEntries] = useState<RemoteRsvpEntry[]>([]);
  const [summary, setSummary] = useState<RemoteRsvpSummary>({
    totalResponses: 0,
    attending: 0,
    declined: 0,
    totalGuests: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { configured, status, user } = useAuth();
  const ownerId = getDraftOwnerId(user);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const local = await loadDraft(id, ownerId);
        if (!mounted) return;
        const resolvedDraft =
          !local && configured && status === "authenticated" && user?.id
            ? await loadRemoteInvitation(id, user.id)
            : local;
        if (!mounted) return;
        setDraft(resolvedDraft);

        if (configured && resolvedDraft?.serverId) {
          const [nextEntries, nextSummary] = await Promise.all([
            listRemoteRsvps(resolvedDraft.serverId),
            getRemoteRsvpSummary(resolvedDraft.serverId)
          ]);
          if (!mounted) return;
          setEntries(nextEntries);
          setSummary(nextSummary);
        }
      } catch (caught) {
        if (!mounted) return;
        setError(caught instanceof Error ? caught.message : "참석 응답을 불러오지 못했습니다.");
      }

      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [configured, id, ownerId, status, user?.id]);

  async function refresh() {
    if (!id) return;
    setRefreshing(true);
    setMessage("");
    setError("");

    try {
      const local = await loadDraft(id, ownerId);
      const resolvedDraft =
        !local && configured && status === "authenticated" && user?.id
          ? await loadRemoteInvitation(id, user.id)
          : local;
      setDraft(resolvedDraft);

      if (configured && resolvedDraft?.serverId) {
        const [nextEntries, nextSummary] = await Promise.all([
          listRemoteRsvps(resolvedDraft.serverId),
          getRemoteRsvpSummary(resolvedDraft.serverId)
        ]);
        setEntries(nextEntries);
        setSummary(nextSummary);
        setMessage("참석 응답을 새로고침했습니다.");
      } else {
        setMessage("온라인에 저장된 초대장에서 참석 응답을 확인할 수 있습니다.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "참석 응답을 새로고침하지 못했습니다.");
    }
    setRefreshing(false);
  }

  return (
    <Screen subtitle="참석 여부와 동행 인원, 최근 응답을 확인합니다." title="참석 여부">
      {loading ? <Loading label="초대장 정보를 불러오는 중..." /> : null}
      {error ? <ErrorView description={error} title="참석 응답 불러오기 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <Card eyebrow="대상 초대장" title={draft?.payload.title || "초대장"}>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>전체 응답: {summary.totalResponses}</Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>참석: {summary.attending}</Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>불참: {summary.declined}</Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>예상 인원: {summary.totalGuests}</Text>
        <View style={{ marginTop: 12 }}>
          <Button accessibilityLabel="참석 응답 새로고침" onPress={() => void refresh()} variant="outline">
            {refreshing ? "새로고침 중..." : "참석 응답 새로고침"}
          </Button>
        </View>
      </Card>
      {entries.length === 0 ? (
        <EmptyState body="아직 받은 참석 응답이 없습니다." title="응답이 들어오면 여기에 표시됩니다" />
      ) : (
        entries.slice(0, 10).map((entry) => (
          <Card key={entry.id} eyebrow={entry.attending ? "참석" : "불참"} title={entry.guestName}>
            <Text style={{ color: "#6a5645", lineHeight: 22 }}>
              동행 {entry.guests}명 · {entry.guestPhone || "연락처 없음"}
            </Text>
            {entry.memo ? <Text style={{ color: "#6a5645", lineHeight: 22 }}>메모: {entry.memo}</Text> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}
