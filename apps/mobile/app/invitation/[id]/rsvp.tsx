import { useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";

export default function InvitationRsvpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen subtitle="참석/불참, 동행 인원, 최근 응답을 운영자 시점에서 봅니다." title="RSVP 관리">
      <Card eyebrow="요약" title={`초대장 ${id ?? "demo"} 응답 현황`}>
        참석/불참 요약 카드와 CSV 다운로드는 이 화면에 연결합니다.
      </Card>
      <EmptyState body="아직 연결된 RSVP 데이터가 없습니다." title="응답이 들어오면 여기에 표시됩니다" />
    </Screen>
  );
}
