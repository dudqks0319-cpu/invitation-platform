import type { InvitationPayload, PendingPhotoUpload } from "./invitation-shared";
import { getMobileInvitationPricing } from "./payments/pricing";
export { getPublishAccess } from "./publish-access";
import { supabase } from "./supabase";
import type { MobileInvitationDraft } from "./drafts";
import { getPublicInvitationUrl } from "./share";
import { getInviteHubBaseUrl } from "./web-links";

type RemoteInvitationRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  template_id: string;
  status?: string;
  updated_at?: string;
  payload: Record<string, unknown>;
};

const STORAGE_BUCKET = "invitation-assets";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;
const PUBLIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/i;
const SHORT_SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const SHORT_SLUG_TOKEN_LENGTH = 10;

export type PublishReadiness = {
  canPublish: boolean;
  missingFields: string[];
};

export function requiresPaymentBeforePublish(payload: InvitationPayload) {
  return !getMobileInvitationPricing(payload).isFree;
}

function createShortInvitationSlug() {
  const bytes = new Uint8Array(SHORT_SLUG_TOKEN_LENGTH);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  const token = Array.from(bytes, (byte) => SHORT_SLUG_ALPHABET[byte % SHORT_SLUG_ALPHABET.length]).join("");
  return `iv-${token}`;
}

function ensureSlug(payload: InvitationPayload) {
  const existingSlug = payload.share.slug.trim().toLowerCase();

  if (PUBLIC_SLUG_PATTERN.test(existingSlug)) {
    return existingSlug;
  }

  return createShortInvitationSlug();
}

export function getPublishReadiness(payload: InvitationPayload): PublishReadiness {
  const missingFields: string[] = [];

  if (!payload.title.trim()) missingFields.push("초대장 제목");
  if (!payload.eventDateTime.trim()) missingFields.push("행사 일시");
  if (!payload.venueName.trim()) missingFields.push("예식장 이름");
  if (!payload.venueAddress.trim()) missingFields.push("예식장 주소");
  if (!payload.eventData.groom.name.trim()) missingFields.push("신랑 이름");
  if (!payload.eventData.bride.name.trim()) missingFields.push("신부 이름");

  return {
    canPublish: missingFields.length === 0,
    missingFields
  };
}

export function toLegacyInvitationPayload(payload: InvitationPayload) {
  return {
    schemaVersion: payload.schemaVersion,
    templateId: payload.templateId,
    category: payload.eventType,
    title: payload.title,
    eventDateTime: payload.eventDateTime,
    venueName: payload.venueName,
    venueAddress: payload.venueAddress,
    message: payload.message,
    groomName: payload.eventData.groom.name,
    brideName: payload.eventData.bride.name,
    groomPhone: payload.eventData.groom.phone || "",
    bridePhone: payload.eventData.bride.phone || "",
    groomFatherName: payload.eventData.groomParents.father?.name || "",
    groomMotherName: payload.eventData.groomParents.mother?.name || "",
    brideFatherName: payload.eventData.brideParents.father?.name || "",
    brideMotherName: payload.eventData.brideParents.mother?.name || "",
    groomBank: payload.accounts.primary?.bank || "",
    groomBankHolder: payload.accounts.primary?.holder || "",
    groomBankAccount: payload.accounts.primary?.account || "",
    brideBank: payload.accounts.secondary?.bank || "",
    brideBankHolder: payload.accounts.secondary?.holder || "",
    brideBankAccount: payload.accounts.secondary?.account || "",
    kakaoPayLink: payload.accounts.kakaoPayLink || "",
    shareUrl: payload.share.slug,
    mapAddress: payload.venueAddress,
    naverMapLink: payload.location.naverMapUrl || "",
    kakaoMapLink: payload.location.kakaoMapUrl || "",
    transportNote: payload.location.transportNote || "",
    mainImageUrl: payload.photos.mainUri || "",
    backgroundImageUrl: payload.photos.backgroundUri || ""
    ,
    galleryImages: payload.photos.gallery
      .map((item) => item.uri)
      .filter(Boolean)
  };
}

