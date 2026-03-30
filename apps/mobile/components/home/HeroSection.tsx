import { Pressable, Text, View } from "react-native";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import { PhoneMock } from "./PhoneMock";

type HeroSectionProps = {
  onStart: () => void;
  onBrowse: () => void;
};

const proofChips = [
  "50+ 디자인 템플릿",
  "결혼·돌잔치·생일 맞춤",
  "링크 하나로 참석 확인까지"
];

export function HeroSection({ onBrowse, onStart }: HeroSectionProps) {
  return (
    <View
      style={{
        gap: 20
      }}
    >
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 8
        }}
      >
        <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700" }}>
          당신의 소중한 날을 위한 초대장
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 34,
            fontWeight: "700",
            lineHeight: 44
          }}
        >
          마음을 담은 초대장,
          {"\n"}
          5분이면 완성
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 26 }}>
          감성적인 디자인과 간편한 기능을 하나로 담았습니다. 템플릿을 고르고 정보를 입력하면, 바로 공유할 수 있는 모바일 초대장이 완성됩니다.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {proofChips.map((chip, index) => (
          <Pill active={index === 0} key={chip} label={chip} />
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <Pressable
          accessibilityLabel="무료로 시작하기"
          onPress={onStart}
          style={{
            backgroundColor: theme.colors.accent,
            borderRadius: 18,
            minHeight: 54,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.shadow.card.shadowColor,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.8,
            shadowRadius: 24,
            elevation: 5
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>무료로 시작하기</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="디자인 둘러보기"
          onPress={onBrowse}
          style={{
            borderRadius: 18,
            minHeight: 54,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: theme.colors.accent,
            backgroundColor: "transparent"
          }}
        >
          <Text style={{ color: theme.colors.accent, fontSize: 16, fontWeight: "700" }}>디자인 둘러보기</Text>
        </Pressable>
      </View>

      <PhoneMock />
    </View>
  );
}
