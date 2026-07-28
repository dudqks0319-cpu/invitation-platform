import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { FocusInput } from "@/components/ui/FocusInput";
import { Loading } from "@/components/ui/Loading";
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

export default function BuilderStep1Screen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { draft, loading, updateBasics } = useInvitationDraft("local-preview-owner", localId);
  const validation = getBuilderStepValidation(
    1,
    draft?.payload ?? createEmptyInvitationDraft("local-preview-owner").payload
  );

  return (
    <Screen subtitle="행사 제목, 날짜, 장소를 먼저 정리합니다." title="초대장 만들기">
      <StepIndicator current={1} title="기본 정보" />
      {loading ? <Loading label="초대장을 준비하는 중..." /> : null}
      <Card eyebrow="입력 항목" title="제목 · 날짜 · 장소">
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>행사 제목</Text>
          <FocusInput
            onChangeText={(title) => updateBasics({ title })}
            placeholder="예: 우리 결혼합니다"
            style={inputStyle}
            value={draft?.payload.title ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>행사 일시</Text>
          <DateTimeField
            onChangeText={(eventDateTime) => updateBasics({ eventDateTime })}
            value={draft?.payload.eventDateTime ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>예식장 이름</Text>
          <FocusInput
            onChangeText={(venueName) => updateBasics({ venueName })}
            placeholder="예: 더파인 웨딩홀"
            style={inputStyle}
            value={draft?.payload.venueName ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>예식장 주소</Text>
          <FocusInput
            onChangeText={(venueAddress) => updateBasics({ venueAddress })}
            placeholder="예: 서울 강남구 테헤란로 123"
            style={inputStyle}
            value={draft?.payload.venueAddress ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>초대 메시지</Text>
          <FocusInput
            multiline
            onChangeText={(message) => updateBasics({ message })}
            placeholder="소중한 자리에 함께해 주세요."
            style={[inputStyle, { minHeight: 96, textAlignVertical: "top" }]}
            value={draft?.payload.message ?? ""}
          />
        </View>
        {!validation.canContinue ? (
          <Text style={{ color: theme.colors.primaryDark, fontSize: 13, lineHeight: 20 }}>
            {validation.message}
          </Text>
        ) : null}
      </Card>
      <View style={{ gap: 12, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Link asChild href="/(tabs)">
            <Button accessibilityLabel="처음으로 돌아가기" variant="outline">처음으로</Button>
          </Link>
        </View>
        <View style={{ flex: 1.4 }}>
          {validation.canContinue ? (
            <Link asChild href={{ pathname: "/builder/step2-people", params: localId ? { localId } : {} }}>
              <Button accessibilityLabel="다음 단계로 이동">다음</Button>
            </Link>
          ) : (
            <Button accessibilityLabel="필수 정보 입력 필요">
              필수 정보 입력 필요
            </Button>
          )}
        </View>
      </View>
    </Screen>
  );
}
