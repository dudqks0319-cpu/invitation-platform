import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InvitationPreviewCard } from "@/components/invitation/InvitationPreviewCard";
import { TemplateSampleTextOverlay } from "@/components/templates/TemplateSampleTextOverlay";
import { theme } from "@/components/ui/theme";
import { useAuth } from "@/hooks/useAuth";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTemplateCatalog } from "@/hooks/useTemplateCatalog";
import { getDraftOwnerId } from "@/lib/auth-access";
import { createOrReuseTemplatePreviewDraft, inspectDraftsForTemplatePreview } from "@/lib/drafts";
import { getTemplatePreviewSource } from "@/lib/template-image-source";
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

type CreationStatus = "idle" | "creating" | "failed" | "success";

function TemplatePreviewImage({ template }: { template: MobileTemplateGalleryItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const previewSource = imageFailed ? null : getTemplatePreviewSource(template);

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
            onError={() => setImageFailed(true)}
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

  useEffect(() => () => {
    controller.deactivate();
  }, [controller]);

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
  const { findById } = useTemplateCatalog();
  const templateId = Array.isArray(templateIdParam) ? templateIdParam[0] : templateIdParam;
  const previewIntentKey = Array.isArray(previewIntentKeyParam) ? previewIntentKeyParam[0] : previewIntentKeyParam;
  const hasValidIntent = isValidTemplatePreviewIntentKey(previewIntentKey);
  const ownerId = getDraftOwnerId(user);
  const template = templateId ? findById(templateId) : null;
  const example = template ? getTemplatePreviewExample(template.category) : null;
  const payload = template ? createTemplatePreviewPayload(template.category, template.id) : null;
  const [inspection, setInspection] = useState<TemplatePreviewInspection>({
    status: "idle",
    ownerId: null,
    drafts: [],
    error: null
  });
  const [inspectionAttempt, setInspectionAttempt] = useState(0);
  const gate = getTemplatePreviewGate({
    authStatus,
    ownerId,
    hasTemplate: Boolean(template),
    hasValidIntent,
    inspection
  });

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
      .catch(() => {
        if (active) setInspection({ status: "error", ownerId, drafts: [], error: "초안 저장소를 확인하지 못했어요." });
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
    setInspection({ status: "idle", ownerId: null, drafts: [], error: null });
    setInspectionAttempt((attempt) => attempt + 1);
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
            {template.tags.map((tag) => (
              <View key={tag} style={{ borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceSoft, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: theme.colors.ink, fontSize: 12, fontWeight: "700" }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <TemplatePreviewImage key={template.id} template={template} />

        <View accessible accessibilityLabel={`예시 초대장 미리보기 상세, ${example.title}`} style={{ width: "100%", maxWidth: 420, alignSelf: "center" }}>
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
