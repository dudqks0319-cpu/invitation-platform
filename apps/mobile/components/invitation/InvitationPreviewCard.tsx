import { useState } from "react";
import { ImageBackground, Linking, Pressable, useWindowDimensions, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { resolveTemplateTextLayout } from "@invitehub/shared";
import { theme } from "@/components/ui/theme";
import { appFonts } from "@/components/ui/typography";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { formatInviteDateTime } from "@/lib/date-time";
import type { InvitationPayload } from "@/lib/invitation-shared";
import { getInvitationMapLinks, type InvitationMapLinks } from "@/lib/map-links";
import { getTemplateCanvasSource } from "@/lib/template-image-source";
import {
  getInvitationPreviewAccessibility,
  getInvitationPreviewDetails
} from "@/lib/invitation-preview-accessibility";
import { getInvitationArtworkPresentation } from "@/lib/invitation-artwork-presentation";
import {
  getTemplateSampleHeadline,
  templateOverlayTypography
} from "@/lib/template-sample-overlay-presentation";

type TemplateAccent = {
  background: string;
  border: string;
};

const templateAccents: Record<string, TemplateAccent> = {
  wedding: { background: "#fff7f2", border: "#ead6cb" },
  dol: { background: "#fff9dd", border: "#eadb9f" },
  hwangap: { background: "#fbf6ed", border: "#d9c4a0" },
  bridal: { background: "#fff7fb", border: "#efd3dc" },
  birthday: { background: "#f0fbff", border: "#b9dceb" },
  housewarming: { background: "#fbfaf5", border: "#d8dfc8" },
  baby: { background: "#f7fbff", border: "#cfddf3" },
  graduation: { background: "#f8f9fc", border: "#ccd6e8" },
  business: { background: "#f5f7ff", border: "#cbd8f5" }
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
  accessibility,
  links,
  venueAddress,
  venueName
}: {
  accessibility: ReturnType<typeof getInvitationPreviewAccessibility>["mapButtons"];
  links: InvitationMapLinks;
  venueAddress: string;
  venueName: string;
}) {
  const hasMapTarget = Boolean(links.query || links.naverUrl || links.kakaoUrl);
  const hasKakaoTarget = !accessibility.kakao.disabled;
  const hasNaverTarget = !accessibility.naver.disabled;

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
        accessible={false}
        importantForAccessibility="no-hide-descendants"
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
        <Text style={{ color: theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center" }}>
          지도는 카카오맵과 네이버지도 검색으로 열립니다.
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          accessibilityHint="카카오맵에서 예시 장소를 검색합니다."
          accessibilityLabel="초대장에서 카카오 지도 열기"
          accessibilityRole={accessibility.kakao.role}
          accessibilityState={{ disabled: accessibility.kakao.disabled }}
          disabled={accessibility.kakao.disabled}
          onPress={hasMapTarget && links.kakaoUrl ? () => void openMapUrl(links.kakaoUrl, links.kakaoFallbackUrl) : undefined}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 999,
            backgroundColor: hasKakaoTarget ? "#FEE500" : theme.colors.surfaceSoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10
          }}
        >
          <Text style={{ color: hasKakaoTarget ? "#332800" : theme.colors.muted, fontSize: 12, fontWeight: "800" }}>
            카카오
          </Text>
        </Pressable>
        <Pressable
          accessibilityHint="네이버 지도에서 예시 장소를 검색합니다."
          accessibilityLabel="초대장에서 네이버 지도 열기"
          accessibilityRole={accessibility.naver.role}
          accessibilityState={{ disabled: accessibility.naver.disabled }}
          disabled={accessibility.naver.disabled}
          onPress={hasMapTarget && links.naverUrl ? () => void openMapUrl(links.naverUrl, links.naverFallbackUrl) : undefined}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 999,
            backgroundColor: hasNaverTarget ? "#03C75A" : theme.colors.surfaceSoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10
          }}
        >
          <Text style={{ color: hasNaverTarget ? theme.colors.ink : theme.colors.muted, fontSize: 12, fontWeight: "800" }}>
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
  const { fontScale } = useWindowDimensions();
  const [artworkHeight, setArtworkHeight] = useState(0);
  const { findById } = useTemplateCatalog();
  const selectedTemplate = findById(payload.templateId);
  const previewCategory = selectedTemplate?.category ?? payload.eventType;
  const accent = templateAccents[previewCategory] ?? templateAccents.wedding;
  const previewHeadline = getTemplateSampleHeadline(previewCategory) ?? "YOU ARE INVITED";
  const mapLinks = getInvitationMapLinks(payload);
  const templateCanvasSource = getTemplateCanvasSource(selectedTemplate);
  const displayDateTime = formatInviteDateTime(payload.eventDateTime) || payload.eventDateTime || "행사 일시를 입력해 주세요.";
  const groomName = payload.eventData.groom.name || "신랑";
  const brideName = payload.eventData.bride.name || "신부";
  const isWedding = (selectedTemplate?.category ?? payload.eventType) === "wedding";
  const primaryTitle = isWedding ? `${groomName}  ♡  ${brideName}` : payload.title || selectedTemplate?.badge || "초대합니다";
  const scaled = compact || fitToViewport;
  const textLayout = resolveTemplateTextLayout({
    templateId: selectedTemplate?.id ?? payload.templateId,
    category: selectedTemplate?.category ?? payload.eventType,
    textPlacement: selectedTemplate?.textPlacement,
    fallbackSafeArea: selectedTemplate?.textSafeArea
  });
  const artworkPresentation = getInvitationArtworkPresentation({
    artworkHeight,
    safeAreas: textLayout.areas,
    fontScale
  });
  const hasMapTarget = Boolean(mapLinks.query || mapLinks.naverUrl || mapLinks.kakaoUrl);
  const details = getInvitationPreviewDetails({
    title: primaryTitle,
    dateTime: displayDateTime,
    venueName: payload.venueName || "장소를 입력해 주세요.",
    venueAddress: payload.venueAddress || "주소를 입력해 주세요.",
    message: payload.message || "초대 메시지를 입력하면 이곳에 반영됩니다.",
    transportNote: payload.location.transportNote || undefined
  });
  const previewAccessibility = getInvitationPreviewAccessibility({
    details,
    hasKakaoTarget: Boolean(hasMapTarget && mapLinks.kakaoUrl),
    hasNaverTarget: Boolean(hasMapTarget && mapLinks.naverUrl)
  });

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
      <View accessible={false} importantForAccessibility="no-hide-descendants">
        <ImageBackground
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          imageStyle={{
            resizeMode: "contain"
          }}
          source={templateCanvasSource ?? undefined}
          onLayout={(event) => {
            const nextHeight = Math.round(event.nativeEvent.layout.height);
            if (nextHeight !== artworkHeight) setArtworkHeight(nextHeight);
          }}
          style={{
            width: "100%",
            aspectRatio: 768 / 1376,
            backgroundColor: accent.background
          }}
        >
          {artworkPresentation.zones.map((zone, index) => {
            const safeArea = textLayout.areas[index];
            const visible = zone.showHeadline || zone.showTitle || zone.showDateTime || zone.showVenue;
            if (!safeArea || !visible) return null;

            return (
              <View
                key={`${index}-${safeArea.topPct}-${safeArea.bottomPct}`}
                style={{
                  position: "absolute",
                  left: `${safeArea.leftPct}%`,
                  right: `${100 - safeArea.rightPct}%`,
                  top: `${safeArea.topPct}%`,
                  bottom: `${100 - safeArea.bottomPct}%`,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  gap: templateOverlayTypography.lineGap
                }}
              >
                {zone.showHeadline ? (
                  <Text allowFontScaling={false} numberOfLines={1} style={{ color: artworkPresentation.textColor, fontSize: templateOverlayTypography.eyebrowFontSize, fontWeight: "600", letterSpacing: 1.1, lineHeight: templateOverlayTypography.eyebrowLineHeight, textAlign: "center", width: "100%" }}>
                    {previewHeadline}
                  </Text>
                ) : null}
                {zone.showTitle ? (
                  <Text allowFontScaling={false} numberOfLines={1} style={{ color: artworkPresentation.textColor, fontFamily: appFonts.invitationBold, fontSize: templateOverlayTypography.titleFontSize, fontWeight: "800", lineHeight: templateOverlayTypography.titleLineHeight, textAlign: "center", width: "100%" }}>
                    {primaryTitle}
                  </Text>
                ) : null}
                {zone.showDateTime ? (
                  <Text allowFontScaling={false} numberOfLines={1} style={{ color: artworkPresentation.textColor, fontSize: templateOverlayTypography.detailFontSize, fontWeight: "700", lineHeight: templateOverlayTypography.detailLineHeight, textAlign: "center", width: "100%" }}>
                    {displayDateTime}
                  </Text>
                ) : null}
                {zone.showVenue ? (
                  <Text allowFontScaling={false} numberOfLines={1} style={{ color: artworkPresentation.textColor, fontSize: templateOverlayTypography.detailFontSize, lineHeight: templateOverlayTypography.detailLineHeight, textAlign: "center", width: "100%" }}>
                    {payload.venueName || "장소를 입력해 주세요."}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ImageBackground>
      </View>
      <View style={{ padding: scaled ? 16 : 18, gap: 12 }}>
        <View
          accessible
          accessibilityLabel={previewAccessibility.summary.label}
          accessibilityRole={previewAccessibility.summary.role}
          style={{
            borderRadius: 20,
            backgroundColor: theme.colors.paper,
            borderWidth: 1,
            borderColor: accent.border,
            paddingHorizontal: 18,
            paddingVertical: 16,
            gap: 14
          }}
        >
          <Text accessible={false} importantForAccessibility="no-hide-descendants" style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "900", lineHeight: 25 }}>
            초대장 예시 상세
          </Text>
          {details.map((detail) => (
            <View accessible={false} importantForAccessibility="no-hide-descendants" key={detail.key} style={{ gap: 3 }}>
              <Text style={{ color: theme.colors.ink, fontSize: 13, fontWeight: "800", lineHeight: 20 }}>{detail.label}</Text>
              <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 24 }}>{detail.value}</Text>
            </View>
          ))}
        </View>
        <LiveMapPanel accessibility={previewAccessibility.mapButtons} links={mapLinks} venueAddress={payload.venueAddress} venueName={payload.venueName} />
      </View>
    </View>
  );
}
