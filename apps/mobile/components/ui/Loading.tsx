import { ActivityIndicator, Text, View } from "react-native";
import { theme } from "./theme";

export function Loading({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <View
      style={{
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm
      }}
    >
      <ActivityIndicator color={theme.colors.accent} />
      <Text style={{ color: theme.colors.muted }}>{label}</Text>
    </View>
  );
}
