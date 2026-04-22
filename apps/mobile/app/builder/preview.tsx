import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ImageBackground, Text, View } from "react-native";
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
import { getInviteHubBaseUrl, getPublicInvitationUrl } from "@/lib/web-links";
import { getBundledTemplatePreviewSource } from "@/lib/template-preview-source";
import { publishGuestInvitation } from "@/lib/invitations";

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
  const shareSlug = draft?.payload.share.slug ?? "";
  const selectedTemplate = draft ? mobileTemplateGallery.find((item) => item.id === draft.payload.templateId) : null;
  const bundledPreviewImage = selectedTemplate ? getBundledTemplatePreviewSource(selectedTemplate.id) : null;
  const previewImage = bundledPreviewImage ?? (
    selectedTemplate?.previewPath
      ? { uri: `${getInviteHubBaseUrl()}${selectedTemplate.previewPath}` }
      : undefined
  );
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
  const remoteSetupNotice = "링크 발행과 웹 연동을 준비 중입니다. 작성한 내용은 이 기기에 안전하게 저장됩니다.";
  const developerConfigHint = __DEV__ && !configured ? configMessage : "";
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
      setError("");
      setMessage(nextStatus === "draft" ? "작성한 내용은 이 기기에 저장됩니다." : remoteSetupNotice);
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
    <Screen subtitle="실시간 폰 프리뷰를 이 화면의 시그니처로 키웁니다." title="미리보기">
      {loading ? <Loading label="초안을 불러오는 중..." /> : null}
      {error ? <ErrorView description={error} title="작업 실패" /> : null}
      {message ? (
        <Card eyebrow="상태" title="작업 완료">
          <Text style={{ color: theme.colors.muted, lineHeight: 22 }}>{message}</Text>
        </Card>
      ) : null}
      <Card eyebrow="발행 흐름" title="미리보기 → 스토어 결제 → 발행 완료">
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
      <View
        style={{
          minHeight: 640,
          borderRadius: 36,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#e9dece",
          backgroundColor: "#f6f1ea",
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
            opacity: draft?.payload.photos.backgroundUri ? 0.42 : previewImage ? 0.9 : 0
          }}
          source={draft?.payload.photos.backgroundUri ? { uri: draft.payload.photos.backgroundUri } : previewImage}
          style={{
            flex: 1,
            paddingHorizontal: 18,
            paddingTop: 28,
            paddingBottom: 26,
            justifyContent: "flex-start"
          }}
        >
          {!draft?.payload.photos.backgroundUri && !previewImage ? (
            <>
              <View
                style={{
                  position: "absolute",
                  top: -20,
                  left: -12,
                  width: 170,
                  height: 170,
                  borderRadius: 999,
                  backgroundColor: theme.colors.eucalyptus,
                  opacity: 0.26
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: -12,
                  right: -18,
                  width: 180,
                  height: 180,
                  borderRadius: 999,
                  backgroundColor: theme.colors.blush,
                  opacity: 0.24
                }}
              />
            </>
          ) : null}

          <View style={{ alignItems: "center", marginTop: 18 }}>
            <Text style={{ color: "#d3c3ad", fontSize: 12, fontWeight: "700", letterSpacing: 2.4, textAlign: "center" }}>
              {selectedTemplate?.badge || "WEDDING INVITATION"}
            </Text>
            <Text
              style={{
                color: "#d7cab8",
                fontSize: 16,
                fontWeight: "600",
                lineHeight: 28,
                marginTop: 12,
                textAlign: "center"
              }}
            >
              {names}
            </Text>
            <Text style={{ color: "#d3c3ad", fontSize: 14, lineHeight: 20, marginTop: 10, textAlign: "center" }}>
              {draft?.payload.eventDateTime || "2026. 04. 12 SAT PM 2:00"}
            </Text>
          </View>

          <View
            style={{
              width: "78%",
              alignSelf: "center",
              marginTop: 84,
              minHeight: 330,
              backgroundColor: "rgba(255, 249, 241, 0.92)",
              borderRadius: 30,
              borderWidth: 1,
              borderColor: "#eadcc9",
              paddingHorizontal: 22,
              paddingVertical: 28,
              alignItems: "center",
              shadowColor: "rgba(102, 82, 63, 0.16)",
              shadowOffset: { width: 0, height: 14 },
              shadowOpacity: 1,
              shadowRadius: 28,
              elevation: 6
            }}
          >
            <Text style={{ color: "#a07a52", fontSize: 12, fontWeight: "700", letterSpacing: 1.8, textAlign: "center" }}>
              {selectedTemplate?.name || "초대장 미리보기"}
            </Text>
            <Text style={{ color: "#3a3028", fontSize: 28, fontWeight: "700", lineHeight: 38, marginTop: 10, textAlign: "center" }}>
              {names}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 17, lineHeight: 25, marginTop: 12, textAlign: "center" }}>
              {draft?.payload.eventDateTime || "행사 일시를 입력해 주세요."}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 17, lineHeight: 25, marginTop: 6, textAlign: "center" }}>
              {[draft?.payload.venueName, draft?.payload.venueAddress].filter(Boolean).join(" · ") ||
                "예식장 정보를 입력해 주세요."}
            </Text>
            <View
              style={{
                width: 84,
                height: 1,
                backgroundColor: "#e8d7c1",
                marginTop: 18,
                marginBottom: 16
              }}
            />
            <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 28, textAlign: "center" }}>
              {draft?.payload.message || "초대 메시지를 입력하면 이곳에 반영됩니다."}
            </Text>
          </View>
        </ImageBackground>
      </View>
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
              지도 링크: {draft?.payload.location.naverMapUrl || "미입력"}
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
        <Card eyebrow="연결 상태" title="링크 발행 준비 중">
          <Text style={{ color: theme.colors.primaryDark, lineHeight: 22 }}>{remoteSetupNotice}</Text>
          {developerConfigHint ? (
            <Text style={{ color: theme.colors.muted, lineHeight: 20, marginTop: 8 }}>{developerConfigHint}</Text>
          ) : null}
        </Card>
      ) : null}
      <View style={{ gap: 12 }}>
        {requiresPurchase ? (
          <StorePurchaseCard
            accessToken={canUsePaidAccount ? session?.access_token : ""}
            disabledReason={
              !configured
                ? remoteSetupNotice
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
              onPress={!configured || remoteAccessMode === "loading" ? undefined : () => void handleSave("published")}
            >
              {pending === "publish"
                ? "발행 중..."
                : !configured
                  ? "링크 준비 중"
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
                  ? "이 기기에 저장"
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
        {configured ? (
          <Link
            asChild
            href={{
              pathname: "/invitation/[id]/index",
              params: { id: localId ?? "demo" }
            }}
          >
            <Button accessibilityLabel="초대장 관리 화면으로 이동" variant="outline">초대장 관리 보기</Button>
          </Link>
        ) : null}
      </View>
    </Screen>
  );
}
