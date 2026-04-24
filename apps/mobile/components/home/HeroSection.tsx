import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import { PhoneMock } from "./PhoneMock";

type HeroSectionProps = {
  onStart: () => void;
  onBrowse: () => void;
};

const proofChips = ["실제 공유 화면 미리보기", "RSVP · 방명록 · 지도", "카카오톡 링크 공유"];

const sampleInvites = [
  {
    title: "로즈 프레임",
    names: "이준서 & 김은재",
    meta: "2026. 06. 21 SUN",
    color: "#EACFC8",
    accent: "#A96F62"
  },
  {
    title: "테디 벌룬",
    names: "이서준 첫 돌",
    meta: "2026. 05. 10 SAT",
    color: "#F6DE9F",
    accent: "#9B762C"
  },
  {
    title: "금빛 환갑",
    names: "환갑을 축하드립니다",
    meta: "2026. 07. 13 MON",
    color: "#E9D6B3",
    accent: "#8B5B35"
  }
];

export function HeroSection({ onBrowse, onStart }: HeroSectionProps) {
  return (
    <View
      style={{
        gap: 20
      }}
    >
      <View style={{ alignSelf: "flex-start", backgroundColor: "#FFF3EB", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 }}>
          청첩장 · 돌잔치 · 환갑 초대장을 한 곳에서
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Text
          style={{
            color: theme.colors.ink,
            fontSize: 34,
            fontWeight: "800",
            lineHeight: 43,
            letterSpacing: -0.6
          }}
        >
          보내고 싶은
          {"\n"}
          초대장을 먼저 보여주세요
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 26 }}>
          완성 예시를 고르고 이름, 날짜, 장소만 바꾸면 실제 공유 화면까지 바로 확인할 수 있습니다.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {sampleInvites.slice(0, 1).map((invite) => (
          <View
            key={invite.title}
            style={{
              minHeight: 170,
              borderRadius: 30,
              backgroundColor: "#FFFDF8",
              borderWidth: 1,
              borderColor: "rgba(139,115,85,0.14)",
              padding: 22,
              shadowColor: "rgba(79,55,36,0.16)",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 4,
              overflow: "hidden"
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -24,
                top: -18,
                width: 126,
                height: 126,
                borderRadius: 999,
                backgroundColor: invite.color,
                opacity: 0.58
              }}
            />
            <Text style={{ color: invite.accent, fontSize: 13, fontWeight: "800" }}>{invite.title}</Text>
            <Text style={{ color: theme.colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 39, marginTop: 26 }}>
              {invite.names}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginTop: 10 }}>{invite.meta}</Text>
          </View>
        ))}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {sampleInvites.slice(1).map((invite) => (
            <View
              key={invite.title}
              style={{
                flex: 1,
                minHeight: 116,
                borderRadius: 24,
                backgroundColor: "#FFFDF8",
                borderWidth: 1,
                borderColor: "rgba(139,115,85,0.12)",
                padding: 14,
                overflow: "hidden"
              }}
            >
              <View
                style={{
                  position: "absolute",
                  right: -22,
                  top: -16,
                  width: 70,
                  height: 70,
                  borderRadius: 999,
                  backgroundColor: invite.color,
                  opacity: 0.62
                }}
              />
              <Text style={{ color: invite.accent, fontSize: 11, fontWeight: "800" }}>{invite.title}</Text>
              <Text numberOfLines={2} style={{ color: theme.colors.ink, fontSize: 18, fontWeight: "800", lineHeight: 24, marginTop: 14 }}>
                {invite.names}
              </Text>
              <Text style={{ color: theme.colors.muted, fontSize: 11, lineHeight: 16, marginTop: 8 }}>{invite.meta}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {proofChips.map((chip, index) => (
          <Pill active={index === 0} key={chip} label={chip} />
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <Button accessibilityLabel="완성 예시 고르기" onPress={onBrowse}>완성 예시 고르기</Button>
        <Button accessibilityLabel="바로 만들기" onPress={onStart} variant="outline">정보부터 입력하기</Button>
      </View>

      <PhoneMock />
    </View>
  );
}
