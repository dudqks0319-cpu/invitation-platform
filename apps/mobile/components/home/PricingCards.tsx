import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";

const pricingCards = [
  {
    badge: "체험",
    title: "무료 미리보기",
    price: "₩0",
    items: [
      "모든 템플릿 둘러보기",
      "회원가입 없이 빌더 체험",
      "미리보기 화면 확인"
    ]
  },
  {
    badge: "발행",
    title: "초대장 발행",
    price: "₩4,900",
    items: [
      "커피 한 잔 가격",
      "공개 링크 자동 생성",
      "RSVP + 방명록 + 지도 포함"
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
      <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 1.6 }}>
        가격
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700", lineHeight: 34 }}>
        커피 한 잔 가격으로
        {"\n"}
        초대장 완성
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
        체험은 무료, 발행은 4,900원 한 번이면 끝입니다.
      </Text>
      <View style={{ gap: 12 }}>
        {pricingCards.map((item, index) => (
          <Surface key={item.title}>
            <View
              style={{
                alignSelf: "flex-start",
                    backgroundColor: index === 1 ? theme.colors.primary : theme.colors.primaryLight,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6
              }}
            >
              <Text style={{ color: index === 1 ? "#fff" : theme.colors.accent, fontSize: 12, fontWeight: "700" }}>
                {item.badge}
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700" }}>{item.title}</Text>
            <Text style={{ color: theme.colors.accent, fontSize: 26, fontWeight: "700" }}>{item.price}</Text>
            <View style={{ gap: 8 }}>
              {item.items.map((line) => (
                <Text key={line} style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
                  • {line}
                </Text>
              ))}
            </View>
          </Surface>
        ))}
      </View>
    </View>
  );
}
