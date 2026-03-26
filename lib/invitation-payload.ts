import { z } from "zod";
import type { Database } from "@/lib/supabase/types";

export const LOCAL_DRAFT_KEY = "invitehub_builder_draft_v3";
export const LOCAL_GUESTBOOK_KEY = "invitehub_local_guestbook_preview";
export const LOCAL_RSVP_KEY = "invitehub_local_rsvp_preview";
export const INVITATION_PAYLOAD_SCHEMA_VERSION = 1;

export type InvitationStatus = Database["public"]["Tables"]["invitations"]["Row"]["status"];

const imageReferenceSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:"),
    "이미지 참조 형식이 올바르지 않습니다."
  )
  .catch("");

const legacyInvitationPayloadSchema = z
  .object({
    schemaVersion: z.coerce.number().int().optional(),
    templateId: z.string().trim().optional(),
    category: z.string().trim().optional(),
    title: z.string().trim().optional(),
    eventDateTime: z.string().trim().optional(),
    venueName: z.string().trim().optional(),
    venueAddress: z.string().trim().optional(),
    message: z.string().trim().optional(),
    videoUrl: z.string().trim().optional(),
    backgroundMusicUrl: z.string().trim().optional(),
    thankYouMessage: z.string().trim().optional(),
    groomName: z.string().trim().optional(),
    brideName: z.string().trim().optional(),
    groomPhone: z.string().trim().optional(),
    bridePhone: z.string().trim().optional(),
    groomFatherName: z.string().trim().optional(),
    groomMotherName: z.string().trim().optional(),
    brideFatherName: z.string().trim().optional(),
    brideMotherName: z.string().trim().optional(),
    groomFatherPhone: z.string().trim().optional(),
    groomMotherPhone: z.string().trim().optional(),
    brideFatherPhone: z.string().trim().optional(),
    brideMotherPhone: z.string().trim().optional(),
    groomBank: z.string().trim().optional(),
    groomBankHolder: z.string().trim().optional(),
    groomBankAccount: z.string().trim().optional(),
    brideBank: z.string().trim().optional(),
    brideBankHolder: z.string().trim().optional(),
    brideBankAccount: z.string().trim().optional(),
    kakaoPayLink: z.string().trim().optional(),
    shareUrl: z.string().trim().optional(),
    kakaoJsKey: z.string().trim().optional(),
    mapAddress: z.string().trim().optional(),
    naverMapLink: z.string().trim().optional(),
    transportNote: z.string().trim().optional(),
    mainImageUrl: imageReferenceSchema.optional(),
    mainImagePath: z.string().trim().optional(),
    backgroundImageUrl: imageReferenceSchema.optional(),
    backgroundImagePath: z.string().trim().optional(),
    galleryImages: z.array(imageReferenceSchema).optional(),
    galleryImagePaths: z.array(z.string().trim()).optional(),
    mainImageData: imageReferenceSchema.optional(),
    backgroundImageData: imageReferenceSchema.optional()
  })
  .passthrough();

export const invitationDraftPayloadSchema = legacyInvitationPayloadSchema.transform((raw) => ({
  schemaVersion: INVITATION_PAYLOAD_SCHEMA_VERSION,
  templateId: raw.templateId || "wedding-classic",
  category: raw.category || "wedding",
  title: raw.title || "결혼식 초대장",
  eventDateTime: raw.eventDateTime || "2026-04-12T14:00",
  venueName: raw.venueName || "서울 더파인 웨딩홀",
  venueAddress: raw.venueAddress || "서울 강남구 테헤란로 123",
  message: raw.message || "저희 두 사람이 하나가 되는 자리에 함께해 주세요.",
  videoUrl: raw.videoUrl || "",
  backgroundMusicUrl: raw.backgroundMusicUrl || "",
  thankYouMessage: raw.thankYouMessage || "",
  groomName: raw.groomName || "홍길동",
  brideName: raw.brideName || "김부인",
  groomPhone: raw.groomPhone || "",
  bridePhone: raw.bridePhone || "",
  groomFatherName: raw.groomFatherName || "홍아버지",
  groomMotherName: raw.groomMotherName || "이어머니",
  brideFatherName: raw.brideFatherName || "김아버지",
  brideMotherName: raw.brideMotherName || "박어머니",
  groomFatherPhone: raw.groomFatherPhone || "",
  groomMotherPhone: raw.groomMotherPhone || "",
  brideFatherPhone: raw.brideFatherPhone || "",
  brideMotherPhone: raw.brideMotherPhone || "",
  groomBank: raw.groomBank || "",
  groomBankHolder: raw.groomBankHolder || "",
  groomBankAccount: raw.groomBankAccount || "",
  brideBank: raw.brideBank || "",
  brideBankHolder: raw.brideBankHolder || "",
  brideBankAccount: raw.brideBankAccount || "",
  kakaoPayLink: raw.kakaoPayLink || "",
  shareUrl: raw.shareUrl || "",
  kakaoJsKey: raw.kakaoJsKey || "",
  mapAddress: raw.mapAddress || raw.venueAddress || "서울 강남구 테헤란로 123",
  naverMapLink: raw.naverMapLink || "",
  transportNote: raw.transportNote || "",
  mainImageUrl: raw.mainImageUrl || raw.mainImageData || "",
  mainImagePath: raw.mainImagePath || "",
  backgroundImageUrl: raw.backgroundImageUrl || raw.backgroundImageData || "",
  backgroundImagePath: raw.backgroundImagePath || "",
  galleryImages: Array.isArray(raw.galleryImages)
    ? raw.galleryImages.filter((item): item is string => typeof item === "string")
    : [],
  galleryImagePaths: Array.isArray(raw.galleryImagePaths)
    ? raw.galleryImagePaths.filter((item): item is string => typeof item === "string")
    : []
}));

