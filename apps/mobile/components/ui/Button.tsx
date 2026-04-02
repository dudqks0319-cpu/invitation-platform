import { PropsWithChildren } from "react";
import { Pressable, Text } from "react-native";
import { getButtonStyleConfig, type ButtonVariant } from "./button-styles";
import { theme } from "./theme";

type ButtonProps = PropsWithChildren<{
  variant?: ButtonVariant;
  accessibilityLabel: string;
  onPress?: () => void;
}>;

export function Button({
  accessibilityLabel,
  children,
  onPress,
  variant = "primary"
}: ButtonProps) {
  const disabled = !onPress;
  const config = getButtonStyleConfig(variant, disabled);
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        minHeight: 50,
        borderRadius: theme.radius.pill,
        borderWidth: isPrimary ? 0 : 2,
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        shadowColor: config.shadowEnabled ? theme.shadow.heroButton.shadowColor : "transparent",
        shadowOffset: config.shadowEnabled ? theme.shadow.heroButton.shadowOffset : { width: 0, height: 0 },
        shadowOpacity: config.shadowEnabled ? theme.shadow.heroButton.shadowOpacity : 0,
        shadowRadius: config.shadowEnabled ? theme.shadow.heroButton.shadowRadius : 0,
        elevation: config.shadowEnabled ? theme.shadow.heroButton.elevation : 0
      }}
    >
      <Text
        style={{
          color: config.textColor,
          fontSize: 15,
          fontWeight: "700"
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
