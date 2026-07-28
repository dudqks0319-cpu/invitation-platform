import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/components/ui/theme";

const processCards = [
  {
    step: "01",
    title: "완성 예시 선택",
    body: "결혼식, 돌잔치, 환갑처럼 행사에 맞는 무드를 먼저 고릅니다."
  },
  {
    step: "02",
    title: "핵심 정보 입력",
    body: "이름, 날짜, 장소, 안내 문구를 채우면 초대장에 바로 반영됩니다."
  },
  {
    step: "03",
    title: "검수 후 공유",
    body: "지도, 참석 여부, 방명록까지 확인한 뒤 링크로 전달합니다."
  }
];

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255, 253, 249, 0.92)",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 18,
        paddingVertical: 18,
        shadowColor: theme.shadow.card.shadowColor,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.55,
        shadowRadius: 22,
        elevation: 4,
        gap: 8
      }}
    >
      {children}
    </View>
  );
}

export function ProcessSteps() {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 1.6, textAlign: "center" }}>
        SIMPLE BUILDER
      </Text>
      <Text style={{ color: theme.colors.ink, fontSize: 24, fontWeight: "800", textAlign: "center" }}>고르고, 바꾸고, 공유하기</Text>
      <View style={{ gap: 12 }}>
        {processCards.map((item) => (
          <Surface key={item.step}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F0DEC8"
              }}
            >
              <Text style={{ color: "#A5743D", fontSize: 15, fontWeight: "800" }}>{item.step}</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>{item.title}</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>{item.body}</Text>
          </Surface>
        ))}
      </View>
    </View>
  );
}
