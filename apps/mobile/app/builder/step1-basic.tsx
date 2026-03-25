import { Link, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";

const inputStyle = {
  minHeight: 46,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: "#fff",
  paddingHorizontal: 14,
  paddingVertical: 10,
  color: theme.colors.text
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

  return (
    <Screen subtitle="행사 제목, 날짜, 장소를 먼저 정리합니다." title="초대장 만들기">
      <StepIndicator current={1} title="기본 정보" />
      {loading ? <Loading label="로컬 초안을 준비하는 중..." /> : null}
      <Card eyebrow="입력 항목" title="제목 · 날짜 · 장소">
        <View>
          <Text style={labelStyle}>행사 제목</Text>
          <TextInput
            onChangeText={(title) => updateBasics({ title })}
            placeholder="예: 우리 결혼합니다"
            style={inputStyle}
            value={draft?.payload.title ?? ""}
          />
        </View>
        <View>
          <Text style={labelStyle}>행사 일시</Text>
          <TextInput
            onChangeText={(eventDateTime) => updateBasics({ eventDateTime })}
            placeholder="예: 2026-05-23T14:00"
            style={inputStyle}
            value={draft?.payload.eventDateTime ?? ""}
          />
        </View>
        <View>
          <Text style={labelStyle}>예식장 이름</Text>
          <TextInput
            onChangeText={(venueName) => updateBasics({ venueName })}
            placeholder="예: 더파인 웨딩홀"
            style={inputStyle}
            value={draft?.payload.venueName ?? ""}
          />
        </View>
        <View>
          <Text style={labelStyle}>예식장 주소</Text>
          <TextInput
            onChangeText={(venueAddress) => updateBasics({ venueAddress })}
            placeholder="예: 서울 강남구 테헤란로 123"
            style={inputStyle}
            value={draft?.payload.venueAddress ?? ""}
          />
        </View>
        <View>
          <Text style={labelStyle}>초대 메시지</Text>
          <TextInput
            multiline
            onChangeText={(message) => updateBasics({ message })}
            placeholder="소중한 자리에 함께해 주세요."
            style={[inputStyle, { minHeight: 96, textAlignVertical: "top" }]}
            value={draft?.payload.message ?? ""}
          />
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href={{ pathname: "/builder/step2-people", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
