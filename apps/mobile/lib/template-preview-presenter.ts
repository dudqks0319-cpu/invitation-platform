import type { AuthStatusLike } from "./auth-access";

export type TemplatePreviewDraftSummary = {
  localId: string;
  localUpdatedAt: string;
  payload: { ownerId: string; templateId: string; isPublished: boolean };
};

export type TemplatePreviewInspection = {
  status: "idle" | "ready" | "error";
  ownerId: string | null;
  drafts: TemplatePreviewDraftSummary[];
  error: string | null;
};

export type TemplatePreviewActionStatus = "idle" | "creating" | "failed" | "success";

export function getTemplatePreviewActionAccessibility(status: TemplatePreviewActionStatus) {
  const busy = status === "creating";
  const disabled = busy || status === "success";
  return {
    accessibilityState: { busy, disabled },
    errorLiveRegion: status === "failed" ? "assertive" as const : "none" as const
  };
}

type PreviewGateInput = {
  authStatus: AuthStatusLike;
  ownerId: string;
  hasTemplate: boolean;
  hasValidIntent: boolean;
  inspection: TemplatePreviewInspection;
};

export function shouldInspectTemplatePreviewDrafts({
  authStatus,
  hasTemplate,
  hasValidIntent
}: Pick<PreviewGateInput, "authStatus" | "hasTemplate" | "hasValidIntent">) {
  return authStatus !== "loading" && hasTemplate && hasValidIntent;
}

export function getTemplatePreviewGate({
  authStatus,
  ownerId,
  hasTemplate,
  hasValidIntent,
  inspection
}: PreviewGateInput) {
  if (!hasTemplate) {
    return { status: "invalid-template" as const, canCreateOrResume: false, recoverableDraft: null, message: "디자인을 찾을 수 없어요." };
  }
  if (!hasValidIntent) {
    return { status: "invalid-intent" as const, canCreateOrResume: false, recoverableDraft: null, message: "미리보기 시작 정보를 확인할 수 없어요." };
  }
  if (authStatus === "loading") {
    return { status: "auth-loading" as const, canCreateOrResume: false, recoverableDraft: null, message: "로그인 상태를 확인하는 중입니다." };
  }
  if (inspection.ownerId !== ownerId || inspection.status === "idle") {
    return { status: "checking" as const, canCreateOrResume: false, recoverableDraft: null, message: "기존 초안을 확인하는 중입니다." };
  }
  if (inspection.status === "error") {
    return { status: "load-error" as const, canCreateOrResume: false, recoverableDraft: null, message: inspection.error ?? "초안 저장소를 확인하지 못했어요." };
  }
  return {
    status: "ready" as const,
    canCreateOrResume: true,
    recoverableDraft: inspection.drafts[0] ?? null,
    message: ""
  };
}
