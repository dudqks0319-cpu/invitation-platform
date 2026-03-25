import { Link, useLocalSearchParams } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

export default function BuilderStep5LocationScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { draft, updateBasics, updateLocation } = useInvitationDraft("local-preview-owner", localId);

  return (
    <Screen subtitle="지도 링크와 교통 안내를 마지막으로 점검합니다." title="초대장 만들기">
      <StepIndicator current={5} title="오시는 길" />
      <Card eyebrow="공개 페이지" title="네이버 지도와 교통 안내">
        <View>
          <Text style={labelStyle}>예식장 주소</Text>
          <TextInput
            onChangeText={(venueAddress) => updateBasics({ venueAddress })}
            placeholder="예: 서울 강남구 테헤란로 123"
            style={inputStyle}
            value={draft?.payload.venueAddress ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>네이버 지도 링크</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={(naverMapUrl) => updateLocation({ naverMapUrl })}
            placeholder="https://map.naver.com/..."
            style={inputStyle}
            value={draft?.payload.location.naverMapUrl ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>교통 안내</Text>
          <TextInput
            multiline
            onChangeText={(transportNote) => updateLocation({ transportNote })}
            placeholder="주차, 셔틀, 지하철 안내를 적어주세요."
            style={[inputStyle, { minHeight: 96, textAlignVertical: "top" }]}
            value={draft?.payload.location.transportNote ?? ""}
          />
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href={{ pathname: "/builder/step4-accounts", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href={{ pathname: "/builder/preview", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="미리보기 화면으로 이동">미리보기</Button>
        </Link>
      </View>
    </Screen>
  );
}