export type InvitationDraftPayload = z.infer<typeof invitationDraftPayloadSchema>;

export type InvitationRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  templateId: string;
  status: InvitationStatus;
  payload: InvitationDraftPayload;
  createdAt: string;
  publishedAt: string | null;
};

export type RsvpEntry = {
  id: string;
  guestName: string;
  guestPhone: string;
  attending: boolean;
  guests: number;
  memo: string;
  createdAt: string;
};

export type GuestbookEntry = {
  id: string;
  nickname: string;
  message: string;
  approved?: boolean;
  createdAt: string;
};

export const defaultInvitationDraft: InvitationDraftPayload = invitationDraftPayloadSchema.parse({});

export function parseInvitationPayload(value: unknown) {
  return invitationDraftPayloadSchema.parse(value);
}

export function normalizeDraft(payload: Partial<InvitationDraftPayload> | unknown) {
  return parseInvitationPayload(payload);
}

export function createInvitationSlug(payload: Pick<InvitationDraftPayload, "title" | "groomName" | "brideName">) {
  const seed = `${payload.title}-${payload.groomName}-${payload.brideName}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${seed || "invitehub"}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toInvitationInsert(
  userId: string,
  slug: string,
  payload: InvitationDraftPayload,
  status: InvitationStatus
): Database["public"]["Tables"]["invitations"]["Insert"] {
  return {
    user_id: userId,
    slug,
    title: payload.title,
    category: payload.category,
    template_id: payload.templateId,
    status,
    payload,
    published_at: status === "published" ? new Date().toISOString() : null
  };
}

export function formatEventDateTime(value: string) {
  if (!value) {
    return "날짜와 시간을 입력해 주세요.";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 형식을 다시 확인해 주세요.";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(date);
}

export function formatTimestampLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(date);
}

export function formatVenue(payload: InvitationDraftPayload) {
  if (payload.venueName && payload.venueAddress) {
    return `${payload.venueName} · ${payload.venueAddress}`;
  }

  return payload.venueName || payload.venueAddress || "행사 장소를 입력해 주세요.";
}

export function formatParents(payload: InvitationDraftPayload) {
  const groomSide = [payload.groomFatherName, payload.groomMotherName].filter(Boolean).join(" / ");
  const brideSide = [payload.brideFatherName, payload.brideMotherName].filter(Boolean).join(" / ");

  const lines = [];

  if (groomSide) {
    lines.push(`신랑측 · ${groomSide}`);
  }

  if (brideSide) {
    lines.push(`신부측 · ${brideSide}`);
  }

  return lines.length ? lines.join("\n") : "양가 부모님 정보를 입력해 주세요.";
}

export function formatAccounts(payload: InvitationDraftPayload) {
  const lines = [];

  if (payload.groomBank || payload.groomBankHolder || payload.groomBankAccount) {
    lines.push(
      ["신랑측", payload.groomBank, payload.groomBankHolder, payload.groomBankAccount]
        .filter(Boolean)
        .join(" · ")
    );
  }

  if (payload.brideBank || payload.brideBankHolder || payload.brideBankAccount) {
    lines.push(
      ["신부측", payload.brideBank, payload.brideBankHolder, payload.brideBankAccount]
        .filter(Boolean)
        .join(" · ")
    );
  }

  return lines.length ? lines.join("\n") : "계좌 정보를 입력해 주세요.";
}
