import type { InvitationPayload, PendingPhotoUpload } from "@/lib/invitation-shared";
import { supabase } from "@/lib/supabase";
import type { MobileInvitationDraft } from "@/lib/drafts";
import { getPublicInvitationUrl } from "@/lib/share";

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

export type PublishReadiness = {
  canPublish: boolean;
  missingFields: string[];
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureSlug(payload: InvitationPayload) {
  return payload.share.slug || `${slugify(payload.title || "invitehub")}-${Math.random().toString(36).slice(2, 8)}`;
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
    transportNote: payload.location.transportNote || "",
    mainImageUrl: payload.photos.mainUri || "",
    backgroundImageUrl: payload.photos.backgroundUri || ""
    ,
    galleryImages: payload.photos.gallery
      .map((item) => item.uri)
      .filter(Boolean)
  };
}

async function uploadPendingPhoto(
  photo: PendingPhotoUpload,
  userId: string,
  localId: string
) {
  if (!supabase) {
    throw new Error("Supabase 환경 변수가 없어 사진 업로드를 할 수 없습니다.");
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

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}

export async function saveDraftToSupabase(
  draft: MobileInvitationDraft,
  userId: string,
  status: "draft" | "published" = "draft"
) {
  if (!supabase) {
    throw new Error("Supabase 환경 변수가 없어 서버 저장을 할 수 없습니다.");
  }

  let payloadWithUploads = draft.payload;

  if (draft.pendingPhotos.length > 0) {
    for (const photo of draft.pendingPhotos) {
      const publicUrl = await uploadPendingPhoto(photo, userId, draft.localId);

      if (photo.slot === "main") {
        payloadWithUploads = {
          ...payloadWithUploads,
          photos: {
            ...payloadWithUploads.photos,
            mainUri: publicUrl
          }
        };
      } else if (photo.slot === "background") {
        payloadWithUploads = {
          ...payloadWithUploads,
          photos: {
            ...payloadWithUploads.photos,
            backgroundUri: publicUrl
          }
        };
      } else {
        payloadWithUploads = {
          ...payloadWithUploads,
          photos: {
            ...payloadWithUploads.photos,
            gallery: payloadWithUploads.photos.gallery.map((item) =>
              item.order === photo.order
                ? {
                    ...item,
                    uri: publicUrl
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
      ...toLegacyInvitationPayload(normalizedPayload)
    },
    published_at: status === "published" ? new Date().toISOString() : null
  };

  const query = draft.serverId
    ? supabase.from("invitations").update(row).eq("id", draft.serverId).select().single()
    : supabase.from("invitations").insert(row).select().single();

  const { data, error } = await query;
  if (error || !data) {
    throw new Error(error?.message || "서버 저장에 실패했습니다.");
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

  return data.map((row) => ({
    localId: row.id,
    serverId: row.id,
    payload: toSharedInvitationPayload(row as RemoteInvitationRow, userId),
    sourcePayload: (row as RemoteInvitationRow).payload,
    syncStatus: "synced",
    localUpdatedAt: String((row as RemoteInvitationRow).updated_at ?? new Date().toISOString()),
    pendingPhotos: [],
    isDirty: false
  }));
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

  return {
    localId: data.id,
    serverId: data.id,
    payload: toSharedInvitationPayload(data as RemoteInvitationRow, userId),
    sourcePayload: (data as RemoteInvitationRow).payload,
    syncStatus: "synced",
    localUpdatedAt: String((data as RemoteInvitationRow).updated_at ?? new Date().toISOString()),
    pendingPhotos: [],
    isDirty: false
  };
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
    throw new Error("Supabase 환경 변수가 없어 방명록 상태를 바꿀 수 없습니다.");
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
    throw new Error("Supabase 환경 변수가 없어 서버 삭제를 할 수 없습니다.");
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
