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

export default function BuilderStep4AccountsScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { draft, updateAccounts } = useInvitationDraft("local-preview-owner", localId);

  return (
    <Screen subtitle="축의금 계좌와 카카오페이 링크를 준비합니다." title="초대장 만들기">
      <StepIndicator current={4} title="계좌 정보" />
      <Card eyebrow="공유 준비" title="신랑측 · 신부측 계좌">
        <View>
          <Text style={labelStyle}>신랑측 은행</Text>
          <TextInput
            onChangeText={(primaryBank) => updateAccounts({ primaryBank })}
            placeholder="예: 신한은행"
            style={inputStyle}
            value={draft?.payload.accounts.primary?.bank ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>신랑측 예금주</Text>
          <TextInput
            onChangeText={(primaryHolder) => updateAccounts({ primaryHolder })}
            placeholder="예: 홍길동"
            style={inputStyle}
            value={draft?.payload.accounts.primary?.holder ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>신랑측 계좌번호</Text>
          <TextInput
            onChangeText={(primaryAccount) => updateAccounts({ primaryAccount })}
            placeholder="예: 110-123-456789"
            style={inputStyle}
            value={draft?.payload.accounts.primary?.account ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>신부측 은행</Text>
          <TextInput
            onChangeText={(secondaryBank) => updateAccounts({ secondaryBank })}
            placeholder="예: 국민은행"
            style={inputStyle}
            value={draft?.payload.accounts.secondary?.bank ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>신부측 예금주</Text>
          <TextInput
            onChangeText={(secondaryHolder) => updateAccounts({ secondaryHolder })}
            placeholder="예: 김부인"
            style={inputStyle}
            value={draft?.payload.accounts.secondary?.holder ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>신부측 계좌번호</Text>
          <TextInput
            onChangeText={(secondaryAccount) => updateAccounts({ secondaryAccount })}
            placeholder="예: 123-45-678901"
            style={inputStyle}
            value={draft?.payload.accounts.secondary?.account ?? ""}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={labelStyle}>카카오페이 링크</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={(kakaoPayLink) => updateAccounts({ kakaoPayLink })}
            placeholder="https://qr.kakaopay.com/..."
            style={inputStyle}
            value={draft?.payload.accounts.kakaoPayLink ?? ""}
          />
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href={{ pathname: "/builder/step3-photos", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
        </Link>
        <Link asChild href={{ pathname: "/builder/step5-location", params: localId ? { localId } : {} }}>
          <Button accessibilityLabel="다음 단계로 이동">다음</Button>
        </Link>
      </View>
    </Screen>
  );
}
