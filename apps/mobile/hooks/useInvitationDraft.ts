import { useCallback, useEffect, useState } from "react";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { ensureDraft, saveDraft } from "@/lib/drafts";

export function useInvitationDraft(ownerId: string) {
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void ensureDraft(ownerId).then((nextDraft) => {
      if (!mounted) return;
      setDraft(nextDraft);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [ownerId]);

  const updateTitle = useCallback(async (title: string) => {
    setDraft((current) => {
      if (!current) return current;

      const nextDraft = {
        ...current,
        localUpdatedAt: new Date().toISOString(),
        payload: {
          ...current.payload,
          title
        }
      };

      void saveDraft(nextDraft);
      return nextDraft;
    });
  }, []);

  return {
    draft,
    loading,
    updateTitle
  };
}
