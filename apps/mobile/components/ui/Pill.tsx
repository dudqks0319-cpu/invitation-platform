import { Text, View } from "react-native";
import { theme } from "./theme";

export function Pill({ active = false, label }: { active?: boolean; label: string }) {
  return (
    <View
      style={{
        borderRadius: 999,
        backgroundColor: active ? theme.colors.primary : "rgba(255,255,255,0.72)",
        borderWidth: active ? 0 : 1,
        borderColor: "rgba(139,115,85,0.18)",
        paddingHorizontal: 14,
        paddingVertical: 8
      }}
    >
      <Text style={{ color: active ? "#fff" : theme.colors.accent, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}
