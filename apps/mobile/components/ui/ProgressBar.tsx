import { Text, View } from "react-native";
import { theme } from "./theme";

export function ProgressBar({
  current,
  total
}: {
  current: number;
  total: number;
}) {
  const ratio = Math.min(Math.max(current / total, 0), 1);

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: "#eadfd5",
          overflow: "hidden"
        }}
      >
        <View
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            backgroundColor: theme.colors.accent
          }}
        />
      </View>
      <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
        Step {current}/{total}
      </Text>
    </View>
  );
}
