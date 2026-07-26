import { Link, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FocusInput } from "@/components/ui/FocusInput";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";
import { useMapApiConfig } from "@/hooks/useMapApiConfig";
import { getInvitationMapLinks } from "@/lib/map-links";

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

async function openMapUrl(url: string, fallbackUrl?: string) {
  if (!url) return;

  try {
    await Linking.openURL(url);
  } catch {
    if (fallbackUrl) {
      await Linking.openURL(fallbackUrl);
    }
  }
}

export default function BuilderStep5LocationScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { draft, updateBasics, updateLocation } = useInvitationDraft("local-preview-owner", localId);
  const mapApi = useMapApiConfig();
  const mapLinks = draft ? getInvitationMapLinks(draft.payload) : null;
  const canPreviewMap = Boolean(mapLinks?.query || mapLinks?.naverUrl || mapLinks?.kakaoUrl);

  return (
    <Screen subtitle="지도 링크와 교통 안내를 마지막으로 점검합니다." title="초대장 만들기">
      <StepIndicator current={5} title="오시는 길" />
      <Card eyebrow="공개 페이지" title="카카오 · 네이버 지도와 교통 안내">
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
          <Text style={labelStyle}>카카오 지도 링크</Text>
          <FocusInput
            autoCapitalize="none"
            onChangeText={(kakaoMapUrl) => updateLocation({ kakaoMapUrl })}
            placeholder="https://place.map.kakao.com/... 또는 비워두면 주소로 검색"
            style={inputStyle}
            value={draft?.payload.location.kakaoMapUrl ?? ""}
          />
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>네이버 지도 링크</Text>
          <FocusInput
            autoCapitalize="none"
            onChangeText={(naverMapUrl) => updateLocation({ naverMapUrl })}
            placeholder="https://map.naver.com/... 또는 비워두면 주소로 검색"
            style={inputStyle}
            value={draft?.payload.location.naverMapUrl ?? ""}
          />
        </View>
        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(143,111,82,0.16)",
            backgroundColor: "#fffaf4",
            padding: 16,
            gap: 12
          }}
        >
          <Text style={{ color: theme.colors.primaryDark, fontSize: 12, fontWeight: "800" }}>지도 미리보기</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Text
              style={{
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: mapApi.config?.kakao.enabled ? "#FEE500" : theme.colors.surfaceSoft,
                color: mapApi.config?.kakao.enabled ? "#332800" : theme.colors.textLight,
                fontSize: 12,
                fontWeight: "800",
                paddingHorizontal: 10,
                paddingVertical: 6
              }}
            >
              카카오 API {mapApi.config?.kakao.enabled ? "연동" : "대기"}
            </Text>
            <Text
              style={{
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: mapApi.config?.naver.enabled ? "#03C75A" : theme.colors.surfaceSoft,
                color: mapApi.config?.naver.enabled ? "#fff" : theme.colors.textLight,
                fontSize: 12,
                fontWeight: "800",
                paddingHorizontal: 10,
                paddingVertical: 6
              }}
            >
              네이버 API {mapApi.config?.naver.enabled ? "연동" : "대기"}
            </Text>
          </View>
          <View
            style={{
              minHeight: 120,
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: "#edf3ea",
              borderWidth: 1,
              borderColor: "rgba(84,122,97,0.16)",
              justifyContent: "center",
              padding: 18
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 22,
                left: -24,
                width: "120%",
                height: 1,
                backgroundColor: "rgba(84,122,97,0.14)",
                transform: [{ rotate: "-12deg" }]
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 70,
                left: -24,
                width: "120%",
                height: 1,
                backgroundColor: "rgba(84,122,97,0.14)",
                transform: [{ rotate: "10deg" }]
              }}
            />
            <Text style={{ color: theme.colors.primaryDark, fontSize: 30, textAlign: "center" }}>⌖</Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800", marginTop: 4, textAlign: "center" }}>
              {draft?.payload.venueName || "예식장 이름"}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20, marginTop: 4, textAlign: "center" }}>
              {draft?.payload.venueAddress || "주소를 입력하면 지도 검색 링크가 자동 생성됩니다."}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              accessibilityLabel="카카오 지도 열기"
              accessibilityRole="button"
              onPress={
                canPreviewMap && mapLinks?.kakaoUrl
                  ? () => void openMapUrl(mapLinks.kakaoUrl, mapLinks.kakaoFallbackUrl)
                  : undefined
              }
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                backgroundColor: canPreviewMap ? "#FEE500" : theme.colors.surfaceSoft,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12
              }}
            >
              <Text style={{ color: canPreviewMap ? "#332800" : theme.colors.textLight, fontSize: 13, fontWeight: "800" }}>
                카카오 지도
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="네이버 지도 열기"
              accessibilityRole="button"
              onPress={
                canPreviewMap && mapLinks?.naverUrl
                  ? () => void openMapUrl(mapLinks.naverUrl, mapLinks.naverFallbackUrl)
                  : undefined
              }
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                backgroundColor: canPreviewMap ? "#03C75A" : theme.colors.surfaceSoft,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 12
              }}
            >
              <Text style={{ color: canPreviewMap ? "#fff" : theme.colors.textLight, fontSize: 13, fontWeight: "800" }}>
                네이버 지도
              </Text>
            </Pressable>
          </View>
          <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }}>
            {mapApi.label}. 링크를 붙여 넣으면 해당 장소 링크를 우선 사용하고, 없으면 예식장 이름과 주소로 검색합니다.
          </Text>
        </View>
        <View style={{ gap: 14 }}>
          <Text style={labelStyle}>교통 안내</Text>
          <FocusInput
            multiline
            onChangeText={(transportNote) => updateLocation({ transportNote })}
            placeholder="주차, 셔틀, 지하철 안내를 적어주세요."
            style={[inputStyle, { minHeight: 96, textAlignVertical: "top" }]}
            value={draft?.payload.location.transportNote ?? ""}
          />
        </View>
      </Card>
      <View style={{ gap: 12, flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <Link asChild href={{ pathname: "/builder/step4-accounts", params: localId ? { localId } : {} }}>
            <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
          </Link>
        </View>
        <View style={{ flex: 2 }}>
          <Link asChild href={{ pathname: "/builder/preview", params: localId ? { localId } : {} }}>
            <Button accessibilityLabel="미리보기 화면으로 이동">미리보기</Button>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
