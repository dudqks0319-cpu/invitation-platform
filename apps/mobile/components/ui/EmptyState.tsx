import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "./Button";
import { theme } from "./theme";

export function EmptyState({
  actionLabel,
  body,
  onAction,
  title
}: {
  actionLabel?: string;
  body: string;
  onAction?: () => void;
  title: string;
}) {
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
      <View
        style={{
          width: 96,
          height: 96,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.colors.blush
          }}
        />
        <View
          style={{
            width: 58,
            height: 72,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          }}
        >
          <View style={{ width: 28, height: 4, borderRadius: 999, backgroundColor: "#E6D4C2" }} />
          <View style={{ width: 22, height: 4, borderRadius: 999, backgroundColor: "#F0E1D1" }} />
          <View style={{ width: 30, height: 4, borderRadius: 999, backgroundColor: "#E6D4C2" }} />
        </View>
      </View>
      <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>{title}</Text>
      <Text style={{ color: theme.colors.muted, lineHeight: 22, textAlign: "center" }}>{body}</Text>
      {actionLabel ? (
        <View style={{ width: "100%", marginTop: 8 }}>
          <Button accessibilityLabel={actionLabel} onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
