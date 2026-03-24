import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking
} from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { supabase } from "../../lib/supabase";
import { signOut } from "../../lib/auth";

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        }
      }
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "계정 삭제 요청",
      "계정 삭제를 요청하시면 14일 이내에 모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제 요청",
          style: "destructive",
          onPress: () => {
            const siteUrl = Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";
            void Linking.openURL(`${siteUrl}/account/delete-request`);
          }
        }
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>이메일</Text>
          <Text style={styles.rowValue}>{email || "로그인 정보 없음"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>버전</Text>
          <Text style={styles.rowValue}>{appVersion}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>개발</Text>
          <Text style={styles.rowValue}>InviteHub</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>법적 고지</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => {
            const siteUrl = Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";
            void Linking.openURL(`${siteUrl}/privacy`);
          }}
        >
          <Text style={styles.linkText}>개인정보처리방침</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => {
            const siteUrl = Constants.expoConfig?.extra?.siteUrl ?? "https://invitehub.co.kr";
            void Linking.openURL(`${siteUrl}/terms`);
          }}
        >
          <Text style={styles.linkText}>이용약관</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>계정 삭제 요청</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  section: { paddingHorizontal: 24, paddingTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#888", marginBottom: 12, textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  rowLabel: { fontSize: 15, color: "#1a1a1a" },
  rowValue: { fontSize: 15, color: "#888" },
  linkRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  linkText: { fontSize: 15, color: "#3498db" },
  actions: { padding: 24, gap: 12, marginTop: 16 },
  logoutBtn: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  deleteBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffcdd2"
  },
  deleteText: { fontSize: 15, color: "#e74c3c" }
});
