import { Text, View } from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { theme } from "@/components/ui/theme";

export function StepIndicator({
  current,
  title,
  total = 5
}: {
  current: number;
  title: string;
  total?: number;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "700" }}>
        빌더 진행
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>
        {title}
      </Text>
      <ProgressBar current={current} total={total} />
    </View>
  );
}
