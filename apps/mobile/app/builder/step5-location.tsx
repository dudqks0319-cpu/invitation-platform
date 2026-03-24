import { Link } from "expo-router";
import { View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function BuilderStep5LocationScreen() {
  return (
    <Screen subtitle="지도 링크와 교통 안내를 마지막으로 점검합니다." title="초대장 만들기">
      <StepIndicator current={5} title="오시는 길" />
      <Card eyebrow="공개 페이지" title="네이버 지도와 교통 안내">
        공개 초대장은 웹에서 열리고, 이 단계에서 공유용 위치 정보가 완성됩니다.
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href="/builder/step4-accounts">
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href="/builder/preview">
          <Button accessibilityLabel="미리보기 화면으로 이동">미리보기</Button>
        </Link>
      </View>
    </Screen>
  );
}
