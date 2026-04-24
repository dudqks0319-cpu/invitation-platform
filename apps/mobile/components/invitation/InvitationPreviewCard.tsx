/* eslint-disable jsx-a11y/alt-text */

import { Image, ImageBackground, Linking, Pressable, Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import type { InvitationPayload } from "@/lib/invitation-shared";
import { getInvitationMapLinks, type InvitationMapLinks } from "@/lib/map-links";
import { mobileTemplateGallery } from "@/lib/template-gallery";

type TemplateAccent = {
  background: string;
  border: string;
  accent: string;
  wash: string;
  motif: "floral" | "confetti" | "hanji" | "leaf" | "minimal" | "ribbon";
  headline: string;
  surface: string;
};

const templateAccents: Record<string, TemplateAccent> = {
  wedding: { background: "#fff7f2", border: "#ead6cb", accent: "#bd8c75", wash: "rgba(242, 194, 188, 0.2)", motif: "floral", headline: "We are getting married", surface: "rgba(255, 252, 247, 0.78)" },
  dol: { background: "#fff9dd", border: "#eadb9f", accent: "#d4a542", wash: "rgba(255, 217, 116, 0.22)", motif: "confetti", headline: "First Birthday", surface: "rgba(255, 253, 240, 0.82)" },
  hwangap: { background: "#fbf6ed", border: "#d9c4a0", accent: "#9c654d", wash: "rgba(201, 166, 107, 0.18)", motif: "hanji", headline: "With gratitude", surface: "rgba(255, 251, 242, 0.84)" },
  bridal: { background: "#fff7fb", border: "#efd3dc", accent: "#c8849b", wash: "rgba(246, 193, 207, 0.22)", motif: "ribbon", headline: "Bridal Shower", surface: "rgba(255, 250, 253, 0.82)" },
  birthday: { background: "#f0fbff", border: "#b9dceb", accent: "#5faece", wash: "rgba(97, 185, 230, 0.18)", motif: "confetti", headline: "Happy Birthday", surface: "rgba(249, 253, 255, 0.82)" },
  housewarming: { background: "#fbfaf5", border: "#d8dfc8", accent: "#778f69", wash: "rgba(141, 163, 122, 0.18)", motif: "leaf", headline: "Welcome home", surface: "rgba(253, 252, 246, 0.82)" },
  baby: { background: "#f7fbff", border: "#cfddf3", accent: "#739aca", wash: "rgba(158, 199, 255, 0.2)", motif: "ribbon", headline: "Baby Shower", surface: "rgba(250, 253, 255, 0.82)" },
  graduation: { background: "#f8f9fc", border: "#ccd6e8", accent: "#425b8f", wash: "rgba(32, 56, 99, 0.12)", motif: "minimal", headline: "Graduation", surface: "rgba(250, 251, 255, 0.86)" },
  business: { background: "#f5f7ff", border: "#cbd8f5", accent: "#2b62d9", wash: "rgba(43, 98, 217, 0.12)", motif: "minimal", headline: "You are invited", surface: "rgba(250, 252, 255, 0.88)" }
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

function InvitationMotif({ accent, motif }: { accent: string; motif: TemplateAccent["motif"] }) {
  if (motif === "minimal") {
    return (
      <View pointerEvents="none" style={{ position: "absolute", left: 34, right: 34, top: 96, height: 1, backgroundColor: `${accent}33` }} />
    );
  }

  if (motif === "hanji") {
    return (
      <>
        <Text pointerEvents="none" style={{ position: "absolute", top: 72, right: 26, color: `${accent}22`, fontSize: 86, fontWeight: "900" }}>
          壽
        </Text>
        <View pointerEvents="none" style={{ position: "absolute", left: 34, right: 34, bottom: 82, height: 1, backgroundColor: `${accent}22` }} />
      </>
    );
  }

  if (motif === "confetti") {
    return (
      <>
        {["•", "✦", "•", "✧"].map((mark, index) => (
          <Text
            key={`${mark}-${index}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 84 + index * 28,
              right: index % 2 ? 34 : 58,
              color: `${accent}66`,
              fontSize: index % 2 ? 18 : 24
            }}
          >
            {mark}
          </Text>
        ))}
      </>
    );
  }

  return (
    <>
      <Text pointerEvents="none" style={{ position: "absolute", top: 74, left: 34, color: `${accent}66`, fontSize: 36 }}>
        {motif === "ribbon" ? "〰" : "✿"}
      </Text>
      <Text pointerEvents="none" style={{ position: "absolute", bottom: 58, right: 34, color: `${accent}55`, fontSize: 42 }}>
        {motif === "leaf" ? "⌇" : "✿"}
      </Text>
    </>
  );
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
        borderRadius: 22,
        backgroundColor: "rgba(246, 250, 244, 0.94)",
        borderWidth: 1,
        borderColor: "rgba(84,122,97,0.16)",
        padding: 14,
        gap: 10
      }}
    >
      <View
        style={{
          minHeight: 104,
          borderRadius: 18,
          backgroundColor: "#e8f0e5",
          overflow: "hidden",
          justifyContent: "center",
          padding: 14
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -20,
            top: 22,
            width: "118%",
            height: 1,
            backgroundColor: "rgba(84,122,97,0.16)",
            transform: [{ rotate: "-11deg" }]
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -20,
            top: 66,
            width: "118%",
            height: 1,
            backgroundColor: "rgba(84,122,97,0.16)",
            transform: [{ rotate: "9deg" }]
          }}
        />
        <Text style={{ color: "#6c865f", fontSize: 26, textAlign: "center" }}>⌖</Text>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "800", marginTop: 2, textAlign: "center" }}>
          {venueName || "장소 이름"}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3, textAlign: "center" }}>
          {venueAddress || "주소를 입력하면 지도 검색 링크가 표시됩니다."}
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

export function InvitationPreviewCard({ compact = false, payload }: { compact?: boolean; payload: InvitationPayload }) {
  const selectedTemplate = mobileTemplateGallery.find((item) => item.id === payload.templateId);
  const accent = templateAccents[selectedTemplate?.category ?? "wedding"] ?? templateAccents.wedding;
  const mapLinks = getInvitationMapLinks(payload);
  const names = `${payload.eventData.groom.name || "신랑"} ♡ ${payload.eventData.bride.name || "신부"}`;

  return (
    <View
      style={{
        minHeight: compact ? 620 : 760,
        borderRadius: 36,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: accent.border,
        backgroundColor: accent.background,
        shadowColor: "rgba(102, 82, 63, 0.18)",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 1,
        shadowRadius: 34,
        elevation: 7
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 8,
          alignSelf: "center",
          width: 120,
          height: compact ? 0 : 28,
          borderRadius: 14,
          backgroundColor: compact ? "transparent" : "#1a1a1a",
          zIndex: 2
        }}
      />
      <ImageBackground
        imageStyle={{
          resizeMode: "cover",
          opacity: payload.photos.backgroundUri ? 0.22 : 0
        }}
        source={payload.photos.backgroundUri ? { uri: payload.photos.backgroundUri } : undefined}
        style={{
          flex: 1,
          backgroundColor: accent.background,
          paddingHorizontal: compact ? 18 : 22,
          paddingTop: compact ? 24 : 58,
          paddingBottom: 28,
          justifyContent: "flex-start"
        }}
      >
        <View pointerEvents="none" style={{ position: "absolute", top: 52, left: -26, width: 190, height: 190, borderRadius: 999, backgroundColor: accent.wash }} />
        <View pointerEvents="none" style={{ position: "absolute", right: -40, bottom: 90, width: 230, height: 230, borderRadius: 999, backgroundColor: accent.wash }} />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: compact ? 36 : 72,
            left: 30,
            right: 30,
            bottom: 28,
            borderRadius: 34,
            borderWidth: 1,
            borderColor: accent.border,
            opacity: 0.78
          }}
        />
        <InvitationMotif accent={accent.accent} motif={accent.motif} />

        <View
          style={{
            flex: 1,
            borderRadius: 34,
            backgroundColor: accent.surface,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.72)",
            paddingHorizontal: compact ? 20 : 24,
            paddingTop: compact ? 28 : 34,
            paddingBottom: 24,
            alignItems: "center",
            gap: compact ? 12 : 14
          }}
        >
          <Text style={{ color: accent.accent, fontSize: 14, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
            {accent.headline}
          </Text>
          <Text style={{ color: accent.accent, fontSize: 12, fontWeight: "800", textAlign: "center" }}>
            {selectedTemplate?.badge || "초대장"}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800", textAlign: "center" }}>
            {selectedTemplate?.name || "초대장 미리보기"}
          </Text>
          {payload.photos.mainUri ? (
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="초대장 대표 사진"
              source={{ uri: payload.photos.mainUri }}
              style={{
                width: "100%",
                height: compact ? 136 : 170,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.86)"
              }}
            />
          ) : null}
          <Text style={{ color: theme.colors.text, fontSize: compact ? 27 : 30, fontWeight: "800", lineHeight: compact ? 36 : 40, textAlign: "center" }}>
            {names}
          </Text>
          <View style={{ width: 88, height: 1, backgroundColor: accent.border, marginTop: 2, marginBottom: 2 }} />
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700", lineHeight: 25, textAlign: "center" }}>
            {payload.eventDateTime || "행사 일시를 입력해 주세요."}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24, textAlign: "center" }}>
            {[payload.venueName, payload.venueAddress].filter(Boolean).join(" · ") || "예식장 정보를 입력해 주세요."}
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 26, textAlign: "center" }}>
            {payload.message || "초대 메시지를 입력하면 이곳에 반영됩니다."}
          </Text>
          <LiveMapPanel links={mapLinks} venueAddress={payload.venueAddress} venueName={payload.venueName} />
          {payload.location.transportNote ? (
            <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
              {payload.location.transportNote}
            </Text>
          ) : null}
        </View>
      </ImageBackground>
    </View>
  );
}
