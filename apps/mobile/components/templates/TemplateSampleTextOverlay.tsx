import { Text, View } from "react-native";

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

const templateSampleSafeZones = {
  wedding: { top: "25%", bottom: "40%" },
  dol: { top: "22%", bottom: "43%" },
  hwangap: { top: "16%", bottom: "54%" },
  bridal: { top: "24%", bottom: "41%" },
  birthday: { top: "20%", bottom: "45%" },
  housewarming: { top: "15%", bottom: "50%" },
  baby: { top: "25%", bottom: "40%" },
  graduation: { top: "22%", bottom: "43%" },
  business: { top: "22%", bottom: "43%" }
} as const;

export function TemplateSampleTextOverlay({ category }: { category: string }) {
  const copy = templateSampleCopy[category as keyof typeof templateSampleCopy] ?? templateSampleCopy.wedding;
  const safeZone = templateSampleSafeZones[category as keyof typeof templateSampleSafeZones] ?? templateSampleSafeZones.wedding;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 8,
        right: 8,
        top: safeZone.top,
        bottom: safeZone.bottom,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "rgba(126,91,65,0.76)",
          fontSize: 8,
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
          fontSize: 8,
          fontWeight: "800",
          marginTop: 2,
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
          fontSize: 16,
          fontWeight: "900",
          lineHeight: 18,
          marginTop: 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.title}
      </Text>
      <View style={{ width: 36, height: 1, backgroundColor: "rgba(198,144,114,0.42)", marginVertical: 3 }} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.56}
        style={{
          color: "#2B2B2B",
          fontSize: 8,
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
          fontSize: 8,
          fontWeight: "800",
          marginTop: 2,
          textAlign: "center",
          width: "100%"
        }}
      >
        {copy.venue}
      </Text>
    </View>
  );
}