export async function publishGuestInvitation(draft: MobileInvitationDraft) {
  const slug = ensureSlug(draft.payload);
  const payload = toLegacyInvitationPayload({
    ...draft.payload,
    share: {
      ...draft.payload.share,
      slug
    },
    isPublished: true
  });

  const response = await fetch(`${getInviteHubBaseUrl()}/api/public/guest-publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      payload,
      website: ""
    })
  });

  const result = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    invitationId?: string;
    slug?: string;
  };

  if (!response.ok || !result.success || !result.invitationId || !result.slug) {
    throw new Error(result.message || "무료 게스트 발행에 실패했습니다.");
  }

  return {
    invitationId: result.invitationId,
    slug: result.slug
  };
}

async function uploadPendingPhoto(
  photo: PendingPhotoUpload,
  userId: string,
  localId: string
) {
  if (!supabase) {
    throw new Error("사진 저장 기능을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  const response = await fetch(photo.localUri);
  if (!response.ok) {
    throw new Error(`선택한 ${photo.slot} 사진을 읽지 못했습니다.`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const extension = photo.localUri.toLowerCase().includes(".png") ? "png" : "jpg";
  const path = `${userId}/${localId}/${photo.slot}-${photo.order ?? "single"}-${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: extension === "png" ? "image/png" : "image/jpeg",
      upsert: false
    });

  if (error || !data) {
    throw new Error(error?.message || `${photo.slot} 사진 업로드에 실패했습니다.`);
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(data.path, 60 * 60 * 24 * 7);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error("업로드한 사진의 미리보기 URL을 생성하지 못했습니다.");
  }

  return {
    path: data.path,
    signedUrl: signedUrlData.signedUrl
  };
}

