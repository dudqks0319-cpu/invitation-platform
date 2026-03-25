"use client";

import { useMemo, useState } from "react";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { LOCAL_DRAFT_KEY, defaultInvitationDraft, normalizeDraft, type InvitationDraftPayload } from "@/lib/invitation-payload";
import { getPublicShareUrl } from "@/lib/invitation-presentation";

type StoredDraft = {
  payload: InvitationDraftPayload;
  meta?: {
    slug?: string;
  };
};

export default function PreviewPage() {
  const [draft] = useState<StoredDraft>(() => {
    if (typeof window === "undefined") {
      return { payload: defaultInvitationDraft };
    }

    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) {
      return { payload: defaultInvitationDraft };
    }

    try {
      const parsed = JSON.parse(raw) as StoredDraft;
      return {
        payload: normalizeDraft(parsed.payload),
        meta: parsed.meta
      };
    } catch {
      return { payload: defaultInvitationDraft };
    }
  });
  const shareUrl = useMemo(() => {
    const nextPath = draft.meta?.slug ? `/invitations/${draft.meta.slug}` : "/preview";
    const origin = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin;

    return getPublicShareUrl(nextPath, origin);
  }, [draft.meta?.slug]);

  return (
    <>
      <SiteHeader />
      <div className="app-page-offset">
        <InvitationView
          mode="preview"
          payload={normalizeDraft(draft.payload)}
          shareUrl={shareUrl}
          slug={draft.meta?.slug}
        />
      </div>
    </>
  );
}
