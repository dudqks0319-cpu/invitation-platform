import { ImageBackground, Text, View } from "react-native";
import { Pill } from "@/components/ui/Pill";
import { theme } from "@/components/ui/theme";
import heroPreview from "@/assets/web-hero-preview.jpg";

export function PhoneMock() {
  return (
    <View
      style={{
        alignSelf: "center",
        width: 214,
        height: 430,
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
          imageStyle={{ resizeMode: "cover", opacity: 0.26 }}
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 28,
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
              backgroundColor: "rgba(251,245,238,0.72)"
            }}
          />
          <Text style={{ color: "#74665a", fontSize: 11, letterSpacing: 2.2, textAlign: "center" }}>
            Wedding Invitation
          </Text>
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: 34,
              fontWeight: "600",
              lineHeight: 42,
              marginTop: 16,
              textAlign: "center"
            }}
          >
            Minjun &amp; Sua
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 23, marginTop: 12, textAlign: "center" }}>
            소중한 분들을 초대합니다
          </Text>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
              <Pill label="2026. 05. 10" />
              <Pill label="서울 더파인홀" />
            </View>
          </ImageBackground>
        </View>
      </View>
  );
}
