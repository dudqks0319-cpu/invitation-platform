import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { appFonts } from "@/components/ui/typography";
import { TemplateCatalogProvider } from "@/hooks/useTemplateCatalog";
import { TemplateDiscoveryStateProvider } from "@/hooks/useTemplateDiscoveryState";
import gowunBatangBold from "@/assets/fonts/GowunBatang-Bold.ttf";
import gowunBatangRegular from "@/assets/fonts/GowunBatang-Regular.ttf";
import pretendardBlack from "@/assets/fonts/Pretendard-Black.otf";
import pretendardBold from "@/assets/fonts/Pretendard-Bold.otf";
import pretendardExtraBold from "@/assets/fonts/Pretendard-ExtraBold.otf";
import pretendardMedium from "@/assets/fonts/Pretendard-Medium.otf";
import pretendardRegular from "@/assets/fonts/Pretendard-Regular.otf";
import pretendardSemiBold from "@/assets/fonts/Pretendard-SemiBold.otf";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [appFonts.bodyRegular]: pretendardRegular,
    [appFonts.bodyMedium]: pretendardMedium,
    [appFonts.bodySemiBold]: pretendardSemiBold,
    [appFonts.bodyBold]: pretendardBold,
    [appFonts.bodyExtraBold]: pretendardExtraBold,
    [appFonts.bodyBlack]: pretendardBlack,
    [appFonts.invitationRegular]: gowunBatangRegular,
    [appFonts.invitationBold]: gowunBatangBold
  });

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#f8f2eb" }} />;
  }

  return (
    <SafeAreaProvider>
      <TemplateCatalogProvider>
        <TemplateDiscoveryStateProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "#f8f2eb"
              }
            }}
          />
        </TemplateDiscoveryStateProvider>
      </TemplateCatalogProvider>
    </SafeAreaProvider>
  );
}
