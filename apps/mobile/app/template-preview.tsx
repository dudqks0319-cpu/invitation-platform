import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AccessibilityInfo, ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InvitationPreviewCard } from "@/components/invitation/InvitationPreviewCard";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { getDraftOwnerId } from "@/lib/auth-access";
import {
  createOrReuseTemplatePreviewDraft,
  inspectDraftsForTemplatePreview,
  isCorruptDraftStorageError,
  quarantineAndResetCorruptDraftStorage
} from "@/lib/drafts";
import { getTemplatePreviewSource } from "@/lib/template-image-source";
import {
  createTemplateImageRecoveryState,
  resolveRecoverableTemplateImage,
  synchronizeTemplateImageRecoveryState
} from "@/lib/template-image-recovery";
import type { MobileTemplateGalleryItem } from "@/lib/template-gallery";
import { isValidTemplatePreviewIntentKey } from "@/lib/template-discovery-navigation";
import {
  createTemplatePreviewDraftController,
  createTemplatePreviewPayload,
  getTemplatePreviewExample
} from "@/lib/template-preview-flow";
import {
  getTemplatePreviewActionAccessibility,
  getTemplatePreviewGate,
  shouldInspectTemplatePreviewDrafts,
  type TemplatePreviewDraftSummary,
  type TemplatePreviewInspection
} from "@/lib/template-preview-presenter";
import { recordRecentlyViewedTemplate } from "@/lib/template-preview-recent";
import { createTemplatePreviewAnnouncementController } from "@/lib/template-preview-announcements";
import { retainFirstValidatedTemplateSelection, type TemplatePreviewSelection } from "@/lib/template-preview-selection";
import { getUniqueTemplateTags } from "@/lib/template-tags";

type CreationStatus = "idle" | "creating" | "failed" | "success";

function TemplatePreviewImage({ template }: { template: MobileTemplateGalleryItem }) {
  const resolvedSource = getTemplatePreviewSource(template);
  const [imageState, setImageState] = useState(() => createTemplateImageRecoveryState(resolvedSource));
  const synchronizedImageState = synchronizeTemplateImageRecoveryState(imageState, resolvedSource);
  if (imageState !== synchronizedImageState) {
    setImageState(synchronizedImageState);
  }
  const { sourceIdentity, visibleSource: previewSource } = resolveRecoverableTemplateImage(
    resolvedSource,
    synchronizedImageState.failed ? synchronizedImageState.sourceIdentity : null
  );
  const imageFailed = synchronizedImageState.failed && synchronizedImageState.sourceIdentity === sourceIdentity;

  return (
    <View
      accessible
      accessibilityLabel={`예시 초대장 미리보기, ${template.name}${imageFailed ? ", 이미지를 표시할 수 없어 대체 안내를 표시합니다" : ""}`}
      accessibilityRole="image"
      style={{
        alignSelf: "center",
        width: "100%",
        maxWidth: 420,
        aspectRatio: 941 / 1672,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        backgroundColor: theme.colors.surfaceSoft,
        ...theme.shadow.card
      }}
    >
      {previewSource ? (
        <>
          <Image
            alt=""
            accessible={false}
            accessibilityElementsHidden
            accessibilityIgnoresInvertColors
            importantForAccessibility="no-hide-descendants"
            key={sourceIdentity}
            onError={() => setImageState({ sourceIdentity, failed: true })}
            resizeMode="cover"
            source={previewSource}
            style={{ width: "100%", height: "100%" }}
          />
          <TemplateSampleTextOverlay template={template} />
        </>
      ) : (
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: theme.colors.ink, fontSize: 15, fontWeight: "800", textAlign: "center" }}>
            미리보기 이미지를 표시할 수 없어요
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8, textAlign: "center" }}>
            아래 예시 행사 정보는 계속 확인할 수 있어요.
          </Text>
        </View>
      )}
    </View>
  );
}

