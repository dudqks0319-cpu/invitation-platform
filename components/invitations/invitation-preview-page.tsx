"use client";

import { useEffect, useMemo, useState } from "react";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import {
  LOCAL_DRAFT_KEY,
  defaultInvitationDraft,
  normalizeDraft,
  type InvitationDraftPayload
} from "@/lib/invitation-payload";
import { getPublicShareUrl } from "@/lib/invitation-presentation";
import { getTemplateDefaultTextPlacement, templates } from "@/lib/templates";

type StoredDraft = {
  payload: InvitationDraftPayload;
  meta?: {
    slug?: string;
  };
};

export function resolvePreviewPayload(payload: InvitationDraftPayload, initialTemplateId?: string) {
  const selectedTemplate = initialTemplateId
    ? templates.find((template) => template.id === initialTemplateId)
    : null;

  if (!selectedTemplate) {
    return normalizeDraft(payload);
  }

  return normalizeDraft({
    ...payload,
    category: selectedTemplate.category,
    templateId: selectedTemplate.id,
    templateTextPlacement: getTemplateDefaultTextPlacement(selectedTemplate)
  });
}

export function InvitationPreviewPage({ initialTemplateId }: { initialTemplateId?: string }) {
  const [draft, setDraft] = useState<StoredDraft>(() => ({
    payload: resolvePreviewPayload(defaultInvitationDraft, initialTemplateId)
  }));
  const [clientOrigin, setClientOrigin] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setClientOrigin(window.location.origin);
      const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);

      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as StoredDraft;
        setDraft({
          payload: resolvePreviewPayload(parsed.payload, initialTemplateId),
          meta: parsed.meta
        });
      } catch {
        setDraft({ payload: resolvePreviewPayload(defaultInvitationDraft, initialTemplateId) });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialTemplateId]);

  const shareUrl = useMemo(() => {
    const nextPath = draft.meta?.slug ? `/i/${draft.meta.slug}` : "/preview";
    const origin = clientOrigin ?? process.env.NEXT_PUBLIC_SITE_URL;

    return getPublicShareUrl(nextPath, origin);
  }, [clientOrigin, draft.meta?.slug]);

  return (
    <>
      <SiteHeader mode="focus" />
      <div className="app-page-offset">
        <InvitationView
          mode="preview"
          payload={resolvePreviewPayload(draft.payload, initialTemplateId)}
          shareUrl={shareUrl}
          slug={draft.meta?.slug}
        />
      </div>
    </>
  );
}
