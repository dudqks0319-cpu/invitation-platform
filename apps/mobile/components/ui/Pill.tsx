import { Text, View } from "react-native";
import { theme } from "./theme";

export function Pill({ active = false, label }: { active?: boolean; label: string }) {
  return (
    <View
      style={{
        borderRadius: 999,
        backgroundColor: active ? theme.colors.accent : "#efe3d5",
        paddingHorizontal: 12,
        paddingVertical: 8
      }}
    >
      <Text style={{ color: active ? "#fff" : theme.colors.muted, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
    </View>
  );
}
