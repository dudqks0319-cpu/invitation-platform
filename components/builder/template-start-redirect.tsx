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
    <main
      className="app-shell"
      style={{
        alignItems: "center",
        background: "#f7f7f5",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24
      }}
    >
      <section
        aria-live="polite"
        role="status"
        style={{
          background: "#fff",
          border: "1px solid #e7e7e3",
          borderRadius: 24,
          boxShadow: "0 18px 50px rgba(25, 25, 25, 0.08)",
          maxWidth: 420,
          padding: "34px 28px",
          textAlign: "center",
          width: "100%"
        }}
      >
        <span
          aria-hidden="true"
          style={{
            animation: "os-template-spin 0.8s linear infinite",
            border: "3px solid #ecece8",
            borderRadius: "50%",
            borderTopColor: "#ff625a",
            display: "block",
            height: 38,
            margin: "0 auto 18px",
            width: 38
          }}
        />
        <strong style={{ color: "#222224", display: "block", fontSize: "1.05rem" }}>
          선택한 디자인을 준비하고 있어요
        </strong>
        <p style={{ color: "#7c7c81", fontSize: "0.82rem", lineHeight: 1.65, marginTop: 9 }}>
          행사 종류에 맞는 기본 문구와 장소 예시를 함께 불러옵니다.
        </p>
        <style>{`@keyframes os-template-spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    </main>
  );
}
