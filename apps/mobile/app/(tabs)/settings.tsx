import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { signOut, requestAccountDeletion } from "@/lib/auth";

export default function SettingsTab() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        }
      }
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "계정 삭제",
      "계정을 삭제하면 모든 초대장과 데이터가 영구 삭제됩니다. 계속하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제 요청",
          style: "destructive",
          onPress: async () => {
            const result = await requestAccountDeletion();
            Alert.alert("안내", result.message);
          }
        }
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>

        {email ? (
          <>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>이메일</Text>
              <Text style={styles.rowValue}>{email}</Text>
            </View>
            <TouchableOpacity style={styles.row} onPress={handleSignOut}>
              <Text style={[styles.rowLabel, { color: "#e74c3c" }]}>
                로그아웃
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.rowLabel, { color: "#4A90D9" }]}>
              로그인
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>버전</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>개발</Text>
          <Text style={styles.rowValue}>InviteHub</Text>
        </View>
      </View>

      {email ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <Text style={[styles.rowLabel, { color: "#e74c3c" }]}>
              계정 삭제 요청
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },
  section: {
    backgroundColor: "#FFF",
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E8E8E8"
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#F0F0F0"
  },
  rowLabel: { fontSize: 15, color: "#333" },
  rowValue: { fontSize: 15, color: "#888" }
});
