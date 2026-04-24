import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";

const featureCards = [
  {
    title: "실시간 초대장",
    body: "입력한 이름, 날짜, 장소가 공유 화면에 바로 반영됩니다."
  },
  {
    title: "하객 안내 완성",
    body: "지도, 참석 응답, 방명록을 초대장 안에서 함께 보여줍니다."
  },
  {
    title: "사진은 선택적으로",
    body: "대표 사진, 배경, 갤러리는 필요한 행사에만 더합니다."
  },
  {
    title: "공유 전 검수",
    body: "발행 전에 모바일 화면에서 실제 초대장 구성을 확인합니다."
  }
];

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255, 253, 249, 0.92)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 24,
        paddingVertical: 24,
        shadowColor: theme.shadow.card.shadowColor,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 22,
        elevation: 4,
        gap: 8,
        width: "48%"
      }}
    >
      {children}
    </View>
  );
}

export function FeatureGrid() {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 1.6, textAlign: "center" }}>
        INVITATION FLOW
      </Text>
      <Text style={{ color: theme.colors.ink, fontSize: 24, fontWeight: "800", lineHeight: 34, textAlign: "center" }}>
        초대장을 예쁘게 만들고,
        {"\n"}
        하객 안내까지 끝내기
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24, textAlign: "center" }}>
        설명보다 중요한 것은 실제로 공유될 화면입니다. 필요한 정보만 모아 한 번에 검수할 수 있게 구성했습니다.
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
        {featureCards.map((item, index) => (
          <Surface key={item.title}>
            <Text style={{ color: theme.colors.primary, fontSize: 28, fontWeight: "700", textAlign: "center" }}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", textAlign: "center" }}>{item.title}</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24, textAlign: "center" }}>{item.body}</Text>
          </Surface>
        ))}
      </View>
    </View>
  );
}
