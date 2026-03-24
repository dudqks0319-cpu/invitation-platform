import { Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Screen } from "@/components/ui/Screen";

export default function MyPageScreen() {
  return (
    <Screen
      subtitle="계정, 정책, 고객 지원 흐름을 이 탭에 배치합니다."
      title="마이페이지"
    >
      <Card eyebrow="계정" title="로그인과 계정 삭제">
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>
          Apple, Kakao, Email 로그인과 계정 삭제는 이 탭에서 다룹니다.
        </Text>
      </Card>

      <Card eyebrow="요금제" title="v1.0은 무료 전용">
        <Pill active label="무료 플랜" />
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 12 }}>
          유료 업셀 문구 없이 무료 기능만 제공합니다. 프리미엄은 후속 버전에서 검토합니다.
        </Text>
      </Card>

      <Card eyebrow="지원" title="약관과 문의">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          FAQ, 이용약관, 개인정보처리방침, 문의하기로 연결될 예정입니다.
        </Text>
      </Card>
    </Screen>
  );
}
