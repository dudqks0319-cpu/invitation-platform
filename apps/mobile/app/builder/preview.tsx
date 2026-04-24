/* eslint-disable jsx-a11y/alt-text */

import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ImageBackground, Linking, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { StorePurchaseCard } from "@/components/payments/StorePurchaseCard";
import { Card } from "@/components/ui/Card";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loading } from "@/components/ui/Loading";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { getPaidPublishBlockReason, getRemoteAccessMode, hasFullAccount } from "@/lib/auth-access";
import { mobileTemplateGallery } from "@/lib/template-gallery";
import { getMobileInvitationPricing, requiresStorePurchase } from "@/lib/payments/pricing";
import { getPreviewFlowState } from "@/lib/preview-flow";
import { useInvitationDraft } from "@/hooks/useInvitationDraft";
import { openInvitationPublicPage, shareInvitationLink } from "@/lib/share";
import { getPublicInvitationUrl } from "@/lib/web-links";
import { publishGuestInvitation } from "@/lib/invitations";
import { getInvitationMapLinks, type InvitationMapLinks } from "@/lib/map-links";

const templateAccents: Record<string, { background: string; border: string; accent: string; wash: string; motif: string; headline: string; surface: string }> = {
  wedding: { background: "#fff7f2", border: "#ead6cb", accent: "#bd8c75", wash: "rgba(242, 194, 188, 0.2)", motif: "floral", headline: "We are getting married", surface: "rgba(255, 252, 247, 0.78)" },
  dol: { background: "#fff9dd", border: "#eadb9f", accent: "#d4a542", wash: "rgba(255, 217, 116, 0.22)", motif: "confetti", headline: "First Birthday", surface: "rgba(255, 253, 240, 0.82)" },
  hwangap: { background: "#fbf6ed", border: "#d9c4a0", accent: "#9c654d", wash: "rgba(201, 166, 107, 0.18)", motif: "hanji", headline: "With gratitude", surface: "rgba(255, 251, 242, 0.84)" },
  bridal: { background: "#fff7fb", border: "#efd3dc", accent: "#c8849b", wash: "rgba(246, 193, 207, 0.22)", motif: "ribbon", headline: "Bridal Shower", surface: "rgba(255, 250, 253, 0.82)" },
  birthday: { background: "#f0fbff", border: "#b9dceb", accent: "#5faece", wash: "rgba(97, 185, 230, 0.18)", motif: "confetti", headline: "Happy Birthday", surface: "rgba(249, 253, 255, 0.82)" },
  housewarming: { background: "#fbfaf5", border: "#d8dfc8", accent: "#778f69", wash: "rgba(141, 163, 122, 0.18)", motif: "leaf", headline: "Welcome home", surface: "rgba(253, 252, 246, 0.82)" },
  baby: { background: "#f7fbff", border: "#cfddf3", accent: "#739aca", wash: "rgba(158, 199, 255, 0.2)", motif: "ribbon", headline: "Baby Shower", surface: "rgba(250, 253, 255, 0.82)" },
  graduation: { background: "#f8f9fc", border: "#ccd6e8", accent: "#425b8f", wash: "rgba(32, 56, 99, 0.12)", motif: "minimal", headline: "Graduation", surface: "rgba(250, 251, 255, 0.86)" },
  business: { background: "#f5f7ff", border: "#cbd8f5", accent: "#2b62d9", wash: "rgba(43, 98, 217, 0.12)", motif: "minimal", headline: "You are invited", surface: "rgba(250, 252, 255, 0.88)" }
};

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

