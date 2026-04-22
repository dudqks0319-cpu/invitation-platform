import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Pill } from "@/components/ui/Pill";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { deleteDraft, listDrafts } from "@/lib/drafts";
import { listRemoteInvitations } from "@/lib/invitations";
import { openInvitationPublicPage, openWebBuilder, shareInvitationLink } from "@/lib/share";
import { mobileTemplateGallery } from "@/lib/template-gallery";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";
import { useAuth } from "@/hooks/useAuth";

const sampleInvitationCards = [
  {
    id: "sample-wedding",
    templateId: "wedding-classic",
    title: "결혼합니다",
    names: "이준서 ♡ 김은재",
    detail: "2025.06.21 토요일 오후 2시\n더라움웨딩홀",
    dday: "D-45"
  },
  {
    id: "sample-dol",
    templateId: "dol-cute",
    title: "첫 생일을 맞이했어요",
    names: "이서준",
    detail: "2025.10.05 토요일 오후 1시\n그랜드파티룸",
    dday: "D-3"
  },
  {
    id: "sample-party",
    templateId: "wedding-rose-gold",
    title: "저희 결혼합니다",
    names: "민준 ♡ 수아",
    detail: "2025.09.13 토요일 오후 3시\nJK아트컨벤션",
    dday: "D-129"
  }
];

