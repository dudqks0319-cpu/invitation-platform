import { ActivityIndicator, Text, View } from "react-native";
import { theme } from "./theme";

export function Loading({
  label = "불러오는 중...",
  variant = "spinner"
}: {
  label?: string;
  variant?: "spinner" | "cards";
}) {
  if (variant === "cards") {
    return (
      <View style={{ gap: theme.spacing.md }}>
        {Array.from({ length: 3 }, (_, index) => (
          <View
            key={index}
            style={{
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.lg,
              gap: theme.spacing.sm
            }}
          >
            <View
              style={{
                width: "45%",
                height: 12,
                borderRadius: 999,
                backgroundColor: "#EFE4D8"
              }}
            />
            <View
              style={{
                width: "72%",
                height: 18,
                borderRadius: 999,
                backgroundColor: "#F3EADF"
              }}
            />
            <View
              style={{
                width: "100%",
                height: 12,
                borderRadius: 999,
                backgroundColor: "#F6EEE6"
              }}
            />
            <View
              style={{
                width: "88%",
                height: 12,
                borderRadius: 999,
                backgroundColor: "#F6EEE6"
              }}
            />
          </View>
        ))}
        <Text style={{ color: theme.colors.muted, textAlign: "center" }}>{label}</Text>
      </View>
    );
  }

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
