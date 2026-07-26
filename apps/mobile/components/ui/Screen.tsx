import { PropsWithChildren } from "react";
import { type Href, usePathname, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { OfflineBanner } from "./OfflineBanner";
import { theme } from "./theme";

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  footer?: string;
  showBackButton?: boolean;
  backFallbackHref?: Href;
}>;

export function Screen({
  backFallbackHref = "/",
  children,
  footer,
  showBackButton = true,
  subtitle,
  title
}: ScreenProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldShowBackButton = showBackButton && pathname !== "/";

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(backFallbackHref);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={{ flex: 1 }}
      >
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.xl * 2,
            gap: theme.spacing.md
          }}
        >
          <OfflineBanner />
          <View style={{ gap: theme.spacing.sm }}>
            <View
              style={{
                minHeight: 44,
                flexDirection: "row",
                alignItems: "center",
                gap: 12
              }}
            >
              {shouldShowBackButton ? (
                <Pressable
                  accessibilityLabel="이전 화면으로 돌아가기"
                  accessibilityRole="button"
                  onPress={handleBack}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "800", lineHeight: 26 }}>‹</Text>
                </Pressable>
              ) : null}
              <Text
                accessibilityRole="header"
                style={{
                  color: theme.colors.text,
                  flex: 1,
                  fontSize: 32,
                  fontWeight: "700",
                  lineHeight: 40
                }}
              >
                {title}
              </Text>
            </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
