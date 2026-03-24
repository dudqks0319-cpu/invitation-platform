import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function HomeTab() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [stats, setStats] = useState({ invitations: 0, rsvps: 0, visits: 0 });
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setUserName(null);
      return;
    }

    const meta = user.user_metadata ?? {};
    const name =
      (meta.full_name as string) ||
      (meta.name as string) ||
      user.email?.split("@")[0] ||
      "사용자";
    setUserName(name);

    const { count: invitationCount } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setStats((prev) => ({ ...prev, invitations: invitationCount ?? 0 }));
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          {userName ? `안녕하세요, ${userName}님!` : "InviteHub에 오신 것을 환영합니다"}
        </Text>
        <Text style={styles.greetingSub}>
          소중한 순간을 특별하게 초대하세요.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push("/(tabs)/builder")}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaEmoji}>✨</Text>
        <Text style={styles.ctaText}>새 초대장 만들기</Text>
        <Text style={styles.ctaSub}>템플릿 선택 → 정보 입력 → 발행</Text>
      </TouchableOpacity>

      {!userName && (
        <TouchableOpacity
          style={styles.loginPrompt}
          onPress={() => router.push("/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.loginText}>
            로그인하면 초대장을 저장하고 관리할 수 있습니다
          </Text>
          <Text style={styles.loginLink}>Apple로 로그인 →</Text>
        </TouchableOpacity>
      )}

      {userName && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.invitations}</Text>
            <Text style={styles.statLabel}>내 초대장</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.rsvps}</Text>
            <Text style={styles.statLabel}>RSVP 응답</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.visits}</Text>
            <Text style={styles.statLabel}>방문</Text>
          </View>
        </View>
      )}

      <View style={styles.features}>
        <Text style={styles.sectionTitle}>InviteHub 특징</Text>
        {[
          { emoji: "💍", text: "한국 결혼 문화에 특화 (양가 정보, 축의금 계좌)" },
          { emoji: "📊", text: "실시간 RSVP 관리 + 엑셀 다운로드" },
          { emoji: "🗺️", text: "네이버 지도 연동 + 교통 안내" },
          { emoji: "📱", text: "카카오톡, SNS에서 예쁜 미리보기" }
        ].map((item) => (
          <View style={styles.featureRow} key={item.text}>
            <Text style={styles.featureEmoji}>{item.emoji}</Text>
            <Text style={styles.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  greeting: { padding: 24, paddingBottom: 8 },
  greetingText: { fontSize: 22, fontWeight: "800", color: "#222" },
  greetingSub: { fontSize: 14, color: "#888", marginTop: 4 },
  ctaButton: {
    margin: 16,
    padding: 24,
    backgroundColor: "#4A90D9",
    borderRadius: 16,
    alignItems: "center"
  },
  ctaEmoji: { fontSize: 32, marginBottom: 8 },
  ctaText: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  ctaSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  loginPrompt: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8"
  },
  loginText: { fontSize: 14, color: "#666", marginBottom: 8 },
  loginLink: { fontSize: 14, fontWeight: "600", color: "#4A90D9" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8"
  },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#333" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 4 },
  features: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#333" },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  featureEmoji: { fontSize: 20, marginRight: 12, width: 28, textAlign: "center" },
  featureText: { fontSize: 14, color: "#555", flex: 1, lineHeight: 20 }
});
