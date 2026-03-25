import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { theme } from "./theme";

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  footer?: string;
}>;

export function Screen({ children, footer, subtitle, title }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -10,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: theme.colors.blush,
          opacity: 0.22
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 120,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: 999,
          backgroundColor: theme.colors.eucalyptus,
          opacity: 0.18
        }}
      />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.md
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            accessibilityRole="header"
            style={{ color: theme.colors.text, fontSize: 32, fontWeight: "700", lineHeight: 40 }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 24 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
        {footer ? (
          <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20 }}>
            {footer}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
