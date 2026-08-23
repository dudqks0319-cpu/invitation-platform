import { Pressable, Text, View } from "react-native";
import * as ExpoLinking from "expo-linking";
import { getPrivacyUrl, getSupportUrl, getTermsUrl } from "@/lib/web-links";

export function SiteFooter() {
  return (
    <View
      style={{
        backgroundColor: "#2C2C2C",
        paddingHorizontal: 24,
        paddingVertical: 48,
        alignItems: "center",
        borderRadius: 28,
        marginTop: 8
      }}
    >
      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>💌 오삼오삼</Text>
      <View style={{ flexDirection: "row", gap: 24, marginVertical: 20 }}>
        {[
          { label: "이용약관", url: getTermsUrl() },
          { label: "개인정보처리방침", url: getPrivacyUrl() },
          { label: "지원", url: getSupportUrl() }
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              void ExpoLinking.openURL(item.url);
            }}
          >
            <Text style={{ color: "#999", fontSize: 13 }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: "#666", fontSize: 12, marginTop: 20 }}>© 2026 오삼오삼. All rights reserved.</Text>
    </View>
  );
}
