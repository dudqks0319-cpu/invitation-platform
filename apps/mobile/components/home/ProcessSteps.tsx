import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";

const processCards = [
  {
    step: "01",
    title: "디자인 선택",
    body: "마음에 드는 무료 디자인을 고르면 바로 빌더가 시작됩니다."
  },
  {
    step: "02",
    title: "내용 입력",
    body: "이름, 장소, 문구를 채우고 필요하면 사진 옵션만 더해 완성도를 높입니다."
  },
  {
    step: "03",
    title: "바로 발행 · 공유",
    body: "완성한 초대장은 링크로 공유하고, 응답과 방명록도 함께 받을 수 있습니다."
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
      <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 1.6, textAlign: "center" }}>
        이렇게 진행돼요
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700", textAlign: "center" }}>디자인 고르고, 내용 넣고, 원하는 옵션만</Text>
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
