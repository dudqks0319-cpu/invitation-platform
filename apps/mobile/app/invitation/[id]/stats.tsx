import { useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function InvitationStatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen subtitle="공유, 방문, RSVP 총계를 운영 관점에서 확인합니다." title="통계">
      <Card eyebrow="방문 흐름" title={`초대장 ${id ?? "demo"} 성과`}>
        공개 링크 방문 수, 공유 클릭, RSVP 전환율을 이 화면에서 보여주게 됩니다.
      </Card>
    </Screen>
  );
}
