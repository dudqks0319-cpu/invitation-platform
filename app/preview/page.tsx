"use client";

import { useState } from "react";
import { InvitationView } from "@/components/invitations/invitation-view";
import { SiteHeader } from "@/components/shared/site-header";
import { LOCAL_DRAFT_KEY, defaultInvitationDraft, normalizeDraft, type InvitationDraftPayload } from "@/lib/invitation-payload";

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

  return (
    <>
      <SiteHeader />
      <div className="app-page-offset">
        <InvitationView
          mode="preview"
          payload={normalizeDraft(draft.payload)}
          shareUrl={draft.meta?.slug ? `/i/${draft.meta.slug}` : "/preview"}
          slug={draft.meta?.slug}
        />
      </div>
    </>
  );
}