export async function saveDraftToSupabase(
  draft: MobileInvitationDraft,
  userId: string,
  status: "draft" | "published" = "draft"
) {
  if (!supabase) {
    throw new Error("초대장을 안전하게 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  let payloadWithUploads = draft.payload;
  let mainImagePath =
    typeof draft.sourcePayload?.mainImagePath === "string" ? draft.sourcePayload.mainImagePath : "";
  let backgroundImagePath =
    typeof draft.sourcePayload?.backgroundImagePath === "string" ? draft.sourcePayload.backgroundImagePath : "";
  let galleryImagePaths = Array.isArray(draft.sourcePayload?.galleryImagePaths)
    ? draft.sourcePayload.galleryImagePaths.filter((item): item is string => typeof item === "string")
    : [];

  if (draft.pendingPhotos.length > 0) {
    for (const photo of draft.pendingPhotos) {
      const uploaded = await uploadPendingPhoto(photo, userId, draft.localId);

      if (photo.slot === "main") {
        mainImagePath = uploaded.path;
        payloadWithUploads = {
          ...payloadWithUploads,
          photos: {
            ...payloadWithUploads.photos,
            mainUri: uploaded.signedUrl
          }
        };
      } else if (photo.slot === "background") {
        backgroundImagePath = uploaded.path;
        payloadWithUploads = {
          ...payloadWithUploads,
          photos: {
            ...payloadWithUploads.photos,
            backgroundUri: uploaded.signedUrl
          }
        };
      } else {
        const nextGalleryPaths = [...galleryImagePaths];
        nextGalleryPaths[photo.order ?? nextGalleryPaths.length] = uploaded.path;
        galleryImagePaths = nextGalleryPaths;
        payloadWithUploads = {
          ...payloadWithUploads,
          photos: {
            ...payloadWithUploads.photos,
            gallery: payloadWithUploads.photos.gallery.map((item) =>
              item.order === photo.order
                ? {
                    ...item,
                    uri: uploaded.signedUrl
                  }
                : item
            )
          }
        };
      }
    }
  }

  const slug = ensureSlug(payloadWithUploads);
  const normalizedPayload: InvitationPayload = {
    ...payloadWithUploads,
    share: {
      ...payloadWithUploads.share,
      slug
    },
    isPublished: status === "published"
  };

  if (status === "published") {
    const readiness = getPublishReadiness(normalizedPayload);

    if (!readiness.canPublish) {
      throw new Error(`공개 발행 전 입력이 필요한 항목: ${readiness.missingFields.join(", ")}`);
    }

    if (requiresPaymentBeforePublish(normalizedPayload)) {
      throw new Error("유료 옵션이 포함되어 있어 스토어 결제를 완료해야 공개할 수 있습니다.");
    }
  }

  const row = {
    user_id: userId,
    slug,
    title: normalizedPayload.title || "결혼식 초대장",
    category: "wedding",
    template_id: normalizedPayload.templateId,
    status,
    payload: {
      ...(draft.sourcePayload ?? {}),
      ...toLegacyInvitationPayload(normalizedPayload),
      mainImagePath,
      backgroundImagePath,
      galleryImagePaths
    },
    published_at: status === "published" ? new Date().toISOString() : null
  };

  const query = draft.serverId
    ? supabase.from("invitations").update(row).eq("id", draft.serverId).select().single()
    : supabase.from("invitations").insert(row).select().single();

  const { data, error } = await query;
  if (error || !data) {
    throw new Error(error?.message || "초대장을 저장하지 못했습니다.");
  }

  return {
    payload: normalizedPayload,
    pendingPhotos: [],
    publicUrl: getPublicInvitationUrl(slug),
    serverId: data.id as string
  };
}

function toSharedInvitationPayload(row: RemoteInvitationRow, ownerId: string): InvitationPayload {
  const payload = row.payload ?? {};

  return {
    schemaVersion: 2,
    eventType: "wedding",
    templateId: String(payload.templateId ?? row.template_id ?? "wedding-classic"),
    title: String(payload.title ?? row.title ?? "결혼식 초대장"),
    eventDateTime: String(payload.eventDateTime ?? ""),
    venueName: String(payload.venueName ?? ""),
    venueAddress: String(payload.venueAddress ?? ""),
    message: String(payload.message ?? ""),
    eventData: {
      type: "wedding",
      groom: {
        name: String(payload.groomName ?? ""),
        phone: String(payload.groomPhone ?? "")
      },
      bride: {
        name: String(payload.brideName ?? ""),
        phone: String(payload.bridePhone ?? "")
      },
      groomParents: {
        father: payload.groomFatherName ? { name: String(payload.groomFatherName), phone: String(payload.groomFatherPhone ?? "") } : undefined,
        mother: payload.groomMotherName ? { name: String(payload.groomMotherName), phone: String(payload.groomMotherPhone ?? "") } : undefined
      },
      brideParents: {
        father: payload.brideFatherName ? { name: String(payload.brideFatherName), phone: String(payload.brideFatherPhone ?? "") } : undefined,
        mother: payload.brideMotherName ? { name: String(payload.brideMotherName), phone: String(payload.brideMotherPhone ?? "") } : undefined
      }
    },
    photos: {
      mainUri: String(payload.mainImageUrl ?? ""),
      backgroundUri: String(payload.backgroundImageUrl ?? ""),
      gallery: Array.isArray(payload.galleryImages)
        ? payload.galleryImages
            .filter((item): item is string => typeof item === "string" && item.length > 0)
            .map((uri, index) => ({ uri, order: index }))
        : []
    },
    accounts: {
      primary: {
        bank: String(payload.groomBank ?? ""),
        holder: String(payload.groomBankHolder ?? ""),
        account: String(payload.groomBankAccount ?? "")
      },
      secondary: {
        bank: String(payload.brideBank ?? ""),
        holder: String(payload.brideBankHolder ?? ""),
        account: String(payload.brideBankAccount ?? "")
      },
      kakaoPayLink: String(payload.kakaoPayLink ?? "")
    },
    location: {
      naverMapUrl: String(payload.naverMapLink ?? ""),
      kakaoMapUrl: String(payload.kakaoMapLink ?? ""),
      transportNote: String(payload.transportNote ?? "")
    },
    share: {
      slug: row.slug
    },
    ownerId,
    planTier: "free",
    isPublished: row.status === "published"
  };
}

async function createSignedAssetUrl(path: string) {
  if (!supabase || !path) {
    return "";
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return "";
  }

  return data.signedUrl;
}

async function toSharedInvitationDraft(row: RemoteInvitationRow, ownerId: string): Promise<MobileInvitationDraft> {
  const payload = row.payload ?? {};
  const mainImagePath = typeof payload.mainImagePath === "string" ? payload.mainImagePath : "";
  const backgroundImagePath = typeof payload.backgroundImagePath === "string" ? payload.backgroundImagePath : "";
  const galleryImagePaths = Array.isArray(payload.galleryImagePaths)
    ? payload.galleryImagePaths.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

  const [signedMainUrl, signedBackgroundUrl, signedGalleryUrls] = await Promise.all([
    mainImagePath ? createSignedAssetUrl(mainImagePath) : Promise.resolve(""),
    backgroundImagePath ? createSignedAssetUrl(backgroundImagePath) : Promise.resolve(""),
    Promise.all(galleryImagePaths.map((path) => createSignedAssetUrl(path)))
  ]);

  const nextPayload = toSharedInvitationPayload(
    {
      ...row,
      payload: {
        ...payload,
        ...(signedMainUrl ? { mainImageUrl: signedMainUrl } : {}),
        ...(signedBackgroundUrl ? { backgroundImageUrl: signedBackgroundUrl } : {}),
        ...(signedGalleryUrls.length > 0 ? { galleryImages: signedGalleryUrls } : {})
      }
    },
    ownerId
  );

  return {
    localId: row.id,
    serverId: row.id,
    payload: nextPayload,
    sourcePayload: row.payload,
    syncStatus: "synced",
    localUpdatedAt: String(row.updated_at ?? new Date().toISOString()),
    pendingPhotos: [],
    isDirty: false
  };
}

export async function listRemoteInvitations(userId: string): Promise<MobileInvitationDraft[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("invitations")
    .select("id, slug, title, category, template_id, status, updated_at, payload")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return Promise.all(data.map((row) => toSharedInvitationDraft(row as RemoteInvitationRow, userId)));
}

export async function loadRemoteInvitation(serverId: string, userId: string): Promise<MobileInvitationDraft | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("invitations")
    .select("id, slug, title, category, template_id, status, updated_at, payload")
    .eq("id", serverId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toSharedInvitationDraft(data as RemoteInvitationRow, userId);
}

export type RemoteRsvpSummary = {
  totalResponses: number;
  attending: number;
  declined: number;
  totalGuests: number;
};

export type RemoteRsvpEntry = {
  id: string;
  guestName: string;
  guestPhone: string;
  attending: boolean;
  guests: number;
  memo: string;
  createdAt: string;
};

export type RemoteGuestbookEntry = {
  id: string;
  nickname: string;
  message: string;
  approved: boolean;
  createdAt: string;
};

export async function listRemoteRsvps(invitationId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((entry) => ({
    id: entry.id as string,
    guestName: String(entry.guest_name ?? ""),
    guestPhone: String(entry.guest_phone ?? ""),
    attending: Boolean(entry.attending),
    guests: Number(entry.guests ?? 0),
    memo: String(entry.memo ?? ""),
    createdAt: String(entry.created_at ?? "")
  })) as RemoteRsvpEntry[];
}

export async function getRemoteRsvpSummary(invitationId: string): Promise<RemoteRsvpSummary> {
  const entries = await listRemoteRsvps(invitationId);
  const attendingEntries = entries.filter((entry) => entry.attending);

  return {
    totalResponses: entries.length,
    attending: attendingEntries.length,
    declined: entries.length - attendingEntries.length,
    totalGuests: attendingEntries.reduce((sum, entry) => sum + entry.guests, 0)
  };
}

export async function listRemoteGuestbook(invitationId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("guestbook_entries")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((entry) => ({
    id: entry.id as string,
    nickname: String(entry.nickname ?? ""),
    message: String(entry.message ?? ""),
    approved: Boolean(entry.approved),
    createdAt: String(entry.created_at ?? "")
  })) as RemoteGuestbookEntry[];
}

export async function getRemoteVisitCount(invitationId: string) {
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("view_logs")
    .select("*", { count: "exact", head: true })
    .eq("invitation_id", invitationId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function updateRemoteGuestbookApproval(entryId: string, approved: boolean) {
  if (!supabase) {
    throw new Error("방명록 상태를 변경할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  const { error } = await supabase
    .from("guestbook_entries")
    .update({ approved })
    .eq("id", entryId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteRemoteInvitation(serverId: string, userId: string) {
  if (!supabase) {
    throw new Error("초대장을 삭제할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", serverId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
