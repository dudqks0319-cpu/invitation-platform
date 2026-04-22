import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Pill } from "@/components/ui/Pill";
import { Screen } from "@/components/ui/Screen";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { loadDraft } from "@/lib/drafts";
import {
  getRemoteRsvpSummary,
  getRemoteVisitCount,
  loadRemoteInvitation,
  type RemoteRsvpSummary
} from "@/lib/invitations";
import { useAuth } from "@/hooks/useAuth";

export default function InvitationStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [visitCount, setVisitCount] = useState(0);
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
          const [nextVisits, nextSummary] = await Promise.all([
            getRemoteVisitCount(resolvedDraft.serverId),
            getRemoteRsvpSummary(resolvedDraft.serverId)
          ]);
          if (!mounted) return;
          setVisitCount(nextVisits);
          setSummary(nextSummary);
        }
      } catch (caught) {
        if (!mounted) return;
        setError(caught instanceof Error ? caught.message : "통계를 불러오지 못했습니다.");
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
        const [nextVisits, nextSummary] = await Promise.all([
          getRemoteVisitCount(resolvedDraft.serverId),
          getRemoteRsvpSummary(resolvedDraft.serverId)
        ]);
        setVisitCount(nextVisits);
        setSummary(nextSummary);
        setMessage("통계를 새로고침했습니다.");
      } else {
        setMessage("로컬 초안 상태에서는 서버 통계를 불러올 수 없습니다.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "통계를 새로고침하지 못했습니다.");
    }
    setRefreshing(false);
  }

  return (
    <Screen subtitle="공유, 방문, RSVP 총계를 운영 관점에서 확인합니다." title="통계">
      {loading ? <Loading label="통계 화면을 준비하는 중..." /> : null}
      {error ? <ErrorView description={error} title="통계 불러오기 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <Card eyebrow="초안 기준" title={draft?.payload.title || "초대장"}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <Pill active={Boolean(draft?.serverId)} label={draft?.serverId ? "서버 저장됨" : "앱 저장"} />
          <Pill active={Boolean(draft?.isDirty)} label={draft?.isDirty ? "동기화 필요" : "동기화 안정"} />
        </View>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          현재 갤러리 장수: {draft?.payload.photos.gallery.length ?? 0}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          업로드 대기 사진: {draft?.pendingPhotos.length ?? 0}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          저장 상태: {draft?.syncStatus ?? "-"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          방문 수: {visitCount}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          RSVP 총계: {summary.totalResponses} / 참석 {summary.attending}
        </Text>
        <View style={{ marginTop: 12 }}>
          <Button accessibilityLabel="통계 새로고침" onPress={() => void refresh()} variant="outline">
            {refreshing ? "새로고침 중..." : "통계 새로고침"}
          </Button>
        </View>
      </Card>
    </Screen>
  );
}
