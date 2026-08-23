"use client";

import { useSyncExternalStore } from "react";
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

function subscribeStoredDraft(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredDraftSnapshot() {
  return window.localStorage.getItem(LOCAL_DRAFT_KEY) ?? "";
}

function getServerStoredDraftSnapshot() {
  return "";
}

function parseStoredDraft(raw: string): StoredDraft {
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
}

export default function PreviewPage() {
  const draftSnapshot = useSyncExternalStore(
    subscribeStoredDraft,
    getStoredDraftSnapshot,
    getServerStoredDraftSnapshot
  );
  const draft = parseStoredDraft(draftSnapshot);
  const nextPath = draft.meta?.slug ? `/invitations/${draft.meta.slug}` : "/preview";
  const origin = typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin;
  const shareUrl = getPublicShareUrl(nextPath, origin);

  return (
    <>
      <SiteHeader mode="focus" />
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
