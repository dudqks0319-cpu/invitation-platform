import { z } from "zod";
import type { Database } from "@/lib/supabase/types";

export const LOCAL_DRAFT_KEY = "invitehub_builder_draft_v3";
export const LOCAL_GUESTBOOK_KEY = "invitehub_local_guestbook_preview";
export const LOCAL_RSVP_KEY = "invitehub_local_rsvp_preview";
export const INVITATION_PAYLOAD_SCHEMA_VERSION = 3;

export type InvitationStatus = Database["public"]["Tables"]["invitations"]["Row"]["status"];

export const invitationSectionKeys = [
  "intro",
  "people",
  "date",
  "venue",
  "gallery",
  "rsvp",
  "guestbook",
  "accounts",
  "contact",
  "calendar",
  "video",
  "music",
  "transport",
  "schedule",
  "gift"
] as const;

export type InvitationSectionKey = (typeof invitationSectionKeys)[number];

export type SectionPolicy = {
  enabled: boolean;
  publicVisible: boolean;
  publicSubmitAllowed: boolean;
  ownerOnly: boolean;
};

export type InvitationSectionPolicies = Record<InvitationSectionKey, SectionPolicy>;

type SectionAction = "view" | "submit";

export type TemplateSafeArea = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TemplatePhotoSlot = {
  key: string;
  shape: "rect" | "roundedRect" | "circle" | "polaroid";
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  rotation?: number;
  zIndex: number;
  required: boolean;
};

export type PhotoPlacement = {
  slotKey: string;
  assetPath: string;
  originalAssetPath?: string;
  crop: {
    x: number;
    y: number;
    scale: number;
    rotate?: number;
  };
  fit: "cover" | "contain";
  focalPoint?: {
    x: number;
    y: number;
  };
};

type TemplateMetadataValue =
  | string
  | number
  | boolean
  | null
  | TemplateMetadataValue[]
  | { [key: string]: TemplateMetadataValue | undefined };

export type PublishedTemplateSnapshot = {
  templateAssetId: string;
  templateAssetVersion: number;
  backgroundImageUrl: string;
  canvas: {
    width: number;
    height: number;
  };
  safeAreas: Record<string, TemplateSafeArea>;
  photoSlots: TemplatePhotoSlot[];
  palette: Record<string, string>;
  typography: Record<string, TemplateMetadataValue>;
};

const submitSections = new Set<InvitationSectionKey>(["rsvp", "guestbook"]);

export const defaultSectionPolicies: InvitationSectionPolicies = invitationSectionKeys.reduce(
  (policies, section) => {
    policies[section] = {
      enabled: true,
      publicVisible: true,
      publicSubmitAllowed: submitSections.has(section),
      ownerOnly: false
    };
    return policies;
  },
  {} as InvitationSectionPolicies
);

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readSectionPolicy(value: unknown, section: InvitationSectionKey): SectionPolicy {
  const defaults = defaultSectionPolicies[section];

  if (typeof value === "boolean") {
    return {
      ...defaults,
      enabled: value,
      publicVisible: value ? defaults.publicVisible : false,
      publicSubmitAllowed: value ? defaults.publicSubmitAllowed : false
    };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...defaults };
  }

  const raw = value as Partial<Record<keyof SectionPolicy, unknown>>;
  const enabled = readBoolean(raw.enabled, defaults.enabled);
  const ownerOnly = readBoolean(raw.ownerOnly, defaults.ownerOnly);
  const publicVisible = enabled && !ownerOnly && readBoolean(raw.publicVisible, defaults.publicVisible);
  const publicSubmitAllowed =
    enabled &&
    !ownerOnly &&
    defaults.publicSubmitAllowed &&
    readBoolean(raw.publicSubmitAllowed, defaults.publicSubmitAllowed);

  return {
    enabled,
    publicVisible,
    publicSubmitAllowed,
    ownerOnly
  };
}

export function normalizeSectionPolicies(value: unknown): InvitationSectionPolicies {
  const raw = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return invitationSectionKeys.reduce((policies, section) => {
    policies[section] = readSectionPolicy(raw[section], section);
    return policies;
  }, {} as InvitationSectionPolicies);
}

export function isInvitationSectionAllowed(
  payload: Pick<InvitationDraftPayload, "sections"> | { sections?: unknown },
  section: InvitationSectionKey,
  action: SectionAction
) {
  const sections = normalizeSectionPolicies(payload.sections);
  const policy = sections[section];

  if (!policy.enabled) {
    return false;
  }

  if (action === "view") {
    return policy.publicVisible;
  }

  return policy.publicSubmitAllowed;
}

