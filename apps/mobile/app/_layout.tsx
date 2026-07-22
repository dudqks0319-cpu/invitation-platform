import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TemplateCatalogProvider } from "@/hooks/useTemplateCatalog";
import { TemplateDiscoveryStateProvider } from "@/hooks/useTemplateDiscoveryState";

export default function RootLayout() {
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
