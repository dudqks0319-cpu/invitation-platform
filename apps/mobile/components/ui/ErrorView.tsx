import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "./theme";

export function ErrorView({
  description,
  title = "문제가 발생했습니다"
}: {
  description: string;
  title?: string;
}) {
  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "#e7c6bf",
        backgroundColor: "#fff5f3",
        padding: theme.spacing.lg,
        gap: theme.spacing.sm
      }}
    >
      <Text style={{ color: "#8f3a2f", fontSize: 18, fontWeight: "700" }}>{title}</Text>
      <Text style={{ color: "#7f5f57", lineHeight: 22 }}>{description}</Text>
    </View>
  );
}
