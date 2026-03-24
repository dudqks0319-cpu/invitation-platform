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
import { supabase } from "../../lib/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ invitations: 0, rsvps: 0, visits: 0 });
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    if (!supabase) return;

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;

    const name =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.display_name as string) ||
      user.email?.split("@")[0] ||
      "사용자";
    setUserName(name);

    const { count: invitationCount } = await supabase
      .from("invitations")
      .select("*", { count: "exact", head: true });

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <Text style={styles.greeting}>
          안녕하세요{userName ? `, ${userName}님` : ""} 👋
        </Text>
        <Text style={styles.subtitle}>
          소중한 순간을 특별하게 초대하세요.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push("/(tabs)/builder")}
      >
        <Text style={styles.ctaText}>새 초대장 만들기</Text>
      </TouchableOpacity>

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
          <Text style={styles.statLabel}>총 방문</Text>
        </View>
      </View>

      <View style={styles.features}>
        <Text style={styles.sectionTitle}>주요 기능</Text>
        {[
          { icon: "✉️", title: "감성 초대장", desc: "아름다운 템플릿으로 초대장을 만들어요" },
          { icon: "📊", title: "RSVP 관리", desc: "참석 여부를 한눈에 확인하세요" },
          { icon: "📖", title: "방명록", desc: "소중한 축하 메시지를 받아보세요" },
          { icon: "🔗", title: "간편 공유", desc: "카카오톡, 문자로 바로 공유하세요" }
        ].map((feature) => (
          <View style={styles.featureItem} key={feature.title}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  hero: { padding: 24, paddingTop: 16 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 4 },
  ctaButton: {
    marginHorizontal: 24,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center"
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 24
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center"
  },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#1a1a1a" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 4 },
  features: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#1a1a1a" },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  featureIcon: { fontSize: 28, marginRight: 12 },
  featureTextWrap: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  featureDesc: { fontSize: 13, color: "#888", marginTop: 2 }
});
