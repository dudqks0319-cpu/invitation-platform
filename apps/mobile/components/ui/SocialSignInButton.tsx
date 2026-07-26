import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";

type SocialProvider = "google" | "apple" | "kakao";

type SocialSignInButtonProps = {
  provider: SocialProvider;
  accessibilityLabel: string;
  loadingLabel: string;
  onPress?: () => void;
};

const providerConfig = {
  google: {
    title: "Google로 로그인",
    backgroundColor: "#FFFFFF",
    borderColor: "#DADCE0",
    textColor: "#202124",
    badgeBackgroundColor: "#FFFFFF",
    badgeBorderColor: "#DADCE0",
    shadowColor: "rgba(60, 64, 67, 0.12)"
  },
  apple: {
    title: "Apple로 로그인",
    backgroundColor: "#111111",
    borderColor: "#111111",
    textColor: "#FFFFFF",
    badgeBackgroundColor: "rgba(255,255,255,0.12)",
    badgeBorderColor: "rgba(255,255,255,0.08)",
    shadowColor: "rgba(17, 17, 17, 0.22)"
  },
  kakao: {
    title: "Kakao로 로그인",
    backgroundColor: "#FEE500",
    borderColor: "#F2D800",
    textColor: "#191600",
    badgeBackgroundColor: "rgba(25,22,0,0.06)",
    badgeBorderColor: "rgba(25,22,0,0.08)",
    shadowColor: "rgba(191, 168, 0, 0.18)"
  }
} as const;

export function SocialSignInButton({
  accessibilityLabel,
  loadingLabel,
  onPress,
  provider
}: SocialSignInButtonProps) {
  const disabled = !onPress;
  const config = providerConfig[provider];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 58,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
        shadowColor: config.shadowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: disabled ? 0 : 1,
        shadowRadius: 10,
        elevation: disabled ? 0 : 1
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: config.badgeBorderColor,
          backgroundColor: config.badgeBackgroundColor,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ProviderBadge provider={provider} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: config.textColor,
            fontSize: 15,
            fontWeight: "700"
          }}
        >
          {loadingLabel}
        </Text>
      </View>
      <Ionicons
        color={provider === "apple" ? "rgba(255,255,255,0.78)" : "rgba(44,44,44,0.38)"}
        name="chevron-forward"
        size={18}
      />
    </Pressable>
  );
}

function ProviderBadge({ provider }: { provider: SocialProvider }) {
  if (provider === "google") {
    return (
      <Ionicons
        color="#4285F4"
        name="logo-google"
        size={18}
        style={{
          textShadowColor: "rgba(234, 67, 53, 0.18)",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 0.5
        }}
      />
    );
  }

  if (provider === "apple") {
    return <Ionicons color="#FFFFFF" name="logo-apple" size={18} />;
  }

  return (
    <View
      style={{
        width: 18,
        height: 16,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <View
        style={{
          width: 18,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#191600"
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -1,
          right: 2,
          width: 6,
          height: 6,
          backgroundColor: "#191600",
          transform: [{ rotate: "45deg" }]
        }}
      />
      <Text
      style={{
        position: "absolute",
        top: 1,
        color: "#FEE500",
        fontSize: 8,
        fontWeight: "800"
      }}
    >
        K
      </Text>
    </View>
  );
}
