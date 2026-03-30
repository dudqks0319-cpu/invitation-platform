import { Text, View } from "react-native";
import { theme } from "@/components/ui/theme";

const featureCards = [
  {
    title: "5분이면 완성",
    body: "템플릿을 고르고 날짜와 장소를 적으면, 링크로 바로 보낼 수 있는 초대장이 완성됩니다."
  },
  {
    title: "참석 여부 자동 수집",
    body: "하객이 초대장에서 바로 RSVP를 남기면, 호스트는 참석 인원을 한눈에 확인할 수 있습니다."
  },
  {
    title: "감성 디자인 템플릿",
    body: "결혼식, 돌잔치, 생일, 집들이까지. 행사 분위기에 맞는 디자인을 고르고 바로 적용할 수 있습니다."
  },
  {
    title: "링크 하나로 공유",
    body: "카카오톡, 문자, SNS 어디든. 링크 하나로 초대장과 지도, 계좌 안내, 방명록까지 함께 전달됩니다."
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

export function FeatureGrid() {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700", letterSpacing: 1.6 }}>
        왜 InviteHub인가요
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700", lineHeight: 34 }}>
        예쁘기만 한 초대장이 아니라,
        {"\n"}
        보내기까지 편한 초대장
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
        디자인부터 참석 관리까지, 초대장에 필요한 핵심 기능만 깔끔하게 담았습니다.
      </Text>
      <View style={{ gap: 12 }}>
        {featureCards.map((item, index) => (
          <Surface key={item.title}>
            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700" }}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>{item.title}</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>{item.body}</Text>
          </Surface>
        ))}
      </View>
    </View>
  );
}
