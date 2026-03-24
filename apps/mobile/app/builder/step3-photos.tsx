import { Link } from "expo-router";
import { View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";

export default function BuilderStep3PhotosScreen() {
  return (
    <Screen subtitle="메인, 배경, 갤러리 사진 흐름을 여기에 붙입니다." title="초대장 만들기">
      <StepIndicator current={3} title="사진 설정" />
      <Card eyebrow="갤러리" title="최대 10장">
        업로드 큐, 리사이즈, 순서 정렬은 다음 구현 단계에서 연결합니다.
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href="/builder/step2-people">
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href="/builder/step4-accounts">
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
