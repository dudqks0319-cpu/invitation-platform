import { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
import { OfflineBanner } from "./OfflineBanner";
import { theme } from "./theme";

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  footer?: string;
}>;

export function Screen({ children, footer, subtitle, title }: ScreenProps) {
  const isWeb = Platform.OS === "web";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.xl * 2,
            gap: theme.spacing.sm,
            alignItems: isWeb ? "center" : "stretch"
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isWeb ? 760 : undefined,
              gap: theme.spacing.md
            }}
          >
            <OfflineBanner />
            <View style={{ gap: theme.spacing.xs }}>
              <Text
                accessibilityRole="header"
                style={{
                  color: theme.colors.text,
                  fontSize: 22,
                  fontWeight: "700",
                  lineHeight: 30,
                  textAlign: "center"
                }}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 22, textAlign: "center" }}>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
