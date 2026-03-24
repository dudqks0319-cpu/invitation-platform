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

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        minHeight: 48,
        borderRadius: 16,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: theme.colors.border,
        backgroundColor: isPrimary ? theme.colors.accent : theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16
      }}
    >
      <Text
        style={{
          color: isPrimary ? "#fff" : theme.colors.text,
          fontSize: 15,
          fontWeight: "700"
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