function TemplatePreviewActions({
  ownerId,
  previewIntentKey,
  recoverableDraft,
  template
}: {
  ownerId: string;
  previewIntentKey: string;
  recoverableDraft: TemplatePreviewDraftSummary | null;
  template: MobileTemplateGalleryItem;
}) {
  const router = useRouter();
  const [creationStatus, setCreationStatus] = useState<CreationStatus>("idle");
  const [creationError, setCreationError] = useState<string | null>(null);
  const [controller] = useState(() => createTemplatePreviewDraftController({
    createDraft: (selectedTemplate) => createOrReuseTemplatePreviewDraft(ownerId, {
      templateId: selectedTemplate.id,
      eventType: selectedTemplate.category,
      title: `${selectedTemplate.badge} 초대장`,
      previewIntentKey
    }),
    navigate: (localId) => {
      router.push({ pathname: "/builder/step1-basic", params: { localId } });
    }
  }));
  const isCreating = creationStatus === "creating";
  const isActionDisabled = isCreating || creationStatus === "success";
  const actionAccessibility = getTemplatePreviewActionAccessibility(creationStatus);
  const [announcementController] = useState(() => createTemplatePreviewAnnouncementController((message) => {
    AccessibilityInfo.announceForAccessibility(message);
  }));

  useEffect(() => () => {
    controller.deactivate();
    announcementController.cancel();
  }, [announcementController, controller]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const message = creationStatus === "creating"
      ? "초대장을 만드는 중입니다."
      : creationStatus === "failed"
        ? creationError ?? "초대장을 만들지 못했어요."
        : null;
    announcementController.transition(`creation:${creationStatus}:${message ?? ""}`, message);
  }, [announcementController, creationError, creationStatus]);

  async function runAction(action: () => Promise<void>) {
    if (isCreating || creationStatus === "success") return;
    setCreationStatus("creating");
    setCreationError(null);
    try {
      await action();
      setCreationStatus(controller.getState().status);
    } catch {
      const state = controller.getState();
      setCreationStatus(state.status);
      setCreationError(state.error);
    }
  }

  return (
    <>
      {recoverableDraft ? (
        <View style={{ borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight, padding: 18, gap: 12 }}>
          <Text style={{ color: theme.colors.ink, fontSize: 17, fontWeight: "800" }}>편집 중인 초안이 있어요</Text>
          <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 22 }}>
            이어서 편집하면 기존 내용을 그대로 열고, 새로 시작하면 기존 초안을 덮어쓰지 않고 이 디자인으로 별도 초안을 만듭니다.
          </Text>
          <Text style={{ color: theme.colors.ink, fontSize: 12, lineHeight: 18 }}>
            로그인한 계정의 초안만 확인합니다. 로그인 전 로컬 초안은 계정으로 자동 이전하지 않습니다.
          </Text>
          <View style={{ gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isCreating ? "기존 초안을 여는 중" : "기존 초안 이어서 편집"}
              accessibilityHint="이 계정에서 편집하던 초안을 엽니다."
              accessibilityState={actionAccessibility.accessibilityState}
              disabled={isActionDisabled}
              onPress={() => void runAction(() => controller.resume(recoverableDraft.localId))}
              style={{ minHeight: 48, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary, alignItems: "center", justifyContent: "center", opacity: isActionDisabled ? 0.64 : 1 }}
            >
              <Text style={{ color: theme.colors.ink, fontSize: 15, fontWeight: "800" }}>이어서 편집</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isCreating ? "새 초대장을 만드는 중" : "이 디자인으로 새 초대장 시작"}
              accessibilityHint="기존 초안을 유지하고 새 초안을 만듭니다."
              accessibilityState={actionAccessibility.accessibilityState}
              disabled={isActionDisabled}
              onPress={() => void runAction(() => controller.start(template))}
              style={{ minHeight: 48, borderRadius: theme.radius.pill, backgroundColor: theme.colors.ink, alignItems: "center", justifyContent: "center", opacity: isActionDisabled ? 0.64 : 1 }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>{isCreating ? "초대장을 만드는 중" : "새로 시작"}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isCreating ? "초대장을 만드는 중" : "이 디자인으로 시작하기"}
          accessibilityHint="선택한 디자인으로 편집 가능한 새 초안을 만듭니다."
          accessibilityState={actionAccessibility.accessibilityState}
          disabled={isActionDisabled}
          onPress={() => void runAction(() => controller.start(template))}
          style={{ minHeight: 54, borderRadius: theme.radius.pill, backgroundColor: theme.colors.ink, alignItems: "center", justifyContent: "center", opacity: isActionDisabled ? 0.64 : 1, ...theme.shadow.heroButton }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>{isCreating ? "초대장을 만드는 중" : "이 디자인으로 시작하기"}</Text>
        </Pressable>
      )}

      {creationStatus === "failed" ? (
        <View accessibilityLiveRegion={actionAccessibility.errorLiveRegion} style={{ borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 10 }}>
          <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>{creationError}</Text>
          <Pressable accessibilityHint="실패한 초안 작업을 다시 시도합니다." accessibilityRole="button" onPress={() => void runAction(() => controller.retry())} style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>다시 시도</Text>
          </Pressable>
          <Pressable accessibilityHint="초안 작업을 중단하고 디자인 목록을 엽니다." accessibilityRole="button" onPress={() => router.dismissTo("/templates")} style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>디자인 목록으로 돌아가기</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

export default function TemplatePreviewScreen() {
  const router = useRouter();
  const { status: authStatus, user } = useAuth();
  const reduceMotionEnabled = useReducedMotion();
  const { templateId: templateIdParam, previewIntentKey: previewIntentKeyParam } = useLocalSearchParams<{
    templateId?: string | string[];
    previewIntentKey?: string | string[];
  }>();
  const { findById, source: catalogSource } = useTemplateCatalog();
  const templateId = Array.isArray(templateIdParam) ? templateIdParam[0] : templateIdParam;
  const previewIntentKey = Array.isArray(previewIntentKeyParam) ? previewIntentKeyParam[0] : previewIntentKeyParam;
  const hasValidIntent = isValidTemplatePreviewIntentKey(previewIntentKey);
  const ownerId = getDraftOwnerId(user);
  const catalogTemplate = templateId ? findById(templateId) : null;
  const validatedCatalogTemplate = catalogTemplate &&
    getTemplatePreviewExample(catalogTemplate.category) &&
    createTemplatePreviewPayload(catalogTemplate.category, catalogTemplate.id)
    ? catalogTemplate
    : null;
  const [selectedTemplateSnapshot, setSelectedTemplateSnapshot] = useState<TemplatePreviewSelection<MobileTemplateGalleryItem> | null>(null);
  const retainedTemplateSelection = retainFirstValidatedTemplateSelection(
    selectedTemplateSnapshot,
    templateId,
    validatedCatalogTemplate
  );
  if (retainedTemplateSelection !== selectedTemplateSnapshot) {
    setSelectedTemplateSnapshot(retainedTemplateSelection);
  }
  const template = retainedTemplateSelection?.template ?? null;
  const example = template ? getTemplatePreviewExample(template.category) : null;
  const payload = template ? createTemplatePreviewPayload(template.category, template.id) : null;
  const [inspection, setInspection] = useState<TemplatePreviewInspection>({
    status: "idle",
    ownerId: null,
    drafts: [],
    error: null
  });
  const [inspectionAttempt, setInspectionAttempt] = useState(0);
  const [canRecoverDraftStorage, setCanRecoverDraftStorage] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "recovering" | "failed">("idle");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const gate = getTemplatePreviewGate({
    authStatus,
    ownerId,
    hasTemplate: Boolean(template),
    hasValidIntent,
    inspection
  });
  const [inspectionAnnouncementController] = useState(() => createTemplatePreviewAnnouncementController((message) => {
    AccessibilityInfo.announceForAccessibility(message);
  }));

  useEffect(() => () => {
    inspectionAnnouncementController.cancel();
  }, [inspectionAnnouncementController]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const message = gate.status === "auth-loading" || gate.status === "checking" || gate.status === "load-error"
      ? gate.message
      : null;
    inspectionAnnouncementController.transition(`inspection:${gate.status}:${message ?? ""}`, message);
  }, [gate.message, gate.status, inspectionAnnouncementController]);

  useEffect(() => {
    if (!template) return;
    void recordRecentlyViewedTemplate(template.id);
  }, [template]);

  useEffect(() => {
    if (!shouldInspectTemplatePreviewDrafts({ authStatus, hasTemplate: Boolean(template), hasValidIntent })) return;
    let active = true;
    inspectDraftsForTemplatePreview(ownerId)
      .then((drafts) => {
        if (active) setInspection({ status: "ready", ownerId, drafts, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const storageIsCorrupt = isCorruptDraftStorageError(error);
        setCanRecoverDraftStorage(storageIsCorrupt);
        setInspection({
          status: "error",
          ownerId,
          drafts: [],
          error: storageIsCorrupt
            ? "저장된 초안 데이터가 손상되어 안전하게 열 수 없어요."
            : "초안 저장소를 확인하지 못했어요."
        });
      });
    return () => {
      active = false;
    };
  }, [authStatus, hasValidIntent, inspectionAttempt, ownerId, template]);

  function returnToList() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/templates");
  }

  function retryInspection() {
    setCanRecoverDraftStorage(false);
    setRecoveryStatus("idle");
    setRecoveryError(null);
    setInspection({ status: "idle", ownerId: null, drafts: [], error: null });
    setInspectionAttempt((attempt) => attempt + 1);
  }

  async function recoverDraftStorage() {
    if (recoveryStatus === "recovering") return;
    setRecoveryStatus("recovering");
    setRecoveryError(null);
    try {
      await quarantineAndResetCorruptDraftStorage();
      retryInspection();
    } catch (error) {
      setRecoveryStatus("failed");
      setRecoveryError(error instanceof Error ? error.message : "초안 저장소를 복구하지 못했어요.");
    }
  }

  function requestDraftStorageRecovery() {
    Alert.alert(
      "손상된 초안 저장소를 초기화할까요?",
      "읽을 수 없는 원본을 별도 백업에 그대로 보관한 뒤, 현재 초안 저장소만 초기화합니다. 기존 초안을 자동으로 복원하지는 못할 수 있어요.",
      [
        { text: "취소", style: "cancel" },
        { text: "백업 후 초기화", style: "destructive", onPress: () => void recoverDraftStorage() }
      ]
    );
  }

  if (!template && catalogSource === "loading" && hasValidIntent) {
    return (
      <SafeAreaView accessibilityLabel="디자인을 불러오는 중입니다" accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24, alignItems: "center", justifyContent: "center", gap: 14 }}>
        {reduceMotionEnabled ? null : <ActivityIndicator color={theme.colors.primaryDark} size="small" />}
        <Text style={{ color: theme.colors.muted, fontSize: 15 }}>디자인을 불러오는 중이에요.</Text>
      </SafeAreaView>
    );
  }

  if (!template || !example || !payload || !hasValidIntent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24, justifyContent: "center", gap: 16 }}>
        <Text accessibilityRole="header" style={{ color: theme.colors.ink, fontSize: 22, fontWeight: "800", textAlign: "center" }}>
          {template ? "미리보기 시작 정보를 확인할 수 없어요" : "디자인을 찾을 수 없어요"}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 23, textAlign: "center" }}>
          안전한 디자인 목록에서 다시 선택해 주세요.
        </Text>
        <Pressable
          accessibilityHint="안전한 디자인 목록으로 이동합니다."
          accessibilityRole="button"
          onPress={() => router.replace("/templates")}
          style={{ minHeight: 48, borderRadius: theme.radius.pill, backgroundColor: theme.colors.ink, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>디자인 목록으로 돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48, gap: 22 }} showsVerticalScrollIndicator={false}>
        <View style={{ minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Pressable
            accessibilityLabel="미리보기 닫기"
            accessibilityHint="디자인 목록으로 돌아갑니다."
            accessibilityRole="button"
            onPress={returnToList}
            style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: theme.colors.ink, fontSize: 19, fontWeight: "800" }}>‹</Text>
          </Pressable>
          <Text accessibilityRole="header" style={{ flex: 1, color: theme.colors.ink, fontSize: 21, fontWeight: "800", textAlign: "center" }}>
            디자인 미리보기
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: theme.colors.ink, fontSize: 13, fontWeight: "800" }}>예시 · {template.badge}</Text>
          <Text style={{ color: theme.colors.ink, fontSize: 28, fontWeight: "900", lineHeight: 36 }}>{template.name}</Text>
          <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 23 }}>{template.desc}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
            {getUniqueTemplateTags(template.tags).map((tag) => (
              <View key={tag} style={{ borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceSoft, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: theme.colors.ink, fontSize: 12, fontWeight: "700" }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <TemplatePreviewImage key={template.id} template={template} />

        <View style={{ width: "100%", maxWidth: 420, alignSelf: "center" }}>
          <InvitationPreviewCard compact payload={payload} />
        </View>

        <View style={{ borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 18, gap: 12 }}>
          <Text style={{ color: theme.colors.ink, fontSize: 18, fontWeight: "800" }}>예시 행사 정보</Text>
          <Text style={{ color: theme.colors.ink, fontSize: 12, lineHeight: 18 }}>
            아래 이름, 일정, 장소, 설명은 모두 디자인 확인용 가상 예시이며 저장되지 않습니다.
          </Text>
          {[
            ["행사", example.title],
            ["이름", `${example.primaryName} · ${example.secondaryName}`],
            ["일시", example.dateTime.replace("T", " ")],
            ["장소", `${example.venueName}\n${example.venueAddress}`],
            ["설명", example.message]
          ].map(([label, value]) => (
            <View key={label} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Text style={{ minWidth: 48, color: theme.colors.ink, fontSize: 13, fontWeight: "800", lineHeight: 21 }}>{label}</Text>
              <Text style={{ flex: 1, minWidth: 190, color: theme.colors.ink, fontSize: 14, lineHeight: 22 }}>{value}</Text>
            </View>
          ))}
        </View>

        {gate.status === "auth-loading" || gate.status === "checking" ? (
          <View accessibilityLabel={gate.message} accessibilityLiveRegion="polite" accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={{ minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }}>
            {reduceMotionEnabled ? null : <ActivityIndicator color={theme.colors.primaryDark} size="small" />}
            <Text style={{ color: theme.colors.muted, fontSize: 14 }}>{gate.message}</Text>
          </View>
        ) : gate.status === "load-error" ? (
          <View accessibilityLiveRegion="assertive" style={{ borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 16, gap: 10 }}>
            <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>{gate.message}</Text>
            <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20 }}>안전을 위해 초안을 확인하기 전에는 새 초대장을 만들거나 기존 초안을 열 수 없어요.</Text>
            {canRecoverDraftStorage ? (
              <>
                <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 20 }}>
                  원본을 별도 백업에 그대로 보관한 뒤 현재 저장소를 초기화하면 새 초대장을 다시 시작할 수 있어요. 이 작업은 확인 후에만 실행됩니다.
                </Text>
                <Pressable
                  accessibilityHint="확인 창을 열어 손상된 원본을 백업한 뒤 현재 초안 저장소를 초기화합니다."
                  accessibilityRole="button"
                  accessibilityState={{ disabled: recoveryStatus === "recovering", busy: recoveryStatus === "recovering" }}
                  disabled={recoveryStatus === "recovering"}
                  onPress={requestDraftStorageRecovery}
                  style={{ minHeight: 44, justifyContent: "center", opacity: recoveryStatus === "recovering" ? 0.64 : 1 }}
                >
                  <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>
                    {recoveryStatus === "recovering" ? "백업 후 초기화하는 중" : "원본 백업 후 저장소 초기화"}
                  </Text>
                </Pressable>
              </>
            ) : null}
            {recoveryStatus === "failed" && recoveryError ? (
              <Text accessibilityLiveRegion="assertive" style={{ color: theme.colors.ink, fontSize: 13, lineHeight: 20 }}>{recoveryError}</Text>
            ) : null}
            <Pressable accessibilityHint="이 계정의 기존 초안을 다시 확인합니다." accessibilityRole="button" onPress={retryInspection} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>다시 확인</Text>
            </Pressable>
            <Pressable accessibilityHint="초안 확인을 중단하고 디자인 목록을 엽니다." accessibilityRole="button" onPress={() => router.dismissTo("/templates")} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: theme.colors.ink, fontSize: 14, fontWeight: "800" }}>디자인 목록으로 돌아가기</Text>
            </Pressable>
          </View>
        ) : gate.status === "ready" && previewIntentKey ? (
          <TemplatePreviewActions
            key={`${ownerId}:${previewIntentKey}`}
            ownerId={ownerId}
            previewIntentKey={previewIntentKey}
            recoverableDraft={gate.recoverableDraft}
            template={template}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
