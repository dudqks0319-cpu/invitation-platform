"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LOCAL_DRAFT_KEY,
  defaultInvitationDraft,
  normalizeDraft,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";
import { applyCategoryTemplateDefaults } from "@/lib/invitation-presentation";
import { templates } from "@/lib/templates";

type StoredDraft = {
  payload?: unknown;
  meta?: Record<string, unknown>;
};

export function TemplateStartRedirect({ templateId }: { templateId: string }) {
  const router = useRouter();

  useEffect(() => {
    const selectedTemplate = templates.find((template) => template.id === templateId);

    if (!selectedTemplate) {
      router.replace("/builder");
      return;
    }

    let currentPayload: InvitationDraftPayload = defaultInvitationDraft;
    let currentMeta: Record<string, unknown> = {};

    try {
      const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredDraft;
        currentPayload = normalizeDraft(parsed.payload ?? {});
        currentMeta = parsed.meta ?? {};
      }
    } catch {
      currentPayload = defaultInvitationDraft;
      currentMeta = {};
    }

    const nextPayload = applyCategoryTemplateDefaults(
      currentPayload,
      selectedTemplate.category,
      selectedTemplate.id
    );

    window.localStorage.setItem(
      LOCAL_DRAFT_KEY,
      JSON.stringify({
        payload: nextPayload,
        meta: currentMeta
      })
    );

    router.replace(`/builder?template=${encodeURIComponent(selectedTemplate.id)}`);
  }, [router, templateId]);

  return (
    <main className="app-shell os-template-start">
      <section className="os-template-start-card" aria-live="polite" role="status">
        <span className="os-template-start-spinner" aria-hidden="true" />
        <strong>선택한 디자인을 준비하고 있어요</strong>
        <p>행사 종류에 맞는 기본 문구와 장소 예시를 함께 불러옵니다.</p>
      </section>
    </main>
  );
}
