import { Text, View } from "react-native";
import { theme } from "./theme";

export function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <View
      style={{
        minHeight: 180,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: "#fcf7f2",
        padding: theme.spacing.lg,
        gap: theme.spacing.sm
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>{title}</Text>
      <Text style={{ color: theme.colors.muted, lineHeight: 22, textAlign: "center" }}>{body}</Text>
    </View>
  );
}
