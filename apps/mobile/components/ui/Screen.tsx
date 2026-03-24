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
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.md
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            accessibilityRole="header"
            style={{ color: theme.colors.text, fontSize: 32, fontWeight: "700" }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>
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
