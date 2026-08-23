import { ImageBackground, Linking, Pressable, Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { formatInviteDateTime } from "@/lib/date-time";
import type { InvitationPayload } from "@/lib/invitation-shared";
import { getInvitationMapLinks, type InvitationMapLinks } from "@/lib/map-links";
import { mobileTemplateGallery } from "@/lib/template-gallery";
import { getBundledTemplateCanvasSource } from "@/lib/template-preview-source";

type TemplateAccent = {
  background: string;
  border: string;
  accent: string;
  headline: string;
};

const templateAccents: Record<string, TemplateAccent> = {
  wedding: { background: "#fff7f2", border: "#ead6cb", accent: "#bd8c75", headline: "We are getting married" },
  dol: { background: "#fff9dd", border: "#eadb9f", accent: "#d4a542", headline: "First Birthday" },
  hwangap: { background: "#fbf6ed", border: "#d9c4a0", accent: "#9c654d", headline: "With gratitude" },
  bridal: { background: "#fff7fb", border: "#efd3dc", accent: "#c8849b", headline: "Bridal Shower" },
  birthday: { background: "#f0fbff", border: "#b9dceb", accent: "#5faece", headline: "Happy Birthday" },
  housewarming: { background: "#fbfaf5", border: "#d8dfc8", accent: "#778f69", headline: "Welcome home" },
  baby: { background: "#f7fbff", border: "#cfddf3", accent: "#739aca", headline: "Baby Shower" },
  graduation: { background: "#f8f9fc", border: "#ccd6e8", accent: "#425b8f", headline: "Graduation" },
  business: { background: "#f5f7ff", border: "#cbd8f5", accent: "#2b62d9", headline: "You are invited" }
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

function LiveMapPanel({
  links,
  venueAddress,
  venueName
}: {
  links: InvitationMapLinks;
  venueAddress: string;
  venueName: string;
}) {
  const hasMapTarget = Boolean(links.query || links.naverUrl || links.kakaoUrl);

  return (
    <View
      style={{
        width: "100%",
        borderRadius: 24,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(84,122,97,0.18)",
        padding: 18,
        gap: 14
      }}
    >
      <View
        style={{
          alignItems: "center",
          gap: 6
        }}
      >
        <Text style={{ color: "#6c865f", fontSize: 24, textAlign: "center" }}>⌖</Text>
        <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "800", textAlign: "center" }}>
          {venueName || "장소 이름"}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center" }}>
          {venueAddress || "주소를 입력하면 지도 검색 링크가 표시됩니다."}
        </Text>
        <Text style={{ color: theme.colors.textLight, fontSize: 11, lineHeight: 16, textAlign: "center" }}>
          지도는 카카오맵과 네이버지도 검색으로 열립니다.
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          accessibilityLabel="초대장에서 카카오 지도 열기"
          accessibilityRole="button"
          onPress={hasMapTarget && links.kakaoUrl ? () => void openMapUrl(links.kakaoUrl, links.kakaoFallbackUrl) : undefined}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 999,
            backgroundColor: hasMapTarget ? "#FEE500" : theme.colors.surfaceSoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10
          }}
        >
          <Text style={{ color: hasMapTarget ? "#332800" : theme.colors.textLight, fontSize: 12, fontWeight: "800" }}>
            카카오
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="초대장에서 네이버 지도 열기"
          accessibilityRole="button"
          onPress={hasMapTarget && links.naverUrl ? () => void openMapUrl(links.naverUrl, links.naverFallbackUrl) : undefined}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 999,
            backgroundColor: hasMapTarget ? "#03C75A" : theme.colors.surfaceSoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10
          }}
        >
          <Text style={{ color: hasMapTarget ? "#fff" : theme.colors.textLight, fontSize: 12, fontWeight: "800" }}>
            네이버
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function InvitationPreviewCard({
  compact = false,
  fitToViewport = false,
  payload
}: {
  compact?: boolean;
  fitToViewport?: boolean;
  payload: InvitationPayload;
}) {
  const selectedTemplate = mobileTemplateGallery.find((item) => item.id === payload.templateId);
  const accent = templateAccents[selectedTemplate?.category ?? "wedding"] ?? templateAccents.wedding;
  const mapLinks = getInvitationMapLinks(payload);
  const templateCanvasSource = getBundledTemplateCanvasSource(payload.templateId);
  const displayDateTime = formatInviteDateTime(payload.eventDateTime) || payload.eventDateTime || "행사 일시를 입력해 주세요.";
  const groomName = payload.eventData.groom.name || "신랑";
  const brideName = payload.eventData.bride.name || "신부";
  const isWedding = (selectedTemplate?.category ?? payload.eventType) === "wedding";
  const primaryTitle = isWedding ? `${groomName}  ♡  ${brideName}` : payload.title || selectedTemplate?.badge || "초대합니다";
  const scaled = compact || fitToViewport;

  return (
    <View
      style={{
        alignSelf: "center",
        borderRadius: 34,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: accent.border,
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: fitToViewport ? 320 : undefined,
        shadowColor: "rgba(102, 82, 63, 0.18)",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 1,
        shadowRadius: 34,
        elevation: 7
      }}
    >
      <ImageBackground
        imageStyle={{
          resizeMode: "contain"
        }}
        source={templateCanvasSource ?? undefined}
        style={{
          width: "100%",
          aspectRatio: 768 / 1376,
          backgroundColor: accent.background
        }}
      >
        <View
          style={{
            position: "absolute",
            left: scaled ? 42 : 50,
            right: scaled ? 42 : 50,
            top: "25%",
            bottom: "20%",
            alignItems: "center",
            justifyContent: "center",
            gap: scaled ? 9 : 12
          }}
        >
          <Text style={{ color: accent.accent, fontSize: scaled ? 13 : 14, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
            {accent.headline}
          </Text>
          <Text style={{ color: accent.accent, fontSize: 12, fontWeight: "800", textAlign: "center" }}>
            {selectedTemplate?.badge || "초대장"}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: scaled ? 24 : 28, fontWeight: "900", lineHeight: scaled ? 33 : 38, textAlign: "center" }}>
            {primaryTitle}
          </Text>
          <View style={{ width: 92, height: 1, backgroundColor: accent.border, marginVertical: scaled ? 2 : 4 }} />
          <Text style={{ color: theme.colors.text, fontSize: scaled ? 14 : 16, fontWeight: "800", lineHeight: scaled ? 21 : 24, textAlign: "center" }}>
            {displayDateTime}
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: scaled ? 13 : 15, fontWeight: "700", lineHeight: scaled ? 20 : 23, textAlign: "center" }}>
            {payload.venueName || "장소를 입력해 주세요."}
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: scaled ? 12 : 14, lineHeight: scaled ? 19 : 22, marginTop: scaled ? 18 : 24, textAlign: "center" }}>
            {payload.message || "초대 메시지를 입력하면 이곳에 반영됩니다."}
          </Text>
        </View>
      </ImageBackground>
      <View style={{ padding: scaled ? 16 : 18, gap: 12 }}>
        <LiveMapPanel links={mapLinks} venueAddress={payload.venueAddress} venueName={payload.venueName} />
        {payload.location.transportNote ? (
          <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
            {payload.location.transportNote}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
