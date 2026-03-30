import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { PricingCards } from "@/components/home/PricingCards";
import { theme } from "@/components/ui/theme";
import { openWebBuilder, openWebTemplates } from "@/lib/share";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -80,
          right: -30,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: theme.colors.blush,
          opacity: 0.22
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 44
        }}
      >
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: "rgba(255,255,255,0.92)",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: "700" }}>💌 InviteHub</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              accessibilityLabel="로그인"
              onPress={() => {
                void openWebTemplates();
              }}
              style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.accent,
                paddingHorizontal: 14,
                paddingVertical: 8
              }}
            >
              <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "700" }}>로그인</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="시작하기"
              onPress={() => {
                void openWebBuilder();
              }}
              style={{
                borderRadius: 999,
                backgroundColor: theme.colors.accent,
                paddingHorizontal: 14,
                paddingVertical: 8
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>시작하기</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 24, gap: 36 }}>
          <HeroSection
            onBrowse={() => {
              void openWebTemplates();
            }}
            onStart={() => {
              void openWebBuilder();
            }}
          />
          <FeatureGrid />
          <ProcessSteps />
          <PricingCards />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
