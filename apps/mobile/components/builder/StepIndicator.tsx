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
    <View
      style={{
        gap: 12,
        backgroundColor: "#FFF8F1",
        borderWidth: 1,
        borderColor: "rgba(143,111,82,0.18)",
        borderRadius: 18,
        padding: 16
      }}
    >
      <Text style={{ color: "#9d6f48", fontSize: 12, fontWeight: "700", letterSpacing: 2 }}>빌더 진행 단계</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const active = step === current;
          return (
            <View
              key={step}
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? "#4f3a28" : "rgba(143,111,82,0.2)",
                backgroundColor: active ? "#4f3a28" : "#fff"
              }}
            >
              <Text
                style={{
                  color: active ? "#fff8f1" : theme.colors.muted,
                  fontSize: 12,
                  fontWeight: "700",
                  textAlign: "center"
                }}
              >
                STEP {step}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>
        {title}
      </Text>
      <ProgressBar current={current} total={total} />
    </View>
  );
}
