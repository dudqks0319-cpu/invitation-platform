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
        borderRadius: theme.radius.lg,
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
            color: theme.colors.accent,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase"
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700", lineHeight: 28 }}>{title}</Text>
      {children}
    </View>
  );
}
