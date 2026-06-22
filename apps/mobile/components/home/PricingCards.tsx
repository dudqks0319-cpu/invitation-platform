import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import { Button } from "@/components/ui/Button";
import { openWebBuilder } from "@/lib/share";
const pricingCards = [
  {
    badge: "무료",
    title: "초대장 제작",
    price: "무료",
    items: [
      "현재 공개 템플릿 전부 무료",
      "메인 · 배경 · 갤러리 사진 포함",
      "링크 공유 · 참석 여부 · 방명록 포함"
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
      <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 1.6, textAlign: "center" }}>
        PUBLISH OPTION
      </Text>
      <Text style={{ color: theme.colors.ink, fontSize: 24, fontWeight: "800", lineHeight: 34, textAlign: "center" }}>
        무료로 만들고,
        {"\n"}
        사진까지 넣어 발행
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24, textAlign: "center" }}>
        템플릿 선택, 사진 업로드, RSVP, 방명록까지 현재 제공 기능은 무료로 시작할 수 있습니다.
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
