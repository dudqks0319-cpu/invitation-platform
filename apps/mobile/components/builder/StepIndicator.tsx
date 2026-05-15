import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { theme } from "@/components/ui/theme";

const STEP_ROUTES = [
  "/builder/step1-basic",
  "/builder/step2-people",
  "/builder/step3-photos",
  "/builder/step4-accounts",
  "/builder/step5-location"
] as const;

const STEP_ACCESSIBILITY_DESTINATIONS = [
  "기본 정보로",
  "인물 정보로",
  "사진 설정으로",
  "계좌 정보로",
  "오시는 길로"
] as const;

export function StepIndicator({
  current,
  localId,
  title,
  total = 5
}: {
  current: number;
  localId?: string;
  title: string;
  total?: number;
}) {
  const stepCount = Math.min(total, STEP_ROUTES.length);

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
        {Array.from({ length: stepCount }, (_, index) => {
          const step = index + 1;
          const active = step === current;
          const route = STEP_ROUTES[index] ?? STEP_ROUTES[0];
          const stepDestination = STEP_ACCESSIBILITY_DESTINATIONS[index] ?? `단계 ${step}로`;
          return (
            <Link
              asChild
              key={step}
              href={{
                pathname: route,
                params: localId ? { localId } : {}
              }}
            >
              <Pressable
                accessibilityLabel={`STEP ${step} ${stepDestination} 이동`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                hitSlop={6}
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
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
              </Pressable>
            </Link>
          );
        })}
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>
        {title}
      </Text>
      <ProgressBar current={current} total={total} />
      <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20 }}>
        입력값은 단계마다 자동 저장됩니다.
      </Text>
    </View>
  );
}
