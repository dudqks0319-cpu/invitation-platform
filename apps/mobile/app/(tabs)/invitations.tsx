import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { shareInvitation, copyLink } from "@/lib/share";

type InvitationItem = {
  id: string;
  title: string;
  slug: string | null;
  status: string;
  updated_at: string;
};

export default function InvitationsTab() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("invitations")
      .select("id, title, slug, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setInvitations((data as InvitationItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  if (!loading && !userId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>💌</Text>
        <Text style={styles.emptyText}>로그인하면 초대장을 관리할 수 있습니다</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderItem({ item }: { item: InvitationItem }) {
    const statusLabel =
      item.status === "published" ? "발행됨"
        : item.status === "archived" ? "보관됨"
        : "초안";

    const statusColor =
      item.status === "published" ? "#27ae60"
        : item.status === "archived" ? "#888"
        : "#e67e22";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDate}>
          {new Date(item.updated_at).toLocaleDateString("ko-KR")}
        </Text>

        <View style={styles.cardActions}>
          {item.status === "published" && item.slug ? (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => void shareInvitation(item.slug!, item.title)}
              >
                <Text style={styles.actionBtnText}>공유</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  void copyLink(item.slug!);
                  Alert.alert("복사 완료", "링크가 클립보드에 복사되었습니다.");
                }}
              >
                <Text style={styles.actionBtnText}>링크 복사</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={invitations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadInvitations} />
      }
      ListEmptyComponent={
        loading ? null : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>아직 만든 초대장이 없습니다</Text>
          </View>
        )
      }
      contentContainerStyle={invitations.length === 0 ? { flex: 1 } : undefined}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: "#888", textAlign: "center", marginBottom: 16 },
  loginButton: {
    backgroundColor: "#4A90D9",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10
  },
  loginButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  cardDate: { fontSize: 12, color: "#999", marginBottom: 12 },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD"
  },
  actionBtnText: { fontSize: 13, color: "#555", fontWeight: "600" }
});
