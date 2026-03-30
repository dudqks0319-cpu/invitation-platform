import { Link, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";

const inputStyle = {
  minHeight: 48,
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: theme.colors.border,
  backgroundColor: "#fff",
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: theme.colors.text
} as const;

const labelStyle = {
  color: theme.colors.muted,
  fontSize: 13,
  fontWeight: "700" as const,
  marginBottom: 6
};

export default function BuilderStep2PeopleScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { draft, updateCouple } = useInvitationDraft("local-preview-owner", localId);

  return (
    <Screen subtitle="신랑, 신부, 양가 정보 입력 단계입니다." title="초대장 만들기">
      <StepIndicator current={2} title="인물 정보" />
      <Card eyebrow="결혼식 전용" title="신랑 · 신부 · 부모님">
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>신랑 이름</Text>
          <TextInput
            onChangeText={(groomName) => updateCouple({ groomName })}
            placeholder="예: 홍길동"
            style={inputStyle}
            value={draft?.payload.eventData.groom.name ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>신부 이름</Text>
          <TextInput
            onChangeText={(brideName) => updateCouple({ brideName })}
            placeholder="예: 김부인"
            style={inputStyle}
            value={draft?.payload.eventData.bride.name ?? ""}
          />
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href={{ pathname: "/builder/step1-basic", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href={{ pathname: "/builder/step3-photos", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
