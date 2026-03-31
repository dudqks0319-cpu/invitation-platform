import { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import { theme } from "./theme";

type CardProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
}>;

export function Card({ children, eyebrow, title }: CardProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
        shadowColor: theme.shadow.card.shadowColor,
        shadowOffset: theme.shadow.card.shadowOffset,
        shadowOpacity: theme.shadow.card.shadowOpacity,
        shadowRadius: theme.shadow.card.shadowRadius,
        elevation: theme.shadow.card.elevation
      }}
    >
      {eyebrow ? (
        <Text
          style={{
            color: theme.colors.primaryDark,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.6,
            textTransform: "uppercase"
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text style={{ color: "#58432f", fontSize: 18, fontWeight: "700", lineHeight: 26 }}>{title}</Text>
      {children}
    </View>
  );
}
