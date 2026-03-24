import { z } from "zod";

export const LOCAL_DRAFT_KEY = "invitehub:draft";
export const LOCAL_RSVP_KEY = "invitehub:rsvp";
export const LOCAL_GUESTBOOK_KEY = "invitehub:guestbook";
export const PAYLOAD_SCHEMA_VERSION = 2;
export const INVITATION_PAYLOAD_SCHEMA_VERSION = PAYLOAD_SCHEMA_VERSION;

export type InvitationStatus = "draft" | "published" | "archived";

export const invitationPayloadSchema = z.object({
  schemaVersion: z.number().default(PAYLOAD_SCHEMA_VERSION),
  templateId: z.string().default("wedding-classic"),
  category: z.string().default("wedding"),
  title: z.string().default(""),
  eventDateTime: z.string().default(""),
  venueName: z.string().default(""),
  venueAddress: z.string().default(""),
  message: z.string().default("소중한 분들을 초대합니다."),
  groomName: z.string().default(""),
  brideName: z.string().default(""),
  groomPhone: z.string().default(""),
  bridePhone: z.string().default(""),
  groomFatherName: z.string().default(""),
  groomMotherName: z.string().default(""),
  brideFatherName: z.string().default(""),
  brideMotherName: z.string().default(""),
  groomBank: z.string().default(""),
  groomBankHolder: z.string().default(""),
  groomBankAccount: z.string().default(""),
  brideBank: z.string().default(""),
  brideBankHolder: z.string().default(""),
  brideBankAccount: z.string().default(""),
  kakaoPayLink: z.string().default(""),
  mainImageUrl: z.string().default(""),
  mainImagePath: z.string().default(""),
  backgroundImageUrl: z.string().default(""),
  backgroundImagePath: z.string().default(""),
  naverMapLink: z.string().default(""),
  transportNote: z.string().default("")
});

export type InvitationDraftPayload = z.infer<typeof invitationPayloadSchema>;

export const defaultInvitationDraft: InvitationDraftPayload =
  invitationPayloadSchema.parse({});

export type InvitationRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  templateId: string;
  status: InvitationStatus;
  payload: InvitationDraftPayload;
  revision: number;
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
  approved: boolean;
  createdAt: string;
};

export function normalizeDraft(raw: unknown): InvitationDraftPayload {
  if (!raw || typeof raw !== "object") return defaultInvitationDraft;

  const record = { ...(raw as Record<string, unknown>) };

  if (record.mapAddress && !record.venueAddress) {
    record.venueAddress = record.mapAddress;
  }

  if (record.mainImageData && !record.mainImageUrl) {
    record.mainImageUrl = record.mainImageData;
  }
  if (record.backgroundImageData && !record.backgroundImageUrl) {
    record.backgroundImageUrl = record.backgroundImageData;
  }

  delete record.mapAddress;
  delete record.kakaoJsKey;

  return invitationPayloadSchema.parse(record);
}

export function parseInvitationPayload(raw: unknown): InvitationDraftPayload {
  return normalizeDraft(raw);
}

export function createInvitationSlug(
  payload: Pick<InvitationDraftPayload, "title" | "groomName" | "brideName">
): string {
  const parts = [
    payload.title || "invitehub",
    payload.groomName || "groom",
    payload.brideName || "bride"
  ];

  const base = parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/-+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export function formatEventDateTime(dateStr: string): string {
  if (!dateStr) return "날짜를 선택해 주세요.";

  try {
    return new Date(dateStr).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
}

export function formatVenue(payload: InvitationDraftPayload): string {
  return [payload.venueName, payload.venueAddress].filter(Boolean).join(" · ") ||
    "장소를 입력해 주세요.";
}

export function formatParents(payload: InvitationDraftPayload): string {
  const groom = [payload.groomFatherName, payload.groomMotherName]
    .filter(Boolean)
    .join(" · ");
  const bride = [payload.brideFatherName, payload.brideMotherName]
    .filter(Boolean)
    .join(" · ");
  const parts = [];
  if (groom) parts.push(`신랑측: ${groom}`);
  if (bride) parts.push(`신부측: ${bride}`);
  return parts.join(" | ") || "혼주 정보를 입력해 주세요.";
}

export function formatAccounts(payload: InvitationDraftPayload): string {
  const lines: string[] = [];
  if (payload.groomBank && payload.groomBankAccount) {
    lines.push(
      `신랑측: ${payload.groomBank} ${payload.groomBankAccount} (${payload.groomBankHolder || payload.groomName})`
    );
  }
  if (payload.brideBank && payload.brideBankAccount) {
    lines.push(
      `신부측: ${payload.brideBank} ${payload.brideBankAccount} (${payload.brideBankHolder || payload.brideName})`
    );
  }
  return lines.join("\n") || "계좌 정보를 입력해 주세요.";
}
