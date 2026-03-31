import { ImageBackground, Text, View } from "react-native";
import { theme } from "@/components/ui/theme";
import heroPreview from "@/assets/web-hero-preview.jpg";

export function PhoneMock() {
  return (
    <View
      style={{
        alignSelf: "center",
        width: 228,
        height: 456,
        borderRadius: 36,
        backgroundColor: "#1f1c1a",
        padding: 10,
        shadowColor: theme.shadow.card.shadowColor,
        shadowOffset: { width: 0, height: 22 },
        shadowOpacity: 0.9,
        shadowRadius: 34,
        elevation: 7
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 30,
          overflow: "hidden",
          backgroundColor: "#fbf5ee"
        }}
      >
        <ImageBackground
          source={heroPreview}
          imageStyle={{ resizeMode: "cover", opacity: 0.34 }}
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 32,
            paddingBottom: 24,
            justifyContent: "center",
            backgroundColor: "#fbf5ee"
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(251,245,238,0.52)"
            }}
          />
          <Text style={{ color: "#74665a", fontSize: 12, letterSpacing: 2.2, textAlign: "center" }}>
            Wedding Invitation
          </Text>
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: 28,
              fontWeight: "500",
              fontStyle: "italic",
              lineHeight: 36,
              marginTop: 16,
              textAlign: "center"
            }}
          >
            Minjun &amp; Sua
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: "center" }}>
            소중한 분들을 초대합니다
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
            {["2026. 05. 10", "서울 더파인홀"].map((label) => (
              <View
                key={label}
                style={{
                  backgroundColor: "rgba(255,255,255,0.82)",
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(139,115,85,0.12)",
                  paddingHorizontal: 12,
                  paddingVertical: 7
                }}
              >
                <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: "700" }}>{label}</Text>
              </View>
            ))}
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}