export function buildPublicInvitationPayload(payload: InvitationDraftPayload): InvitationDraftPayload {
  const nextPayload: InvitationDraftPayload = {
    ...payload,
    sections: normalizeSectionPolicies(payload.sections)
  };

  if (!isInvitationSectionAllowed(nextPayload, "accounts", "view")) {
    nextPayload.groomBank = "";
    nextPayload.groomBankHolder = "";
    nextPayload.groomBankAccount = "";
    nextPayload.brideBank = "";
    nextPayload.brideBankHolder = "";
    nextPayload.brideBankAccount = "";
    nextPayload.kakaoPayLink = "";
  }

  if (!isInvitationSectionAllowed(nextPayload, "contact", "view")) {
    nextPayload.groomPhone = "";
    nextPayload.bridePhone = "";
    nextPayload.groomFatherPhone = "";
    nextPayload.groomMotherPhone = "";
    nextPayload.brideFatherPhone = "";
    nextPayload.brideMotherPhone = "";
  }

  if (!isInvitationSectionAllowed(nextPayload, "gallery", "view")) {
    nextPayload.galleryImages = [];
    nextPayload.galleryImagePaths = [];
  }

  if (!isInvitationSectionAllowed(nextPayload, "video", "view")) {
    nextPayload.videoUrl = "";
  }

  if (!isInvitationSectionAllowed(nextPayload, "music", "view")) {
    nextPayload.backgroundMusicUrl = "";
  }

  return nextPayload;
}

const imageReferenceSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:"),
    "이미지 참조 형식이 올바르지 않습니다."
  )
  .catch("");

const ratioSchema = z.coerce.number().min(0).max(1);

const templateSafeAreaSchema = z.object({
  x: ratioSchema,
  y: ratioSchema,
  w: ratioSchema,
  h: ratioSchema
});

const templatePhotoSlotSchema = z.object({
  key: z.string().trim().min(1).max(60),
  shape: z.enum(["rect", "roundedRect", "circle", "polaroid"]).default("roundedRect"),
  x: ratioSchema,
  y: ratioSchema,
  w: ratioSchema,
  h: ratioSchema,
  radius: ratioSchema.optional(),
  rotation: z.coerce.number().min(-180).max(180).optional(),
  zIndex: z.coerce.number().int().min(0).max(100).default(0),
  required: z.boolean().default(false)
});

export const photoPlacementSchema = z.object({
  slotKey: z.string().trim().min(1).max(60),
  assetPath: z.string().trim().min(1).max(500),
  originalAssetPath: z.string().trim().max(500).optional(),
  crop: z.object({
    x: ratioSchema.default(0.5),
    y: ratioSchema.default(0.5),
    scale: z.coerce.number().min(0.1).max(8).default(1),
    rotate: z.coerce.number().min(-180).max(180).optional()
  }),
  fit: z.enum(["cover", "contain"]).default("cover"),
  focalPoint: z.object({
    x: ratioSchema,
    y: ratioSchema
  }).optional()
});

const templateMetadataValueSchema: z.ZodType<TemplateMetadataValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(templateMetadataValueSchema),
    z.record(z.string(), templateMetadataValueSchema)
  ])
);

const publishedTemplateSnapshotObjectSchema = z
  .object({
    templateAssetId: z.string().trim().min(1).max(120),
    templateAssetVersion: z.coerce.number().int().positive().default(1),
    backgroundImageUrl: imageReferenceSchema,
    canvas: z.object({
      width: z.coerce.number().int().min(1).max(10000).default(1080),
      height: z.coerce.number().int().min(1).max(10000).default(1920)
    }).default({ width: 1080, height: 1920 }),
    safeAreas: z.record(z.string(), templateSafeAreaSchema).default({}),
    photoSlots: z.array(templatePhotoSlotSchema).default([]),
    palette: z.record(z.string(), z.string()).default({}),
    typography: z.record(z.string(), templateMetadataValueSchema).default({})
  });

export const publishedTemplateSnapshotSchema = publishedTemplateSnapshotObjectSchema.nullable().catch(null);

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
    kakaoMapLink: z.string().trim().optional(),
    transportNote: z.string().trim().optional(),
    mainImageUrl: imageReferenceSchema.optional(),
    mainImagePath: z.string().trim().optional(),
    backgroundImageUrl: imageReferenceSchema.optional(),
    backgroundImagePath: z.string().trim().optional(),
    galleryImages: z.array(imageReferenceSchema).optional(),
    galleryImagePaths: z.array(z.string().trim()).optional(),
    mainImageData: imageReferenceSchema.optional(),
    backgroundImageData: imageReferenceSchema.optional(),
    templateAssetId: z.string().trim().optional(),
    templateAssetVersion: z.coerce.number().int().positive().optional(),
    templateSnapshot: publishedTemplateSnapshotSchema.optional(),
    photoPlacements: z.array(photoPlacementSchema).catch([]).optional(),
    sectionOrder: z.array(z.enum(invitationSectionKeys)).catch([]).optional(),
    sections: z.unknown().optional()
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
  kakaoMapLink: raw.kakaoMapLink || "",
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
    : [],
  templateAssetId: raw.templateAssetId || raw.templateId || "wedding-classic",
  templateAssetVersion: raw.templateAssetVersion || raw.templateSnapshot?.templateAssetVersion || 1,
  templateSnapshot: raw.templateSnapshot ?? null,
  photoPlacements: raw.photoPlacements ?? [],
  sectionOrder: raw.sectionOrder?.length ? raw.sectionOrder : [...invitationSectionKeys],
  sections: normalizeSectionPolicies(raw.sections)
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
