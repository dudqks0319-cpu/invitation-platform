import { useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { InvitationPreviewCard } from "@/components/invitation/InvitationPreviewCard";
import { Loading } from "@/components/ui/Loading";
import { Pill } from "@/components/ui/Pill";
import { Screen } from "@/components/ui/Screen";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { deleteDraft, loadDraft, saveDraft } from "@/lib/drafts";
import { deleteRemoteInvitation, loadRemoteInvitation, saveDraftToSupabase } from "@/lib/invitations";
import { getPublicInvitationUrl, openInvitationPublicPage, openWebBuilder, shareInvitationLink } from "@/lib/share";
import { useAuth } from "@/hooks/useAuth";
import { useMapApiConfig } from "@/hooks/useMapApiConfig";
import { getInvitationMapLinks } from "@/lib/map-links";

async function openMapUrl(url: string, fallbackUrl?: string) {
  if (!url) return;

  try {
    await Linking.openURL(url);
  } catch {
    if (fallbackUrl) {
      await Linking.openURL(fallbackUrl);
    }
  }
}

export default function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { configMessage, configured, status, user } = useAuth();
  const mapApi = useMapApiConfig();
  const publicUrl = draft?.payload.share.slug ? getPublicInvitationUrl(draft.payload.share.slug) : "";
  const shareSlug = draft?.payload.share.slug ?? "";
  const mapLinks = draft ? getInvitationMapLinks(draft.payload) : null;

  async function loadServerVersion() {
    if (!draft?.serverId || !configured || status !== "authenticated" || !user?.id) {
      setError("서버 버전을 불러오려면 로그인과 원격 저장본이 필요합니다.");
      return;
    }

    setError("");
    setMessage("");
    const remote = await loadRemoteInvitation(draft.serverId, user.id);
    if (!remote) {
      setError("서버 버전을 찾지 못했습니다.");
      return;
    }

    await saveDraft(remote);
    setDraft(remote);
    setMessage("서버 버전으로 다시 불러왔습니다.");
  }

  async function keepLocalVersionAfterConflict() {
    if (!draft?.serverId || !configured || status !== "authenticated" || !user?.id) {
      setError("내 버전을 유지하려면 로그인과 원격 저장본이 필요합니다.");
      return;
    }

    setError("");
    setMessage("");
    const remote = await loadRemoteInvitation(draft.serverId, user.id);
    if (!remote) {
      setError("서버 revision을 확인하지 못했습니다.");
      return;
    }

    const nextDraft: MobileInvitationDraft = {
      ...draft,
      baseRevision: remote.payload.revision,
      syncStatus: "pending",
      isDirty: true,
      localUpdatedAt: new Date().toISOString()
    };

    await saveDraft(nextDraft);
    setDraft(nextDraft);
    setMessage("내 버전을 유지했습니다. 다시 서버 저장을 시도할 수 있습니다.");
  }

  async function deleteCurrentInvitation() {
    if (!draft || deleting) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await deleteDraft(draft.localId);
      if (configured && status === "authenticated" && user?.id && draft.serverId) {
        await deleteRemoteInvitation(draft.serverId, user.id);
      }
      setDraft(null);
      setMessage("초대장을 삭제했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  function confirmDeleteInvitation() {
    if (!draft || deleting) {
      return;
    }

    Alert.alert(
      "초대장 삭제",
      "삭제하면 이 기기의 초안이 제거되고, 로그인된 서버 저장본도 함께 삭제될 수 있습니다. 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => void deleteCurrentInvitation()
        }
      ]
    );
  }

  useEffect(() => {
    let mounted = true;

    async function load(showSpinner = true) {
      if (!id) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      if (configured && status === "authenticated" && user?.id) {
        const remote = await loadRemoteInvitation(id, user.id);
        if (!mounted) return;
        if (remote) {
          setDraft(remote);
          setRefreshing(false);
          setLoading(false);
          return;
        }
      }

      const local = await loadDraft(id);
      if (!mounted) return;
      setDraft(local);
      setRefreshing(false);
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [configured, id, status, user?.id]);

  const title = draft?.payload.title || "제목 없는 초대장";
  const names = `${draft?.payload.eventData.groom.name || "신랑"} ♡ ${draft?.payload.eventData.bride.name || "신부"}`;

  return (
    <Screen subtitle="공유될 초대장과 운영 상태를 한 화면에서 점검합니다." title="초대장 운영">
      {loading ? <Loading label="초대장 데이터를 불러오는 중..." variant="cards" /> : null}
      {error ? <ErrorView description={error} title="작업 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      {draft ? (
        <Card eyebrow="공유 전 검수" title="하객에게 보이는 초대장">
          <InvitationPreviewCard compact payload={draft.payload} />
        </Card>
      ) : null}
      {draft?.syncStatus === "conflict" ? (
        <Card eyebrow="충돌 감지" title="서버에 더 최신 수정본이 있습니다">
          <Text style={{ color: "#6a5645", lineHeight: 22 }}>
            다른 기기나 웹에서 저장된 내용과 이 기기의 로컬 수정본이 다릅니다. 서버 버전을 불러오거나, 내 버전을 기준으로 다시 저장할 수 있습니다.
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Button accessibilityLabel="서버 버전 불러오기" onPress={() => void loadServerVersion()} variant="outline">
                서버 버전
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button accessibilityLabel="내 버전 유지" onPress={() => void keepLocalVersionAfterConflict()}>
                내 버전 유지
              </Button>
            </View>
          </View>
        </Card>
      ) : null}
      <Card eyebrow={draft?.syncStatus || "draft"} title={title}>
        <Text style={{ color: "#5b4a3b", lineHeight: 22 }}>{names}</Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 6 }}>
          {draft?.payload.eventDateTime || "행사 일시 미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22, marginTop: 6 }}>
          {[draft?.payload.venueName, draft?.payload.venueAddress].filter(Boolean).join(" · ") || "장소 미입력"}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <Pill active={Boolean(draft?.serverId)} label={draft?.serverId ? "원격 저장됨" : "로컬 초안"} />
          <Pill active={Boolean(draft?.isDirty)} label={draft?.isDirty ? "미저장 변경" : "동기화 안정"} />
          <Pill active={Boolean(draft?.payload.isPublished)} label={draft?.payload.isPublished ? "공개 중" : "비공개"} />
        </View>
      </Card>
      <Card eyebrow="공유 준비" title="공개 링크 · 계좌 · 지도">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          공유 주소: {draft?.payload.share.slug || "(발행 전)"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          공개 URL: {publicUrl || "발행 후 자동 생성"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          카카오페이: {draft?.payload.accounts.kakaoPayLink || "미입력"}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          지도: {draft?.payload.location.kakaoMapUrl || draft?.payload.location.naverMapUrl || (mapLinks?.query ? "주소 검색 링크 자동 생성" : "미입력")}
        </Text>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          지도 API: {mapApi.label}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <Pill active={Boolean(mapApi.config?.kakao.enabled)} label={`카카오 API ${mapApi.config?.kakao.enabled ? "연동" : "대기"}`} />
          <Pill active={Boolean(mapApi.config?.naver.enabled)} label={`네이버 API ${mapApi.config?.naver.enabled ? "연동" : "대기"}`} />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Pressable
            accessibilityLabel="카카오 지도 열기"
            accessibilityRole="button"
            onPress={mapLinks?.kakaoUrl ? () => void openMapUrl(mapLinks.kakaoUrl, mapLinks.kakaoFallbackUrl) : undefined}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 999,
              backgroundColor: mapLinks?.kakaoUrl ? "#FEE500" : "#eee8df",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12
            }}
          >
            <Text style={{ color: mapLinks?.kakaoUrl ? "#332800" : "#8b8175", fontSize: 13, fontWeight: "800" }}>
              카카오 지도
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="네이버 지도 열기"
            accessibilityRole="button"
            onPress={mapLinks?.naverUrl ? () => void openMapUrl(mapLinks.naverUrl, mapLinks.naverFallbackUrl) : undefined}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: 999,
              backgroundColor: mapLinks?.naverUrl ? "#03C75A" : "#eee8df",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12
            }}
          >
            <Text style={{ color: mapLinks?.naverUrl ? "#fff" : "#8b8175", fontSize: 13, fontWeight: "800" }}>
              네이버 지도
            </Text>
          </Pressable>
        </View>
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          업로드 대기 사진: {draft?.pendingPhotos.length ?? 0}장
        </Text>
        {!configured ? (
          <Text style={{ color: "#8d5a2b", lineHeight: 22 }}>
            원격 기능 안내: {configMessage}
          </Text>
        ) : null}
      </Card>
      <Card eyebrow="빠른 작업" title="자주 쓰는 작업">
        <View style={{ gap: 10 }}>
          {draft?.payload.isPublished && draft.payload.share.slug ? (
            <Button
              accessibilityLabel="공개 링크 공유"
              onPress={() => {
                setError("");
                setMessage("");
                void shareInvitationLink(draft.payload.share.slug, draft.payload.title || "InviteHub 초대장")
                  .then(() => setMessage("공유 시트를 열었습니다."))
                  .catch((caught) => setError(caught instanceof Error ? caught.message : "공유에 실패했습니다."));
              }}
            >
              공개 링크 공유
            </Button>
          ) : draft?.serverId ? (
            <Button
              accessibilityLabel="웹 빌더 열기"
              onPress={() => {
                setError("");
                setMessage("");
                void openWebBuilder({ invitationId: draft.serverId })
                  .then(() => setMessage("웹 빌더를 열었습니다."))
                  .catch((caught) =>
                    setError(caught instanceof Error ? caught.message : "웹 빌더를 열지 못했습니다.")
                  );
              }}
            >
              웹에서 이어서 편집
            </Button>
          ) : (
            <Button accessibilityLabel="운영 화면에서 서버 저장" onPress={undefined}>
              서버 저장 후 사용 가능
            </Button>
          )}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                accessibilityLabel="웹 화면 열기"
                onPress={
                  draft?.payload.isPublished && publicUrl
                    ? () => {
                        setError("");
                        setMessage("");
                        void openInvitationPublicPage(shareSlug)
                          .then(() => setMessage("웹 공개 페이지를 열었습니다."))
                          .catch((caught) =>
                            setError(caught instanceof Error ? caught.message : "웹 공개 페이지를 열지 못했습니다.")
                          );
                      }
                    : draft?.serverId
                      ? () => {
                          setError("");
                          setMessage("");
                          void openWebBuilder({ invitationId: draft.serverId })
                            .then(() => setMessage("웹 빌더를 열었습니다."))
                            .catch((caught) =>
                              setError(caught instanceof Error ? caught.message : "웹 빌더를 열지 못했습니다.")
                            );
                        }
                      : undefined
                }
                variant="outline"
              >
                {draft?.payload.isPublished && publicUrl
                  ? "웹 공개 페이지"
                  : draft?.serverId
                    ? "웹 빌더"
                    : "웹 작업 대기"}
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                accessibilityLabel="운영 화면 새로고침"
                onPress={() => {
                  setMessage("");
                  setError("");
                  setRefreshing(true);
                  void (async () => {
                    try {
                      if (configured && status === "authenticated" && user?.id && id) {
                        const remote = await loadRemoteInvitation(id, user.id);
                        if (remote) {
                          setDraft(remote);
                          setMessage("운영 데이터를 새로고침했습니다.");
                          return;
                        }
                      }

                      if (id) {
                        const local = await loadDraft(id);
                        setDraft(local);
                        setMessage("로컬 초안을 다시 불러왔습니다.");
                      }
                    } catch (caught) {
                      setError(caught instanceof Error ? caught.message : "새로고침에 실패했습니다.");
                    } finally {
                      setRefreshing(false);
                    }
                  })();
                }}
                variant="outline"
              >
                {refreshing ? "새로고침 중..." : "데이터 새로고침"}
              </Button>
            </View>
          </View>
        </View>
      </Card>
      <Card eyebrow="운영 도구" title="관리 메뉴">
        <View style={{ gap: 10 }}>
          <Button
            accessibilityLabel="운영 화면에서 서버 저장"
            onPress={
              configured && status === "authenticated" && user?.id && draft
                ? () => {
                    setError("");
                    setMessage("");
                    void saveDraftToSupabase(draft, user.id, draft.payload.isPublished ? "published" : "draft")
                      .then(async (result) => {
                        const nextDraft: MobileInvitationDraft = {
                          ...draft,
                          serverId: result.serverId,
                          baseRevision: result.baseRevision,
                          payload: result.payload,
                          pendingPhotos: result.pendingPhotos,
                          syncStatus: "synced",
                          isDirty: false,
                          localUpdatedAt: new Date().toISOString()
                        };
                        await saveDraft(nextDraft);
                        setDraft(nextDraft);
                        setMessage(result.payload.isPublished ? "공개 상태를 서버에 동기화했습니다." : "운영 화면에서 서버 초안을 저장했습니다.");
                      })
                      .catch((caught) => {
                        setError(caught instanceof Error ? caught.message : "서버 저장에 실패했습니다.");
                      });
                  }
                : undefined
            }
            variant="outline"
          >
            {!configured
              ? "Supabase 설정 필요"
              : configured && status === "authenticated"
                ? "서버 저장"
                : "로그인 후 서버 저장"}
          </Button>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Link asChild href={`/invitation/${id ?? "demo"}/rsvp`}>
                <Button accessibilityLabel="RSVP 관리 화면으로 이동" variant="outline">RSVP 관리</Button>
              </Link>
            </View>
            <View style={{ flex: 1 }}>
              <Link asChild href={`/invitation/${id ?? "demo"}/guestbook`}>
                <Button accessibilityLabel="방명록 관리 화면으로 이동" variant="outline">방명록 관리</Button>
              </Link>
            </View>
          </View>
          <Link asChild href={`/invitation/${id ?? "demo"}/stats`}>
            <Button accessibilityLabel="통계 화면으로 이동" variant="outline">통계 보기</Button>
          </Link>
        </View>
      </Card>
      <Card eyebrow="주의" title="위험 작업">
        <Text style={{ color: "#6a5645", lineHeight: 22 }}>
          초대장을 삭제하면 로컬 초안과 서버 저장본이 함께 제거될 수 있습니다.
        </Text>
        <View style={{ marginTop: 10 }}>
          <Button
            accessibilityLabel="초대장 삭제"
            onPress={draft && !deleting ? confirmDeleteInvitation : undefined}
            variant="outline"
          >
            {deleting ? "삭제 중..." : "초대장 삭제"}
          </Button>
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Link asChild href={`/invitation/${id ?? "demo"}/rsvp`}>
          <Button accessibilityLabel="RSVP 관리 화면으로 이동">RSVP 관리 바로가기</Button>
        </Link>
      </View>
    </Screen>
  );
}
