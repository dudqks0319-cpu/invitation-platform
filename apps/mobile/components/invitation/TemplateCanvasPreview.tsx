import { ImageBackground, Text, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "@/components/ui/theme";
import { formatInviteDateTime } from "@/lib/date-time";
import type { InvitationPayload } from "@/lib/invitation-shared";
import { mobileTemplateGallery } from "@/lib/template-gallery";
import { getBundledTemplateCanvasSource } from "@/lib/template-preview-source";

type TemplateAccent = {
  background: string;
  border: string;
  accent: string;
  headline: string;
};

type TemplateCanvasScale = "full" | "compact" | "thumbnail";

type TemplateCanvasLayoutConfig = {
  top: DimensionValue;
  bottom: DimensionValue;
  side: number;
  gap: number;
  headline: number;
  badge: number;
  title: number;
  titleLine: number;
  date: number;
  dateLine: number;
  venue: number;
  venueLine: number;
  message: number;
  messageLine: number;
  messageTop: number;
  dividerWidth: number;
  dividerMargin: number;
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

const scaleConfig: Record<TemplateCanvasScale, TemplateCanvasLayoutConfig> = {
  full: {
    top: "22%",
    bottom: "26%",
    side: 50,
    gap: 12,
    headline: 14,
    badge: 12,
    title: 28,
    titleLine: 38,
    date: 16,
    dateLine: 24,
    venue: 15,
    venueLine: 23,
    message: 14,
    messageLine: 22,
    messageTop: 24,
    dividerWidth: 92,
    dividerMargin: 4
  },
  compact: {
    top: "21%",
    bottom: "28%",
    side: 42,
    gap: 9,
    headline: 13,
    badge: 12,
    title: 24,
    titleLine: 33,
    date: 14,
    dateLine: 21,
    venue: 13,
    venueLine: 20,
    message: 12,
    messageLine: 19,
    messageTop: 18,
    dividerWidth: 92,
    dividerMargin: 2
  },
  thumbnail: {
    top: "18%",
    bottom: "31%",
    side: 28,
    gap: 3,
    headline: 8,
    badge: 7,
    title: 15,
    titleLine: 20,
    date: 8,
    dateLine: 12,
    venue: 8,
    venueLine: 12,
    message: 7,
    messageLine: 10,
    messageTop: 5,
    dividerWidth: 48,
    dividerMargin: 1
  }
};

const generatedScaleConfig: Record<TemplateCanvasScale, TemplateCanvasLayoutConfig> = {
  full: {
    ...scaleConfig.full,
    top: "28%",
    bottom: "42%",
    gap: 8,
    messageTop: 10
  },
  compact: {
    ...scaleConfig.compact,
    top: "27%",
    bottom: "43%",
    gap: 7,
    messageTop: 8
  },
  thumbnail: {
    ...scaleConfig.thumbnail,
    top: "25%",
    bottom: "42%",
    gap: 2,
    messageTop: 3
  }
};

const safeTextProps = {
  allowFontScaling: false,
  adjustsFontSizeToFit: true,
  ellipsizeMode: "tail" as const
};

export function getTemplateAccent(eventType?: string) {
  return templateAccents[eventType ?? "wedding"] ?? templateAccents.wedding;
}

export function TemplateCanvasPreview({
  payload,
  scale = "full",
  style
}: {
  payload: InvitationPayload;
  scale?: TemplateCanvasScale;
  style?: StyleProp<ViewStyle>;
}) {
  const selectedTemplate = mobileTemplateGallery.find((item) => item.id === payload.templateId);
  const accent = getTemplateAccent(selectedTemplate?.category ?? payload.eventType);
  const templateCanvasSource = getBundledTemplateCanvasSource(payload.templateId);
  const displayDateTime = formatInviteDateTime(payload.eventDateTime) || payload.eventDateTime || "행사 일시를 입력해 주세요.";
  const groomName = payload.eventData.groom.name || "신랑";
  const brideName = payload.eventData.bride.name || "신부";
  const isWedding = (selectedTemplate?.category ?? payload.eventType) === "wedding";
  const primaryTitle = isWedding ? `${groomName}  ♡  ${brideName}` : payload.title || selectedTemplate?.badge || "초대합니다";
  const usesGeneratedCanvas = selectedTemplate?.previewPath?.includes("/generated-2026/") ?? false;
  const config = (usesGeneratedCanvas ? generatedScaleConfig : scaleConfig)[scale];
  const showMessage = scale !== "thumbnail" && Boolean(payload.message);

  return (
    <ImageBackground
      imageStyle={{
        resizeMode: "contain"
      }}
      source={templateCanvasSource ?? undefined}
      style={[
        {
          width: "100%",
          aspectRatio: 768 / 1376,
          backgroundColor: accent.background
        },
        style
      ]}
    >
      <View
        style={{
          position: "absolute",
          left: config.side,
          right: config.side,
          top: config.top,
          bottom: config.bottom,
          alignItems: "center",
          justifyContent: "center",
          gap: config.gap
        }}
      >
        <Text
          maxFontSizeMultiplier={1}
          minimumFontScale={0.78}
          numberOfLines={1}
          style={{ color: accent.accent, fontSize: config.headline, fontStyle: "italic", lineHeight: config.headline + 6, textAlign: "center" }}
          {...safeTextProps}
        >
          {accent.headline}
        </Text>
        <Text
          maxFontSizeMultiplier={1}
          minimumFontScale={0.8}
          numberOfLines={1}
          style={{ color: accent.accent, fontSize: config.badge, fontWeight: "800", textAlign: "center" }}
          {...safeTextProps}
        >
          {selectedTemplate?.badge || "초대장"}
        </Text>
        <Text
          maxFontSizeMultiplier={1}
          minimumFontScale={0.62}
          numberOfLines={2}
          style={{ color: theme.colors.text, fontSize: config.title, fontWeight: "900", lineHeight: config.titleLine, textAlign: "center" }}
          {...safeTextProps}
        >
          {primaryTitle}
        </Text>
        <View style={{ width: config.dividerWidth, height: 1, backgroundColor: accent.border, marginVertical: config.dividerMargin }} />
        <Text
          maxFontSizeMultiplier={1}
          minimumFontScale={0.68}
          numberOfLines={2}
          style={{ color: theme.colors.text, fontSize: config.date, fontWeight: "800", lineHeight: config.dateLine, textAlign: "center" }}
          {...safeTextProps}
        >
          {displayDateTime}
        </Text>
        <Text
          maxFontSizeMultiplier={1}
          minimumFontScale={0.68}
          numberOfLines={2}
          style={{ color: theme.colors.muted, fontSize: config.venue, fontWeight: "700", lineHeight: config.venueLine, textAlign: "center" }}
          {...safeTextProps}
        >
          {payload.venueName || "장소를 입력해 주세요."}
        </Text>
        {showMessage ? (
          <Text
            maxFontSizeMultiplier={1}
            minimumFontScale={0.7}
            numberOfLines={3}
            style={{ color: theme.colors.muted, fontSize: config.message, lineHeight: config.messageLine, marginTop: config.messageTop, textAlign: "center" }}
            {...safeTextProps}
          >
            {payload.message}
          </Text>
        ) : null}
      </View>
    </ImageBackground>
  );
}
