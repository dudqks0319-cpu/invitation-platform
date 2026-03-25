import { PropsWithChildren } from "react";
import { Pressable, Text } from "react-native";
import { theme } from "./theme";

type ButtonProps = PropsWithChildren<{
  variant?: "primary" | "outline";
  accessibilityLabel: string;
  onPress?: () => void;
}>;

export function Button({
  accessibilityLabel,
  children,
  onPress,
  variant = "primary"
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const disabled = !onPress;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        minHeight: 52,
        borderRadius: 18,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: theme.colors.border,
        backgroundColor: disabled
          ? theme.colors.accentSoft
          : isPrimary
            ? theme.colors.accent
            : theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        shadowColor: isPrimary ? theme.shadow.card.shadowColor : "transparent",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isPrimary ? 0.6 : 0,
        shadowRadius: 20,
        elevation: isPrimary ? 4 : 0
      }}
    >
      <Text
        style={{
          color: isPrimary ? "#fff" : theme.colors.text,
          fontSize: 15,
          fontWeight: "700",
          letterSpacing: 0.2
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
