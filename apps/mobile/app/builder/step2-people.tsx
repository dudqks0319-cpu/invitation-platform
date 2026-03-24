import { Link } from "expo-router";
import { View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function BuilderStep2PeopleScreen() {
  return (
    <Screen subtitle="신랑, 신부, 양가 정보 입력 단계입니다." title="초대장 만들기">
      <StepIndicator current={2} title="인물 정보" />
      <Card eyebrow="결혼식 전용" title="신랑 · 신부 · 부모님">
        v1은 결혼식 흐름에 집중하고, 다른 이벤트 유형은 shared 모델만 먼저 준비합니다.
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href="/builder/step1-basic">
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href="/builder/step3-photos">
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
