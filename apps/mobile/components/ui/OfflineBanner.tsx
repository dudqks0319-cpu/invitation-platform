import { View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { theme } from "./theme";

export function OfflineBanner() {
  const { isOffline, message } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View
      style={{
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.sm,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: "#E7C6BF",
        backgroundColor: "#FFF2ED",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12
      }}
    >
      <Text style={{ color: "#8F3A2F", fontSize: 13, fontWeight: "700" }}>오프라인 상태</Text>
      <Text style={{ color: "#7F5F57", lineHeight: 20, marginTop: 4 }}>{message}</Text>
    </View>
  );
}