function LiveMapPanel({
  links,
  venueAddress,
  venueName
}: {
  links: InvitationMapLinks;
  venueAddress: string;
  venueName: string;
}) {
  const hasMapTarget = Boolean(links.query || links.naverUrl || links.kakaoUrl);

  return (
    <View
      style={{
        width: "100%",
        borderRadius: 22,
        backgroundColor: "rgba(246, 250, 244, 0.94)",
        borderWidth: 1,
        borderColor: "rgba(84,122,97,0.16)",
        padding: 14,
        gap: 10
      }}
    >
      <View
        style={{
          minHeight: 104,
          borderRadius: 18,
          backgroundColor: "#e8f0e5",
          overflow: "hidden",
          justifyContent: "center",
          padding: 14
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -20,
            top: 22,
            width: "118%",
            height: 1,
            backgroundColor: "rgba(84,122,97,0.16)",
            transform: [{ rotate: "-11deg" }]
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: -20,
            top: 66,
            width: "118%",
            height: 1,
            backgroundColor: "rgba(84,122,97,0.16)",
            transform: [{ rotate: "9deg" }]
          }}
        />
        <Text style={{ color: "#6c865f", fontSize: 26, textAlign: "center" }}>⌖</Text>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "800", marginTop: 2, textAlign: "center" }}>
          {venueName || "장소 이름"}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3, textAlign: "center" }}>
          {venueAddress || "주소를 입력하면 지도 검색 링크가 표시됩니다."}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          accessibilityLabel="초대장 미리보기에서 카카오 지도 열기"
          accessibilityRole="button"
          onPress={hasMapTarget && links.kakaoUrl ? () => void openMapUrl(links.kakaoUrl) : undefined}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 999,
            backgroundColor: hasMapTarget ? "#FEE500" : theme.colors.surfaceSoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10
          }}
        >
          <Text style={{ color: hasMapTarget ? "#332800" : theme.colors.textLight, fontSize: 12, fontWeight: "800" }}>
            카카오
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="초대장 미리보기에서 네이버 지도 열기"
          accessibilityRole="button"
          onPress={hasMapTarget && links.naverUrl ? () => void openMapUrl(links.naverUrl, links.naverFallbackUrl) : undefined}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 999,
            backgroundColor: hasMapTarget ? "#03C75A" : theme.colors.surfaceSoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10
          }}
        >
          <Text style={{ color: hasMapTarget ? "#fff" : theme.colors.textLight, fontSize: 12, fontWeight: "800" }}>
            네이버
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InvitationMotif({ accent, motif }: { accent: string; motif: string }) {
  if (motif === "minimal") {
    return (
      <View pointerEvents="none" style={{ position: "absolute", left: 34, right: 34, top: 96, height: 1, backgroundColor: `${accent}33` }} />
    );
  }

  if (motif === "hanji") {
    return (
      <>
        <Text pointerEvents="none" style={{ position: "absolute", top: 72, right: 26, color: `${accent}22`, fontSize: 86, fontWeight: "900" }}>
          壽
        </Text>
        <View pointerEvents="none" style={{ position: "absolute", left: 34, right: 34, bottom: 82, height: 1, backgroundColor: `${accent}22` }} />
      </>
    );
  }

  if (motif === "confetti") {
    return (
      <>
        {["•", "✦", "•", "✧"].map((mark, index) => (
          <Text
            key={`${mark}-${index}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 84 + index * 28,
              right: index % 2 ? 34 : 58,
              color: `${accent}66`,
              fontSize: index % 2 ? 18 : 24
            }}
          >
            {mark}
          </Text>
        ))}
      </>
    );
  }

  return (
    <>
      <Text pointerEvents="none" style={{ position: "absolute", top: 74, left: 34, color: `${accent}66`, fontSize: 36 }}>
        {motif === "ribbon" ? "〰" : "✿"}
      </Text>
      <Text pointerEvents="none" style={{ position: "absolute", bottom: 58, right: 34, color: `${accent}55`, fontSize: 42 }}>
        {motif === "leaf" ? "⌇" : "✿"}
      </Text>
    </>
  );
}

export default function BuilderPreviewScreen() {
  const { localId } = useLocalSearchParams<{ localId?: string }>();
  const { applyRemotePublish, canShare, draft, loading, publicUrl, publishReadiness, saveToCloud } =
    useInvitationDraft("local-preview-owner", localId);
  const {
    configMessage,
    configured,
    ensureAnonymousSession,
    session,
    status,
    user
  } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<"" | "save" | "publish" | "share">("");
  const names = draft
    ? `${draft.payload.eventData.groom.name || "신랑"} ♡ ${draft.payload.eventData.bride.name || "신부"}`
    : "";
  const payload = draft?.payload;
  const shareSlug = draft?.payload.share.slug ?? "";
  const selectedTemplate = draft ? mobileTemplateGallery.find((item) => item.id === draft.payload.templateId) : null;
  const accent = templateAccents[selectedTemplate?.category ?? "wedding"] ?? templateAccents.wedding;
  const mapLinks = payload ? getInvitationMapLinks(payload) : null;
  const pricing = draft ? getMobileInvitationPricing(draft.payload) : { amount: 0, breakdown: [], isFree: true };
  const requiresPurchase = draft ? requiresStorePurchase(draft.payload) : false;
  const remoteAccessMode = getRemoteAccessMode(status, user);
  const canUsePaidAccount = remoteAccessMode === "full-account";
  const paidPublishBlockReason = getPaidPublishBlockReason(status, user);
  const flowState = getPreviewFlowState({
    isPublished: Boolean(draft?.payload.isPublished),
    requiresPurchase
  });
  const addOnLines = pricing.breakdown
    .filter((item) => item.amount > 0)
    .map((item) => `${item.label} ${item.amount.toLocaleString("ko-KR")}원`);
  const statusLabel = draft?.payload.isPublished ? "공개 중" : requiresPurchase ? "스토어 결제 후 발행" : "비공개 초안";
  const publishGuide = draft?.payload.isPublished
    ? "지금 공유 가능한 링크가 준비되어 있습니다."
    : requiresPurchase
      ? "유료 옵션이 포함되어 있어 이메일 또는 소셜 로그인 후 앱 스토어 결제를 완료해야 발행됩니다."
      : "필수 정보만 채우면 로그인 없이 게스트로 공개 링크를 발행할 수 있습니다.";
  const urlGuide = publicUrl || (requiresPurchase ? "스토어 결제 완료 후 자동 생성" : "서버 저장 후 자동 생성");
  const missingItemsText = publishReadiness.missingFields.join(" · ");

  async function resolveRemoteUser(requireFullAccount = false) {
    if (!configured) {
      throw new Error(configMessage);
    }

    if (remoteAccessMode === "loading") {
      throw new Error("로그인 상태를 확인하는 중입니다.");
    }

    if (status === "authenticated" && user?.id) {
      if (requireFullAccount && !hasFullAccount(user)) {
        throw new Error(paidPublishBlockReason);
      }

      return {
        userId: user.id
      };
    }

    const guestSession = await ensureAnonymousSession();
    if (guestSession.error || !guestSession.data?.user?.id) {
      throw new Error(guestSession.error?.message || "게스트 세션을 시작하지 못했습니다.");
    }

    if (requireFullAccount) {
      throw new Error(paidPublishBlockReason);
    }

    return {
      userId: guestSession.data.user.id
    };
  }

  async function ensureDraftForPurchase() {
    const { userId } = await resolveRemoteUser(true);
    const nextDraft = await saveToCloud(userId, "draft");
    return { invitationId: nextDraft.serverId ?? "" };
  }

  async function handleSave(nextStatus: "draft" | "published") {
    if (!configured) {
      setError(configMessage);
      return;
    }

    if (nextStatus === "published" && !publishReadiness.canPublish) {
      setError(`공개 전 입력이 필요한 항목: ${publishReadiness.missingFields.join(", ")}`);
      setMessage("");
      return;
    }

    setPending(nextStatus === "published" ? "publish" : "save");
    setError("");
    setMessage("");

    try {
      if (remoteAccessMode !== "full-account" && nextStatus === "draft") {
        setMessage("이 기기에 초안을 저장했습니다.");
        return;
      }

      if (remoteAccessMode !== "full-account" && nextStatus === "published") {
        if (!draft) {
          throw new Error("발행할 초안이 없습니다.");
        }

        const result = await publishGuestInvitation(draft);
        applyRemotePublish(result.invitationId, result.slug);
        setMessage(`공개 링크를 발행했습니다.\n${getPublicInvitationUrl(result.slug)}`);
        return;
      }

      const { userId } = await resolveRemoteUser(false);
      const nextDraft = await saveToCloud(userId, nextStatus);
      setMessage(
        nextStatus === "published"
          ? `공개 링크를 발행했습니다.\n${nextDraft.payload.share.slug ? getPublicInvitationUrl(nextDraft.payload.share.slug) : ""}`
          : "서버에 초안을 저장했습니다."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "서버 저장에 실패했습니다.");
    } finally {
      setPending("");
    }
  }

  async function handleShare() {
    if (!canShare || !draft?.payload.share.slug) {
      setError("먼저 공개 링크를 발행해 주세요.");
      return;
    }

    setPending("share");
    setError("");
    setMessage("");

    try {
      await shareInvitationLink(draft.payload.share.slug, draft.payload.title || "InviteHub 초대장");
      setMessage("공유 시트를 열었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "공유에 실패했습니다.");
    } finally {
      setPending("");
    }
  }

  return (
    <Screen subtitle="하객에게 공유될 실제 화면을 먼저 확인하세요." title="초대장 미리보기">
      {loading ? <Loading label="초안을 불러오는 중..." /> : null}
      {error ? <ErrorView description={error} title="작업 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <View
        style={{
          minHeight: 760,
          borderRadius: 36,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: accent.border,
          backgroundColor: accent.background,
          shadowColor: "rgba(102, 82, 63, 0.18)",
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 1,
          shadowRadius: 34,
          elevation: 7
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 8,
            alignSelf: "center",
            width: 120,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#1a1a1a",
            zIndex: 2
          }}
        />
        <ImageBackground
          imageStyle={{
            resizeMode: "cover",
            opacity: draft?.payload.photos.backgroundUri ? 0.22 : 0
          }}
          source={draft?.payload.photos.backgroundUri ? { uri: draft.payload.photos.backgroundUri } : undefined}
          style={{
            flex: 1,
            backgroundColor: accent.background,
            paddingHorizontal: 22,
            paddingTop: 58,
            paddingBottom: 28,
            justifyContent: "flex-start"
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 52,
              left: -26,
              width: 190,
              height: 190,
              borderRadius: 999,
              backgroundColor: accent.wash
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -40,
              bottom: 90,
              width: 230,
              height: 230,
              borderRadius: 999,
              backgroundColor: accent.wash
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 72,
              left: 30,
              right: 30,
              bottom: 28,
              borderRadius: 34,
              borderWidth: 1,
              borderColor: accent.border,
              opacity: 0.78
            }}
          />
          <InvitationMotif accent={accent.accent} motif={accent.motif} />

          <View
            style={{
              flex: 1,
              borderRadius: 34,
              backgroundColor: accent.surface,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.72)",
              paddingHorizontal: 24,
              paddingTop: 34,
              paddingBottom: 24,
              alignItems: "center",
              gap: 14
            }}
          >
            <Text style={{ color: accent.accent, fontSize: 14, fontStyle: "italic", lineHeight: 20, textAlign: "center" }}>
              {accent.headline}
            </Text>
            <Text style={{ color: accent.accent, fontSize: 12, fontWeight: "800", textAlign: "center" }}>
              {selectedTemplate?.badge || "초대장"}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800", textAlign: "center" }}>
              {selectedTemplate?.name || "초대장 미리보기"}
            </Text>
            {draft?.payload.photos.mainUri ? (
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel="초대장 대표 사진"
                source={{ uri: draft.payload.photos.mainUri }}
                style={{
                  width: "100%",
                  height: 170,
                  borderRadius: 26,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.86)"
                }}
              />
            ) : null}
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 30,
                fontWeight: "800",
                lineHeight: 40,
                textAlign: "center"
              }}
            >
              {names}
            </Text>
            <View
              style={{
                width: 88,
                height: 1,
                backgroundColor: accent.border,
                marginTop: 2,
                marginBottom: 2
              }}
            />
            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700", lineHeight: 25, textAlign: "center" }}>
              {draft?.payload.eventDateTime || "행사 일시를 입력해 주세요."}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24, textAlign: "center" }}>
              {[draft?.payload.venueName, draft?.payload.venueAddress].filter(Boolean).join(" · ") ||
                "예식장 정보를 입력해 주세요."}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 26, textAlign: "center" }}>
              {draft?.payload.message || "초대 메시지를 입력하면 이곳에 반영됩니다."}
            </Text>
            {mapLinks ? (
              <LiveMapPanel
                links={mapLinks}
                venueAddress={draft?.payload.venueAddress ?? ""}
                venueName={draft?.payload.venueName ?? ""}
              />
            ) : null}
            {draft?.payload.location.transportNote ? (
              <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" }}>
                {draft.payload.location.transportNote}
              </Text>
            ) : null}
          </View>
        </ImageBackground>
      </View>
      <Card eyebrow="발행 흐름" title="검수 → 결제 확인 → 링크 공유">
        <View style={{ flexDirection: "row", gap: 10 }}>
          {flowState.steps.map((step, index) => {
            const isCurrent = step.status === "current";
            const isDone = step.status === "done";
            const isSkipped = step.status === "skipped";

            return (
              <View
                key={step.label}
                style={{
                  flex: 1,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: isCurrent
                    ? theme.colors.primary
                    : isDone
                      ? "rgba(84,122,97,0.22)"
                      : theme.colors.border,
                  backgroundColor: isCurrent
                    ? "rgba(201,147,90,0.14)"
                    : isDone
                      ? "rgba(84,122,97,0.1)"
                      : theme.colors.surfaceSoft,
                  paddingHorizontal: 10,
                  paddingVertical: 12,
                  gap: 6
                }}
              >
                <Text
                  style={{
                    color: isCurrent
                      ? theme.colors.primaryDark
                      : isDone
                        ? theme.colors.success
                        : theme.colors.muted,
                    fontSize: 12,
                    fontWeight: "700"
                  }}
                >
                  {`0${index + 1}`}
                </Text>
                <Text
                  style={{
                    color: isSkipped ? theme.colors.textLight : theme.colors.text,
                    fontSize: 14,
                    fontWeight: "700",
                    lineHeight: 20
                  }}
                >
                  {step.label}
                </Text>
                <Text
                  style={{
                    color: isCurrent
                      ? theme.colors.primaryDark
                      : isDone
                        ? theme.colors.success
                        : isSkipped
                          ? theme.colors.textLight
                          : theme.colors.muted,
                    fontSize: 12,
                    lineHeight: 18
                  }}
                >
                  {isCurrent
                    ? "진행 중"
                    : isDone
                      ? "완료"
                      : isSkipped
                        ? "건너뜀"
                        : "대기"}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{flowState.note}</Text>
      </Card>
      <Card eyebrow="발행 요약" title={statusLabel}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View
            style={{
              backgroundColor: draft?.payload.isPublished ? "rgba(84,122,97,0.12)" : "rgba(201,147,90,0.14)",
              borderRadius: theme.radius.pill,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}
          >
            <Text
              style={{
                color: draft?.payload.isPublished ? theme.colors.success : theme.colors.primaryDark,
                fontSize: 12,
                fontWeight: "700"
              }}
            >
              {statusLabel}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: requiresPurchase ? "rgba(201,147,90,0.12)" : "rgba(84,122,97,0.1)",
              borderRadius: theme.radius.pill,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}
          >
            <Text
              style={{
                color: requiresPurchase ? theme.colors.primaryDark : theme.colors.success,
                fontSize: 12,
                fontWeight: "700"
              }}
            >
              {requiresPurchase ? `${pricing.amount.toLocaleString("ko-KR")}원 앱 결제 필요` : "무료 발행 가능"}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.surfaceSoft,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 14,
            gap: 6
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "700", lineHeight: 22 }}>
            {publishGuide}
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 21 }}>
            공유 URL: {urlGuide}
          </Text>
        </View>
        {!publishReadiness.canPublish ? (
          <View
            style={{
              backgroundColor: "rgba(201,147,90,0.08)",
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 12
            }}
          >
            <Text style={{ color: theme.colors.primaryDark, fontSize: 13, fontWeight: "700", lineHeight: 20 }}>
              공개 전 필요 항목
            </Text>
            <Text style={{ color: theme.colors.primaryDark, fontSize: 14, lineHeight: 21, marginTop: 4 }}>
              {missingItemsText}
            </Text>
          </View>
        ) : (
          <Text style={{ color: theme.colors.success, lineHeight: 22 }}>공개 필수 항목이 모두 준비되었습니다.</Text>
        )}
      </Card>
      <Card eyebrow="준비 정보" title="계좌 · 위치 · 업로드">
        <View style={{ gap: 12 }}>
          <View
            style={{
              backgroundColor: theme.colors.surfaceSoft,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 12
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700" }}>계좌 안내</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21, marginTop: 4 }}>
              {draft?.payload.accounts.primary?.holder || "미입력"} / {draft?.payload.accounts.secondary?.holder || "미입력"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.surfaceSoft,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 12
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700" }}>위치 정보</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21, marginTop: 4 }}>
              카카오 지도: {draft?.payload.location.kakaoMapUrl || (mapLinks?.query ? "주소 검색 링크 자동 생성" : "미입력")}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21, marginTop: 4 }}>
              네이버 지도: {draft?.payload.location.naverMapUrl || (mapLinks?.query ? "주소 검색 링크 자동 생성" : "미입력")}
            </Text>
            <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20, marginTop: 4 }}>
              교통 안내: {draft?.payload.location.transportNote || "미입력"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.surfaceSoft,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 12
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: "700" }}>업로드 상태</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21, marginTop: 4 }}>
              대기 중인 사진 {draft?.pendingPhotos.length ?? 0}장
            </Text>
          </View>
        </View>
      </Card>
      <Card eyebrow="요금 안내" title={requiresPurchase ? "스토어 발행권" : "무료 발행"}>
        <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>
          {requiresPurchase
            ? `사진이 포함된 초대장은 iOS에서는 Apple IAP, Android에서는 Google Play Billing으로 ${pricing.amount.toLocaleString("ko-KR")}원 결제 후 발행됩니다.`
            : "지금 선택한 구성은 무료입니다. 공개 링크를 바로 발행할 수 있습니다."}
        </Text>
        {addOnLines.length > 0 ? (
          <View style={{ gap: 6, marginTop: 10 }}>
            {addOnLines.map((line) => (
              <Text key={line} style={{ color: theme.colors.primaryDark, lineHeight: 22 }}>
                • {line}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>
      {!configured ? (
        <Card eyebrow="원격 기능 안내" title="현재는 로컬 프리뷰 모드">
          <Text style={{ color: theme.colors.primaryDark, lineHeight: 22 }}>{configMessage}</Text>
        </Card>
      ) : null}
      <View style={{ gap: 12 }}>
        {requiresPurchase ? (
          <StorePurchaseCard
            accessToken={canUsePaidAccount ? session?.access_token : ""}
            disabledReason={
              !configured
                ? configMessage
                : paidPublishBlockReason
                  ? paidPublishBlockReason
                  : !publishReadiness.canPublish
                    ? `공개 전 필요 항목: ${publishReadiness.missingFields.join(", ")}`
                    : ""
            }
            invitationId={draft?.serverId}
            onBeforePurchase={ensureDraftForPurchase}
            onVerified={({ invitationId, slug }) => {
              applyRemotePublish(invitationId, slug);
              setMessage(`스토어 결제가 완료되어 공개 링크를 발행했습니다.\n${getPublicInvitationUrl(slug)}`);
              setError("");
            }}
          />
        ) : (
          <View
            style={{
              shadowColor: "rgba(201,147,90,0.4)",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 1,
              shadowRadius: 20,
              elevation: 5
            }}
          >
            <Button
              accessibilityLabel="공개 링크 발행"
              onPress={remoteAccessMode === "loading" ? undefined : () => void handleSave("published")}
            >
              {pending === "publish"
                ? "발행 중..."
                : !configured
                  ? "Supabase 설정 필요"
                  : remoteAccessMode === "loading"
                    ? "세션 확인 중..."
                  : draft?.payload.isPublished
                    ? "공개 상태 다시 저장"
                    : "공개 링크 발행"}
            </Button>
          </View>
        )}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Link asChild href={{ pathname: "/builder/step5-location", params: localId ? { localId } : {} }}>
              <Button accessibilityLabel="이전 단계로 이동" variant="outline">이전</Button>
            </Link>
          </View>
          <View style={{ flex: 1.3 }}>
            <Button
              accessibilityLabel="서버에 초안 저장"
              onPress={remoteAccessMode === "loading" ? undefined : () => void handleSave("draft")}
              variant="outline"
            >
              {pending === "save"
                ? "저장 중..."
                : !configured
                  ? "설정 필요"
                  : remoteAccessMode === "loading"
                    ? "세션 확인 중..."
                  : "초안 저장"}
            </Button>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Button
              accessibilityLabel="공유 시트 열기"
              onPress={canShare ? () => void handleShare() : undefined}
              variant="outline"
            >
              {pending === "share" ? "공유 중..." : canShare ? "공유하기" : "공개 후 공유"}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              accessibilityLabel="공개 페이지 열기"
              onPress={
                canShare && publicUrl
                  ? () => {
                      setError("");
                      setMessage("");
                      void openInvitationPublicPage(shareSlug)
                        .then(() => setMessage("웹 공개 페이지를 열었습니다."))
                        .catch((caught) =>
                          setError(caught instanceof Error ? caught.message : "웹 공개 페이지를 열지 못했습니다.")
                        );
                    }
                  : undefined
              }
              variant="outline"
            >
              {canShare && publicUrl ? "웹에서 확인" : "공개 후 확인"}
            </Button>
          </View>
        </View>
        <Link
          asChild
          href={{
            pathname: "/invitation/[id]/index",
            params: { id: localId ?? "demo" }
          }}
        >
          <Button accessibilityLabel="운영 화면 예시로 이동" variant="outline">운영 화면 보기</Button>
        </Link>
      </View>
    </Screen>
  );
}
