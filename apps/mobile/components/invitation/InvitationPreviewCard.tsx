import { Linking, Pressable, Text, View } from "react-native";
import { TemplateCanvasPreview, getTemplateAccent } from "@/components/invitation/TemplateCanvasPreview";
import { theme } from "@/components/ui/theme";
import type { InvitationPayload } from "@/lib/invitation-shared";
import { getInvitationMapLinks, type InvitationMapLinks } from "@/lib/map-links";
import { mobileTemplateGallery } from "@/lib/template-gallery";

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
          onPress={hasMapTarget && links.kakaoUrl ? () => void openMapUrl(links.kakaoUrl) : undefined}
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
  const accent = getTemplateAccent(selectedTemplate?.category ?? payload.eventType);
  const mapLinks = getInvitationMapLinks(payload);
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
      <TemplateCanvasPreview payload={payload} scale={scaled ? "compact" : "full"} />
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
