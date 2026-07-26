import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/components/ui/theme";
import { Button } from "@/components/ui/Button";
import { openWebBuilder } from "@/lib/share";
import { isPaidPublishingEnabled } from "@/lib/release-flags";

const pricingCards = [
  {
    badge: "무료",
    title: "기본 청첩장",
    price: "무료",
    items: [
      "현재 공개 템플릿 전부 무료",
      "링크 공유 · 참석 여부 · 방명록 포함",
      "사진 없이 바로 발행 가능"
    ]
  },
  {
    badge: "유료",
    title: "사진 포함 발행권",
    price: "₩3,300",
    items: [
      "프로필 사진 포함",
      "배경 사진 포함",
      "갤러리 사진 전체 포함",
      "한 번 구매로 초대장 1건 발행"
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
  const paidPublishingEnabled = isPaidPublishingEnabled();
  const visiblePricingCards = paidPublishingEnabled ? pricingCards : pricingCards.slice(0, 1);

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 1.6, textAlign: "center" }}>
        PUBLISH OPTION
      </Text>
      <Text style={{ color: theme.colors.ink, fontSize: 24, fontWeight: "800", lineHeight: 34, textAlign: "center" }}>
        먼저 만들고,
        {"\n"}
        사진이 필요할 때만 선택
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24, textAlign: "center" }}>
        {paidPublishingEnabled
          ? "가격 안내는 짧게 유지하고, 사용자가 완성 화면을 먼저 판단할 수 있게 했습니다."
          : "첫 제출 버전은 사진 없는 무료 발행에 집중합니다."}
      </Text>
      <View style={{ gap: 12 }}>
        {visiblePricingCards.map((item, index) => (
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
      {!paidPublishingEnabled ? (
        <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 21, textAlign: "center" }}>
          사진 포함 발행권은 App Store 상품 준비 후 다시 활성화합니다.
        </Text>
      ) : null}
    </View>
  );
}
