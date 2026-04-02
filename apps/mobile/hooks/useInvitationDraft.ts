import { useCallback, useEffect, useMemo, useState } from "react";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { ensureDraft, saveDraft, upsertPendingPhoto } from "@/lib/drafts";
import {
  updateInvitationBasics,
  updateWeddingFamily,
  updateWeddingNames,
  type PendingPhotoUpload
} from "@/lib/invitation-shared";
import { getPublishReadiness, saveDraftToSupabase } from "@/lib/invitations";
import { getPublicInvitationUrl } from "@/lib/share";

function withMeta(draft: MobileInvitationDraft) {
  return {
    ...draft,
    localUpdatedAt: new Date().toISOString(),
    isDirty: true,
    syncStatus: "pending" as const
  };
}

export function useInvitationDraft(ownerId: string, localId?: string) {
  const [draft, setDraft] = useState<MobileInvitationDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void ensureDraft(ownerId, localId).then((nextDraft) => {
      if (!mounted) return;
      setDraft(nextDraft);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [localId, ownerId]);

  const persist = useCallback((updater: (current: MobileInvitationDraft) => MobileInvitationDraft) => {
    setDraft((current) => {
      if (!current) return current;

      const nextDraft = updater(current);
      void saveDraft(nextDraft);
      return nextDraft;
    });
  }, []);

  const updateBasics = useCallback((patch: Partial<{
    title: string;
    eventDateTime: string;
    venueName: string;
    venueAddress: string;
    message: string;
  }>) => {
    persist((current) => withMeta({
      ...current,
      payload: updateInvitationBasics(current.payload, patch)
    }));
  }, [persist]);

  const updateCouple = useCallback((patch: {
    groomName?: string;
    brideName?: string;
    groomFatherName?: string;
    groomMotherName?: string;
    brideFatherName?: string;
    brideMotherName?: string;
  }) => {
    persist((current) => withMeta({
      ...current,
      payload: updateWeddingFamily(
        updateWeddingNames(current.payload, patch),
        patch
      )
    }));
  }, [persist]);

  const updateAccounts = useCallback((patch: Partial<{
    primaryBank: string;
    primaryHolder: string;
    primaryAccount: string;
    secondaryBank: string;
    secondaryHolder: string;
    secondaryAccount: string;
    kakaoPayLink: string;
  }>) => {
    persist((current) => withMeta({
      ...current,
      payload: {
        ...current.payload,
        accounts: {
          ...current.payload.accounts,
          primary: {
            bank: patch.primaryBank ?? current.payload.accounts.primary?.bank ?? "",
            holder: patch.primaryHolder ?? current.payload.accounts.primary?.holder ?? "",
            account: patch.primaryAccount ?? current.payload.accounts.primary?.account ?? ""
          },
          secondary: {
            bank: patch.secondaryBank ?? current.payload.accounts.secondary?.bank ?? "",
            holder: patch.secondaryHolder ?? current.payload.accounts.secondary?.holder ?? "",
            account: patch.secondaryAccount ?? current.payload.accounts.secondary?.account ?? ""
          },
          kakaoPayLink: patch.kakaoPayLink ?? current.payload.accounts.kakaoPayLink
        }
      }
    }));
  }, [persist]);

  const updateLocation = useCallback((patch: Partial<{
    naverMapUrl: string;
    transportNote: string;
  }>) => {
    persist((current) => withMeta({
      ...current,
      payload: {
        ...current.payload,
        location: {
          ...current.payload.location,
          ...patch
        }
      }
    }));
  }, [persist]);

  const updatePhoto = useCallback((slot: "main" | "background", localUri: string) => {
    persist((current) => {
      const pendingPhoto: PendingPhotoUpload = {
        localUri,
        slot,
        retryCount: 0
      };

      return withMeta({
        ...current,
        pendingPhotos: upsertPendingPhoto(current.pendingPhotos, pendingPhoto),
        payload: {
          ...current.payload,
          photos: {
            ...current.payload.photos,
            ...(slot === "main" ? { mainUri: localUri } : { backgroundUri: localUri })
          }
        }
      });
    });
  }, [persist]);

  const addGalleryPhoto = useCallback((localUri: string) => {
    persist((current) => {
      const nextOrder = current.payload.photos.gallery.length;
      const pendingPhoto: PendingPhotoUpload = {
        localUri,
        slot: "gallery",
        order: nextOrder,
        retryCount: 0
      };

      return withMeta({
        ...current,
        pendingPhotos: upsertPendingPhoto(current.pendingPhotos, pendingPhoto),
        payload: {
          ...current.payload,
          photos: {
            ...current.payload.photos,
            gallery: [
              ...current.payload.photos.gallery,
              {
                uri: localUri,
                order: nextOrder
              }
            ]
          }
        }
      });
    });
  }, [persist]);

  const removeGalleryPhoto = useCallback((order: number) => {
    persist((current) => withMeta({
      ...current,
      pendingPhotos: current.pendingPhotos.filter((photo) => !(photo.slot === "gallery" && photo.order === order)),
      payload: {
        ...current.payload,
        photos: {
          ...current.payload.photos,
          gallery: current.payload.photos.gallery
            .filter((item) => item.order !== order)
            .map((item, index) => ({
              ...item,
              order: index
            }))
        }
      }
    }));
  }, [persist]);

  const saveToCloud = useCallback(async (userId: string, status: "draft" | "published" = "draft") => {
    if (!draft) {
      throw new Error("저장할 초안이 없습니다.");
    }

    const result = await saveDraftToSupabase(draft, userId, status);
    const nextDraft: MobileInvitationDraft = {
      ...draft,
      serverId: result.serverId,
      payload: result.payload,
      pendingPhotos: result.pendingPhotos,
      syncStatus: "synced",
      isDirty: false,
      localUpdatedAt: new Date().toISOString()
    };

    await saveDraft(nextDraft);
    setDraft(nextDraft);
    return nextDraft;
  }, [draft]);

  const applyRemotePublish = useCallback((serverId: string, slug: string) => {
    persist((current) => ({
      ...current,
      serverId,
      syncStatus: "synced",
      isDirty: false,
      localUpdatedAt: new Date().toISOString(),
      payload: {
        ...current.payload,
        isPublished: true,
        share: {
          ...current.payload.share,
          slug
        }
      }
    }));
  }, [persist]);

  const publishReadiness = useMemo(
    () =>
      draft
        ? getPublishReadiness(draft.payload)
        : {
            canPublish: false,
            missingFields: ["초대장 초안"]
          },
    [draft]
  );

  const publicUrl = draft?.payload.share.slug ? getPublicInvitationUrl(draft.payload.share.slug) : "";
  const canShare = Boolean(draft?.payload.isPublished && draft.payload.share.slug);

  return {
    addGalleryPhoto,
    applyRemotePublish,
    canShare,
    draft,
    loading,
    publicUrl,
    publishReadiness,
    removeGalleryPhoto,
    saveToCloud,
    updateAccounts,
    updateBasics,
    updateCouple,
    updateLocation,
    updatePhoto
  };
}
