import { useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";

export default function InvitationGuestbookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen subtitle="승인 대기와 공개 중인 메시지를 분리해 관리합니다." title="방명록 관리">
      <Card eyebrow="모더레이션" title={`초대장 ${id ?? "demo"} 방명록`}>
        신고, 승인, 숨기기, 차단 상태 검토를 이 화면에 붙입니다.
      </Card>
      <EmptyState body="아직 연결된 방명록 데이터가 없습니다." title="새 방명록이 오면 여기서 검토합니다" />
    </Screen>
  );
}
