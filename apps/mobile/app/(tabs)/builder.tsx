import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

const SITE_URL =
  Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";

export default function BuilderTab() {
  function openWebBuilder() {
    void Linking.openURL(`${SITE_URL}/builder`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✏️</Text>
        <Text style={styles.title}>초대장 만들기</Text>
        <Text style={styles.description}>
          현재 초대장 제작은 웹 빌더에서 진행됩니다.{"\n"}
          아래 버튼을 눌러 웹 빌더를 열어주세요.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openWebBuilder}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>웹 빌더 열기</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          향후 업데이트에서 앱 내 네이티브 빌더가 추가됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", justifyContent: "center" },
  content: { alignItems: "center", padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#222", marginBottom: 12 },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24
  },
  primaryButton: {
    backgroundColor: "#4A90D9",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 16
  },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  hint: { fontSize: 12, color: "#AAA", textAlign: "center" }
});
