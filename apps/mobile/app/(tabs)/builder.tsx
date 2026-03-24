import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import Constants from "expo-constants";

export default function BuilderScreen() {
  const siteUrl = Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";

  function openWebBuilder() {
    void Linking.openURL(`${siteUrl}/builder`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>초대장 만들기</Text>
        <Text style={styles.description}>
          웹 빌더에서 아름다운 초대장을 만들 수 있습니다.{"\n"}
          템플릿 선택, 사진 업로드, 정보 입력을{"\n"}
          한 곳에서 편리하게 진행하세요.
        </Text>

        <TouchableOpacity style={styles.button} onPress={openWebBuilder}>
          <Text style={styles.buttonText}>웹 빌더 열기</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Safari에서 초대장 빌더가 열립니다.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center" },
  content: { alignItems: "center", padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 },
  description: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32
  },
  button: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 12, color: "#aaa", marginTop: 12 }
});
