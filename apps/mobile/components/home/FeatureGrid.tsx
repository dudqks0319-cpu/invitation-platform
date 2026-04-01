import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";

const featureCards = [
  {
    title: "현재 디자인은 무료",
    body: "지금 공개된 템플릿은 비용 걱정 없이 바로 골라서 시작할 수 있습니다."
  },
  {
    title: "옵션만 필요한 만큼",
    body: "인물사진, 배경사진, 갤러리처럼 원하는 요소만 가볍게 더할 수 있습니다."
  },
  {
    title: "응답과 방명록까지",
    body: "초대만 보내는 게 아니라 참석 여부와 축하 메시지까지 한 번에 받을 수 있습니다."
  },
  {
    title: "링크 하나로 공유",
    body: "카카오톡, 문자, SNS 어디든 링크 하나로 초대장과 필요한 안내를 함께 전달합니다."
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
      <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 1.6, textAlign: "center" }}>
        가볍게 시작하세요
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700", lineHeight: 34, textAlign: "center" }}>
        기본은 무료,
        {"\n"}
        필요한 만큼만 더하기
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24, textAlign: "center" }}>
        초대장 자체는 무료로 만들고, 사진 옵션만 선택적으로 추가하는 방식으로 부담을 낮췄습니다.
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
