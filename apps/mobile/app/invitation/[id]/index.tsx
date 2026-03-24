import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen subtitle="앱 안에서는 공개 페이지 복제가 아니라 운영 대시보드 경험을 제공합니다." title="초대장 운영">
      <Card eyebrow="대상 초대장" title={`초대장 ID: ${id ?? "demo"}`}>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          이 화면에서 수정, 공유, 공개 링크, RSVP, 방명록, 통계를 묶어서 관리합니다.
        </Text>
      </Card>
      <View style={{ gap: 12 }}>
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
