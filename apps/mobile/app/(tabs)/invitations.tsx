import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { supabase } from "../../lib/supabase";
import { shareInvitation, copyInvitationLink } from "../../lib/share";

type InvitationItem = {
  id: string;
  slug: string | null;
  title: string;
  status: string;
  event_type: string;
  updated_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "발행됨", color: "#2e7d32", bg: "#e8f5e9" },
  draft: { label: "초안", color: "#e65100", bg: "#fff3e0" },
  archived: { label: "보관됨", color: "#757575", bg: "#f5f5f5" }
};

export default function InvitationsScreen() {
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvitations = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("invitations")
      .select("id, slug, title, status, event_type, updated_at")
      .order("updated_at", { ascending: false });

    setInvitations((data as InvitationItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  async function onRefresh() {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  }

  function handleShare(item: InvitationItem) {
    if (!item.slug) {
      Alert.alert("알림", "발행된 초대장만 공유할 수 있습니다.");
      return;
    }
    void shareInvitation(item.slug, item.title);
  }

  function handleCopy(item: InvitationItem) {
    if (!item.slug) {
      Alert.alert("알림", "발행된 초대장만 링크를 복사할 수 있습니다.");
      return;
    }
    void copyInvitationLink(item.slug);
  }

  function renderItem({ item }: { item: InvitationItem }) {
    const statusInfo = STATUS_MAP[item.status] ?? STATUS_MAP.draft;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.title || "제목 없음"}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.badgeText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardMeta}>
          {item.event_type === "wedding" ? "결혼식" : item.event_type}
          {item.slug ? ` · /i/${item.slug}` : ""}
        </Text>

        <Text style={styles.cardDate}>
          수정: {new Date(item.updated_at).toLocaleDateString("ko-KR")}
        </Text>

        {item.status === "published" && item.slug ? (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleShare(item)}
            >
              <Text style={styles.actionText}>공유</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnOutline}
              onPress={() => handleCopy(item)}
            >
              <Text style={styles.actionTextOutline}>링크 복사</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>불러오는 중...</Text>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>아직 만든 초대장이 없습니다.</Text>
        </View>
      }
      contentContainerStyle={invitations.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyContainer: { flexGrow: 1 },
  emptyText: { color: "#888", fontSize: 14 },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: "500" },
  cardMeta: { fontSize: 13, color: "#666", marginTop: 6 },
  cardDate: { fontSize: 12, color: "#999", marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionTextOutline: { color: "#555", fontSize: 13 }
});
