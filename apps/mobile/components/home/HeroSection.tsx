import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import { PhoneMock } from "./PhoneMock";

type HeroSectionProps = {
  onStart: () => void;
  onBrowse: () => void;
};

const proofChips = [
  "현재 디자인 전부 무료",
  "사진 옵션만 필요한 만큼",
  "링크 · RSVP · 방명록 한 번에"
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
          지금 있는 디자인, 전부 무료
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 30,
            fontWeight: "700",
            lineHeight: 40
          }}
        >
          예쁜 초대장,
          {"\n"}
          지금은 무료로 시작
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 26 }}>
          현재 공개된 디자인은 모두 무료예요. 필요한 경우에만 사진 옵션을 더해, 부담 없이 시작하고 정성껏 완성해 보세요.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {proofChips.map((chip, index) => (
          <Pill active={index === 0} key={chip} label={chip} />
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <Button accessibilityLabel="무료로 시작하기" onPress={onStart}>무료로 시작하기</Button>
        <Button accessibilityLabel="디자인 둘러보기" onPress={onBrowse} variant="outline">디자인 둘러보기</Button>
      </View>

      <PhoneMock />
    </View>
  );
}
