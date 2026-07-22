import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TemplateCatalogProvider } from "@/hooks/useTemplateCatalog";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TemplateCatalogProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#f8f2eb"
            }
          }}
        />
      </TemplateCatalogProvider>
    </SafeAreaProvider>
  );
}
