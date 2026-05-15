import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FocusInput } from "@/components/ui/FocusInput";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";
import { getBuilderStepValidation } from "@/lib/builder-validation";
import { createEmptyInvitationDraft } from "@/lib/invitation-shared";

const inputStyle = {
  minHeight: 48,
  borderRadius: 12,
  fontSize: 15
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
  const validation = getBuilderStepValidation(
    2,
    draft?.payload ?? createEmptyInvitationDraft("local-preview-owner").payload
  );

  return (
    <Screen subtitle="신랑, 신부, 양가 정보 입력 단계입니다." title="초대장 만들기">
      <StepIndicator current={2} localId={localId} title="인물 정보" />
      <Card eyebrow="필수 입력" title="신랑 · 신부 이름">
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>신랑 이름</Text>
          <FocusInput
            onChangeText={(groomName) => updateCouple({ groomName })}
            placeholder="예: 홍길동"
            style={inputStyle}
            value={draft?.payload.eventData.groom.name ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>신부 이름</Text>
          <FocusInput
            onChangeText={(brideName) => updateCouple({ brideName })}
            placeholder="예: 김부인"
            style={inputStyle}
            value={draft?.payload.eventData.bride.name ?? ""}
          />
        </View>
        {!validation.canContinue ? (
          <Text style={{ color: theme.colors.primaryDark, fontSize: 13, lineHeight: 20 }}>
            {validation.message}
          </Text>
        ) : (
          <Text style={{ color: theme.colors.success, fontSize: 13, lineHeight: 20 }}>
            두 분 성함이 준비되었습니다. 부모님 정보는 선택 입력입니다.
          </Text>
        )}
      </Card>
      <Card eyebrow="선택 입력" title="신랑측 가족 정보">
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>아버지 성함</Text>
          <FocusInput
            onChangeText={(groomFatherName) => updateCouple({ groomFatherName })}
            placeholder="예: 홍아버지"
            style={inputStyle}
            value={draft?.payload.eventData.groomParents.father?.name ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>어머니 성함</Text>
          <FocusInput
            onChangeText={(groomMotherName) => updateCouple({ groomMotherName })}
            placeholder="예: 이어머니"
            style={inputStyle}
            value={draft?.payload.eventData.groomParents.mother?.name ?? ""}
          />
        </View>
      </Card>
      <Card eyebrow="선택 입력" title="신부측 가족 정보">
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>아버지 성함</Text>
          <FocusInput
            onChangeText={(brideFatherName) => updateCouple({ brideFatherName })}
            placeholder="예: 김아버지"
            style={inputStyle}
            value={draft?.payload.eventData.brideParents.father?.name ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>어머니 성함</Text>
          <FocusInput
            onChangeText={(brideMotherName) => updateCouple({ brideMotherName })}
            placeholder="예: 박어머니"
            style={inputStyle}
            value={draft?.payload.eventData.brideParents.mother?.name ?? ""}
          />
        </View>
      </Card>
      <View style={{ gap: 12, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Link asChild href={{ pathname: "/builder/step1-basic", params: localId ? { localId } : {} }}>
            <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
          </Link>
        </View>
        <View style={{ flex: 2 }}>
          {validation.canContinue ? (
            <Link asChild href={{ pathname: "/builder/step3-photos", params: localId ? { localId } : {} }}>
              <Button accessibilityLabel="다음 단계로 이동">다음</Button>
            </Link>
          ) : (
            <Button accessibilityLabel="필수 정보 입력 필요">
              필수 정보 먼저 입력
            </Button>
          )}
        </View>
      </View>
    </Screen>
  );
}
