import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";

export default function MyInvitationsScreen() {
  return (
    <Screen
      subtitle="저장한 초대장과 RSVP 현황을 한곳에서 관리합니다."
      title="내 초대장"
    >
      <Card eyebrow="MVP 상태" title="운영 화면 구조를 먼저 준비했습니다">
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>
          첫 번째 결혼식 초대장을 만들면 여기서 수정, 공유, RSVP 관리로 이어집니다.
        </Text>
      </Card>

      <EmptyState
        body="현재 스캐폴드는 목록과 관리 화면 구조만 준비한 상태입니다."
        title="초대장을 곧 여기서 관리합니다"
      />

      <View style={{ marginTop: 12 }}>
        <Link asChild href="/invitation/demo/index">
          <Pressable
            accessibilityLabel="운영 화면 예시로 이동"
            style={{
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#d2bba6",
              backgroundColor: "#fffaf5"
            }}
          >
            <Text style={{ color: "#8d5a2b", fontWeight: "700" }}>운영 화면 미리 보기</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