export default function MyInvitationsScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<MobileInvitationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { configMessage, configured, status, user } = useAuth();

  const load = useCallback(async () => {
    setError("");
    setRefreshing(true);

    try {
      const localItems = await listDrafts();

      if (configured && status === "authenticated" && user?.id) {
        const remoteItems = await listRemoteInvitations(user.id);
        const localOnly = localItems.filter(
          (localItem) => !remoteItems.some((remoteItem) => remoteItem.serverId === localItem.serverId && localItem.serverId)
        );

        setDrafts(
          [...remoteItems, ...localOnly].sort((a, b) => b.localUpdatedAt.localeCompare(a.localUpdatedAt))
        );
        return;
      }

      setDrafts(localItems);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "초대장 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [configured, status, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function getStatusSummary(draft: MobileInvitationDraft) {
    if (draft.serverId && draft.isDirty) {
      return "서버 저장본 있음 · 로컬 수정 대기";
    }

    if (draft.serverId) {
      return "서버 저장 완료";
    }

    return "로컬 초안만 존재";
  }

  function isLocalOnlyDraft(draft: MobileInvitationDraft) {
    return !draft.serverId;
  }

  function getPreviewSource(draft: MobileInvitationDraft) {
    const templateId = draft.payload.templateId || mobileTemplateGallery[0]?.id || "";
    return getBundledTemplatePreviewSource(templateId);
  }

  async function handleDeleteLocalDraft(draft: MobileInvitationDraft) {
    setPendingDeleteId(draft.localId);
    setMessage("");

    try {
      await deleteDraft(draft.localId);
      setDrafts((current) => current.filter((item) => item.localId !== draft.localId));
      setMessage("로컬 초안을 삭제했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로컬 초안을 삭제하지 못했습니다.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <Screen subtitle="저장한 초대장과 RSVP 현황을 한곳에서 관리합니다." title="내 초대장">
      <View style={{ gap: 12 }}>
        {message ? (
          <Card eyebrow="상태" title="작업 완료">
            <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{message}</Text>
          </Card>
        ) : null}
        {error ? <ErrorView description={error} title="목록 불러오기 실패" /> : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          {["전체", "작성중", "발송완료", "임시저장"].map((label, index) => (
            <Pressable
              accessibilityLabel={`${label} 초대장 보기`}
              key={label}
              onPress={() => {
                if (index === 0) void load();
              }}
              style={{ paddingVertical: 12, borderBottomWidth: index === 0 ? 1 : 0, borderBottomColor: theme.colors.text }}
            >
              <Text style={{ color: index === 0 ? theme.colors.text : theme.colors.muted, fontSize: 13 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {!configured && __DEV__ ? (
          <Text style={{ color: theme.colors.muted, lineHeight: 20, fontSize: 12 }}>{configMessage}</Text>
        ) : null}
        {refreshing ? <Text style={{ color: theme.colors.muted, fontSize: 12 }}>새로고침 중...</Text> : null}
      </View>

      {loading ? <Loading label="저장된 초안을 불러오는 중..." variant="cards" /> : null}
      {!loading && drafts.length === 0 ? (
        <View style={{ gap: 12 }}>
          {sampleInvitationCards.map((item) => {
            const previewSource = getBundledTemplatePreviewSource(item.templateId);

            return (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  borderRadius: 8,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  minHeight: 120,
                  shadowColor: theme.shadow.card.shadowColor,
                  shadowOffset: theme.shadow.card.shadowOffset,
                  shadowOpacity: theme.shadow.card.shadowOpacity,
                  shadowRadius: theme.shadow.card.shadowRadius,
                  elevation: theme.shadow.card.elevation
                }}
              >
                <View style={{ width: 104, backgroundColor: theme.colors.surfaceSoft }}>
                  {previewSource ? <Image alt="" source={previewSource} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
                </View>
                <View style={{ flex: 1, padding: 14, gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "800", flex: 1 }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: theme.colors.muted, fontSize: 20 }}>⋮</Text>
                  </View>
                  <Text style={{ color: theme.colors.text, fontSize: 13, lineHeight: 20 }}>{item.names}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
                    {item.detail}
                  </Text>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "800" }}>{item.dday}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      {drafts.map((draft) => {
        const previewSource = getPreviewSource(draft);
        return (
        <View
          key={draft.localId}
          style={{
            flexDirection: "row",
            borderRadius: 8,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            minHeight: 128,
            shadowColor: theme.shadow.card.shadowColor,
            shadowOffset: theme.shadow.card.shadowOffset,
            shadowOpacity: theme.shadow.card.shadowOpacity,
            shadowRadius: theme.shadow.card.shadowRadius,
            elevation: theme.shadow.card.elevation
          }}
        >
          <View style={{ width: 104, backgroundColor: theme.colors.surfaceSoft }}>
            {previewSource ? <Image alt="" source={previewSource} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
          </View>
          <View style={{ flex: 1, padding: 14, gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "800", flex: 1 }} numberOfLines={1}>
                {draft.payload.title || "제목 없는 초대장"}
              </Text>
              <Text style={{ color: theme.colors.muted, fontSize: 20 }}>⋮</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 13, lineHeight: 20 }}>
              {draft.payload.eventData.groom.name || "신랑"} ♡ {draft.payload.eventData.bride.name || "신부"}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
              {[draft.payload.eventDateTime, draft.payload.venueName].filter(Boolean).join("\n") || "일정과 장소를 입력해 주세요."}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "800" }}>
              {draft.payload.isPublished ? "D-Day" : draft.serverId ? "D-45" : "D-3"}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <Pill active={Boolean(draft.payload.isPublished)} label={draft.payload.isPublished ? "공개 중" : getStatusSummary(draft)} />
            </View>
            <View style={{ marginTop: 4 }}>
              <Link asChild href={{ pathname: "/invitation/[id]/index", params: { id: draft.serverId ?? draft.localId } }}>
                <Button accessibilityLabel="초대장 운영 화면으로 이동" variant="outline">
                  관리하기
                </Button>
              </Link>
            </View>
            {draft.payload.isPublished && draft.payload.share.slug ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    accessibilityLabel="공개 링크 공유"
                    onPress={() => {
                      setMessage("");
                      setError("");
                      void shareInvitationLink(draft.payload.share.slug, draft.payload.title || "InviteHub 초대장")
                        .then(() => setMessage("공유 시트를 열었습니다."))
                        .catch((caught) =>
                          setError(caught instanceof Error ? caught.message : "공유 시트를 열지 못했습니다.")
                        );
                    }}
                    variant="outline"
                  >
                    공유하기
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    accessibilityLabel="웹 공개 페이지 열기"
                    onPress={() => {
                      setMessage("");
                      setError("");
                      void openInvitationPublicPage(draft.payload.share.slug)
                        .then(() => setMessage("웹 공개 페이지를 열었습니다."))
                        .catch((caught) =>
                          setError(caught instanceof Error ? caught.message : "웹 공개 페이지를 열지 못했습니다.")
                        );
                    }}
                    variant="outline"
                  >
                    웹에서 확인
                  </Button>
                </View>
              </View>
            ) : draft.serverId ? (
              <Button
                accessibilityLabel="웹 빌더 열기"
                onPress={() => {
                  setMessage("");
                  setError("");
                  void openWebBuilder({ invitationId: draft.serverId })
                    .then(() => setMessage("웹 빌더를 열었습니다."))
                    .catch((caught) =>
                      setError(caught instanceof Error ? caught.message : "웹 빌더를 열지 못했습니다.")
                    );
                }}
                variant="outline"
              >
                웹에서 이어서 편집
              </Button>
            ) : null}
            {isLocalOnlyDraft(draft) ? (
              <Pressable
                accessibilityLabel="로컬 초안 삭제"
                onPress={() => void handleDeleteLocalDraft(draft)}
                style={{ alignItems: "center", paddingVertical: 6 }}
              >
                <Text style={{ color: theme.colors.primaryDark, fontSize: 13, fontWeight: "700" }}>
                  {pendingDeleteId === draft.localId ? "삭제 중..." : "로컬 초안 삭제"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        );
      })}
      <Button accessibilityLabel="새 초대장 만들기" onPress={() => router.push("/templates")} variant="outline">
        초대장 만들기
      </Button>
    </Screen>
  );
}
