import { describe, expect, it, vi } from "vitest";
import {
  getTemplatePreviewActionAccessibility,
  getTemplatePreviewGate,
  shouldInspectTemplatePreviewDrafts,
  type TemplatePreviewInspection
} from "./template-preview-presenter";

const readyFor = (ownerId: string): TemplatePreviewInspection => ({
  status: "ready",
  ownerId,
  drafts: [{
    localId: `${ownerId}-draft`,
    localUpdatedAt: "2026-07-23T00:00:00.000Z",
    payload: { ownerId, templateId: "wedding-classic", isPublished: false }
  }],
  error: null
});

describe("template preview fail-closed presenter", () => {
  it("blocks lookup and CTA while auth is loading", () => {
    const lookup = vi.fn();
    expect(shouldInspectTemplatePreviewDrafts({ authStatus: "loading", hasTemplate: true, hasValidIntent: true })).toBe(false);
    if (shouldInspectTemplatePreviewDrafts({ authStatus: "loading", hasTemplate: true, hasValidIntent: true })) lookup();
    const gate = getTemplatePreviewGate({
      authStatus: "loading",
      ownerId: "local-preview-owner",
      hasTemplate: true,
      hasValidIntent: true,
      inspection: { status: "idle", ownerId: null, drafts: [], error: null }
    });
    expect(lookup).not.toHaveBeenCalled();
    expect(gate).toMatchObject({ status: "auth-loading", canCreateOrResume: false, recoverableDraft: null });
  });

  it("hides a prior owner's result immediately after an account switch", () => {
    const gate = getTemplatePreviewGate({
      authStatus: "authenticated",
      ownerId: "account-b",
      hasTemplate: true,
      hasValidIntent: true,
      inspection: readyFor("account-a")
    });
    expect(gate).toMatchObject({ status: "checking", canCreateOrResume: false, recoverableDraft: null });
  });

  it("keeps unknown templates and invalid intents safe", () => {
    expect(getTemplatePreviewGate({
      authStatus: "anonymous",
      ownerId: "local-preview-owner",
      hasTemplate: false,
      hasValidIntent: true,
      inspection: readyFor("local-preview-owner")
    }).status).toBe("invalid-template");
    expect(getTemplatePreviewGate({
      authStatus: "anonymous",
      ownerId: "local-preview-owner",
      hasTemplate: true,
      hasValidIntent: false,
      inspection: readyFor("local-preview-owner")
    }).status).toBe("invalid-intent");
  });

  it("turns read failures into a disabled explicit load-error state", () => {
    const gate = getTemplatePreviewGate({
      authStatus: "authenticated",
      ownerId: "account-a",
      hasTemplate: true,
      hasValidIntent: true,
      inspection: { status: "error", ownerId: "account-a", drafts: [], error: "초안 저장소를 확인하지 못했어요." }
    });
    expect(gate).toEqual({
      status: "load-error",
      canCreateOrResume: false,
      recoverableDraft: null,
      message: "초안 저장소를 확인하지 못했어요."
    });
  });

  it("opens CTA only after a successful owner-scoped lookup", () => {
    const gate = getTemplatePreviewGate({
      authStatus: "authenticated",
      ownerId: "account-a",
      hasTemplate: true,
      hasValidIntent: true,
      inspection: readyFor("account-a")
    });
    expect(gate.status).toBe("ready");
    expect(gate.canCreateOrResume).toBe(true);
    expect(gate.recoverableDraft?.localId).toBe("account-a-draft");
  });

  it("presents truthful busy and assertive error accessibility states", () => {
    expect(getTemplatePreviewActionAccessibility("creating")).toEqual({
      accessibilityState: { busy: true, disabled: true },
      errorLiveRegion: "none"
    });
    expect(getTemplatePreviewActionAccessibility("failed")).toEqual({
      accessibilityState: { busy: false, disabled: false },
      errorLiveRegion: "assertive"
    });
  });
});
