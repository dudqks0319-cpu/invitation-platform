import { theme } from "./theme";

export type ButtonVariant = "primary" | "outline";

export function getButtonStyleConfig(variant: ButtonVariant, disabled: boolean) {
  if (variant === "primary") {
    return disabled
      ? {
          backgroundColor: "#E4D3C1",
          borderColor: "#E4D3C1",
          textColor: "#7E674F",
          shadowEnabled: false
        }
      : {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          textColor: "#fff",
          shadowEnabled: true
        };
  }

  return disabled
    ? {
        backgroundColor: theme.colors.surfaceSoft,
        borderColor: "#D9C8B8",
        textColor: "#A0866E",
        shadowEnabled: false
      }
    : {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary,
        textColor: theme.colors.primaryDark,
        shadowEnabled: false
      };
}
