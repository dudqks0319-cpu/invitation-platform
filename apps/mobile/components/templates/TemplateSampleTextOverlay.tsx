import { Text, View } from "react-native";
import { resolveTemplateTextSafeArea } from "@invitehub/shared";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";

const templateSampleCopy = {
  wedding: {
    headline: "We are getting married",
    badge: "결혼식",
    title: "이준서 ♥ 김은재",
    date: "2026.09.20 SUN 12:30",
    venue: "라비에벨 가든홀"
  },
  dol: {
    headline: "Our first birthday",
    badge: "돌잔치",
    title: "도윤이의 첫돌",
    date: "2026.09.20 SUN 12:30",
    venue: "라움 패밀리홀"
  },
  hwangap: {
    headline: "Happy 60th Birthday",
    badge: "환갑잔치",
    title: "아버지의 환갑",
    date: "2026.10.18 SUN 12:00",
    venue: "더채플 연회장"
  },
  bridal: {
    headline: "Bride to be",
    badge: "브라이덜샤워",
    title: "은채의 브라이덜샤워",
    date: "2026.08.29 SAT 14:00",
    venue: "가든 스튜디오"
  },
  birthday: {
    headline: "Happy Birthday",
    badge: "생일파티",
    title: "서윤이의 생일",
    date: "2026.09.12 SAT 17:00",
    venue: "루프탑 파티룸"
  },
  housewarming: {
    headline: "Welcome Home",
    badge: "집들이",
    title: "새집에 초대합니다",
    date: "2026.09.05 SAT 18:00",
    venue: "서울 성동구 새빛로 53"
  },
  baby: {
    headline: "Welcome, Little One",
    badge: "베이비샤워",
    title: "아기를 기다려요",
    date: "2026.10.03 SAT 13:00",
    venue: "클라우드 스튜디오"
  },
  graduation: {
    headline: "Congratulations",
    badge: "졸업파티",
    title: "졸업을 축하해요",
    date: "2027.02.19 FRI 11:00",
    venue: "한빛대학교 강당"
  },
  business: {
    headline: "Grand Opening",
    badge: "비즈니스",
    title: "OPENING DAY",
    date: "2026.09.25 FRI 18:30",
    venue: "오삼오삼 라운지"
  }
} as const;

export function TemplateSampleTextOverlay({
  template
}: {
  template: MobileTemplateGalleryItem;
}) {
  const copy = templateSampleCopy[template.category as keyof typeof templateSampleCopy] ?? templateSampleCopy.wedding;
  const safeArea = template.textSafeArea ?? resolveTemplateTextSafeArea({
    templateId: template.id,
    category: template.category,
    textPlacement: template.textPlacement
  });
  const compressed = safeArea.bottomPct - safeArea.topPct <= 22;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${safeArea.leftPct}%`,
        right: `${100 - safeArea.rightPct}%`,
        top: `${safeArea.topPct}%`,
        bottom: `${100 - safeArea.bottomPct}%`,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: safeArea.backdrop === "light" ? "rgba(255,252,244,0.82)" : "transparent",
        borderRadius: safeArea.backdrop === "light" ? 8 : 0,
        paddingHorizontal: safeArea.backdrop === "light" ? 5 : 0,
        paddingVertical: safeArea.backdrop === "light" ? 3 : 0
      }}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(126,91,65,0.76)",
          fontSize: compressed ? 7 : 8,
          fontStyle: "italic",
          fontWeight: "600",
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.headline}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(198,144,114,0.9)",
          fontSize: compressed ? 7 : 8,
          fontWeight: "800",
          marginTop: compressed ? 1 : 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.badge}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "#2B2B2B",
          fontSize: compressed ? 13 : 16,
          fontWeight: "900",
          lineHeight: compressed ? 14 : 18,
          marginTop: compressed ? 1 : 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.title}
      </Text>
      <View style={{ width: 36, height: 1, backgroundColor: "rgba(198,144,114,0.42)", marginVertical: compressed ? 1 : 3 }} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "#2B2B2B",
          fontSize: compressed ? 7 : 8,
          fontWeight: "900",
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.date}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(55,55,55,0.78)",
          fontSize: compressed ? 7 : 8,
          fontWeight: "800",
          marginTop: compressed ? 1 : 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.venue}
      </Text>
    </View>
  );
}
