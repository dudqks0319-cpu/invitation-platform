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
        minHeight: 50,
        borderRadius: theme.radius.pill,
        borderWidth: isPrimary ? 0 : 2,
        borderColor: theme.colors.primary,
        backgroundColor: disabled
          ? theme.colors.primaryLight
          : isPrimary
            ? theme.colors.primary
            : theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        shadowColor: isPrimary ? theme.shadow.heroButton.shadowColor : "transparent",
        shadowOffset: isPrimary ? theme.shadow.heroButton.shadowOffset : { width: 0, height: 0 },
        shadowOpacity: isPrimary ? theme.shadow.heroButton.shadowOpacity : 0,
        shadowRadius: isPrimary ? theme.shadow.heroButton.shadowRadius : 0,
        elevation: isPrimary ? theme.shadow.heroButton.elevation : 0
      }}
    >
      <Text
        style={{
          color: isPrimary ? "#fff" : theme.colors.primaryDark,
          fontSize: 15,
          fontWeight: "700"
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
