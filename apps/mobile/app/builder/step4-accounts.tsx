import { Link } from "expo-router";
import { View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function BuilderStep4AccountsScreen() {
  return (
    <Screen subtitle="축의금 계좌와 카카오페이 링크를 준비합니다." title="초대장 만들기">
      <StepIndicator current={4} title="계좌 정보" />
      <Card eyebrow="공유 준비" title="신랑측 · 신부측 계좌">
        앱 안에서 복사하기 쉽게 보여주고, 공개 초대장 웹에서는 링크 중심으로 노출합니다.
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href="/builder/step3-photos">
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href="/builder/step5-location">
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
