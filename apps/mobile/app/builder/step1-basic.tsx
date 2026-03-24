import { Link } from "expo-router";
import { Text, View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";

export default function BuilderStep1Screen() {
  const { draft, loading, updateTitle } = useInvitationDraft("local-preview-owner");

  return (
    <Screen subtitle="행사 제목, 날짜, 장소를 먼저 정리합니다." title="초대장 만들기">
      <StepIndicator current={1} title="기본 정보" />
      {loading ? <Loading label="로컬 초안을 준비하는 중..." /> : null}
      <Card eyebrow="입력 항목" title="제목 · 날짜 · 장소">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          v1 스캐폴드에서는 필드 배치와 저장 흐름만 먼저 준비합니다.
        </Text>
        <Text style={{ color: "#8d5a2b", marginTop: 8, fontWeight: "700" }}>
          현재 로컬 초안 제목: {draft?.payload.title || "(비어 있음)"}
        </Text>
      </Card>
      <Card eyebrow="로컬 저장" title="초안 상태">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          localId: {draft?.localId ?? "-"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          syncStatus: {draft?.syncStatus ?? "-"}
        </Text>
        <View style={{ marginTop: 12 }}>
          <Button accessibilityLabel="샘플 제목 넣기" onPress={() => updateTitle("우리 결혼합니다")} variant="outline">
            샘플 제목 넣기
          </Button>
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href="/builder/step2-people">
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
