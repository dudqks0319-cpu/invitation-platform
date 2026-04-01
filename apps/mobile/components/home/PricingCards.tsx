import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { Button } from "@/components/ui/Button";
import { openWebBuilder } from "@/lib/share";

const pricingCards = [
  {
    badge: "무료",
    title: "현재 디자인 전체",
    price: "₩0",
    items: [
      "현재 공개 템플릿 전부 무료",
      "링크 · RSVP · 방명록 포함",
      "부담 없이 바로 시작 가능"
    ]
  },
  {
    badge: "옵션",
    title: "사진 애드온",
    price: "필요한 만큼",
    items: [
      "인물사진 추가 500원",
      "배경사진 추가 500원",
      "갤러리 10장당 1,000원"
    ]
  }
];

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255, 253, 249, 0.95)",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 18,
        paddingVertical: 18,
        shadowColor: theme.shadow.card.shadowColor,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 4,
        gap: 10
      }}
    >
      {children}
    </View>
  );
}

export function PricingCards() {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 1.6, textAlign: "center" }}>
        요금 안내
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700", lineHeight: 34, textAlign: "center" }}>
        현재 디자인은
        {"\n"}
        모두 무료예요
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24, textAlign: "center" }}>
        나중에 새로 공개되는 특별 디자인만 유료로 운영하고, 지금은 사진 옵션만 추가 비용이 있습니다.
      </Text>
      <View style={{ gap: 12 }}>
        {pricingCards.map((item, index) => (
          <View
            key={item.title}
            style={{
              borderWidth: index === 1 ? 2 : 0,
              borderColor: index === 1 ? "#C9935A" : "transparent",
              borderRadius: 24
            }}
          >
          <Surface>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: index === 1 ? "#C9935A" : "#e8f5e9",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6
              }}
            >
              <Text style={{ color: index === 1 ? "#fff" : "#2e7d32", fontSize: 12, fontWeight: "700" }}>
                {item.badge}
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700" }}>{item.title}</Text>
            <Text style={{ color: "#A5743D", fontSize: 32, fontWeight: "900" }}>{item.price}</Text>
            <View style={{ gap: 8 }}>
              {item.items.map((line) => (
                <Text key={line} style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
                  • {line}
                </Text>
              ))}
            </View>
            <Button
              accessibilityLabel={`${item.title} 시작하기`}
              onPress={() => {
                void openWebBuilder();
              }}
            >
              시작하기
            </Button>
          </Surface>
          </View>
        ))}
      </View>
    </View>
  );
}
