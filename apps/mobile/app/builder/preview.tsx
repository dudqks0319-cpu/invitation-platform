import { Link } from "expo-router";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function BuilderPreviewScreen() {
  return (
    <Screen subtitle="실시간 폰 프리뷰를 이 화면의 시그니처로 키웁니다." title="미리보기">
      <Card eyebrow="시그니처" title="축소형 실시간 폰 프리뷰">
        현재는 프리뷰 자리만 마련했고, 다음 단계에서 TemplateRenderer와 실제 payload를 연결합니다.
      </Card>
      <Card eyebrow="다음 구현" title="저장 · 공유 · 공개 상태">
        저장 후에는 내 초대장 목록과 운영 화면에서 이어서 관리할 수 있게 합니다.
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href="/builder/step5-location">
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href="/invitation/demo/index">
          <Button accessibilityLabel="운영 화면 예시로 이동">운영 화면 보기</Button>
        </Link>
      </View>
    </Screen>
  );
}
