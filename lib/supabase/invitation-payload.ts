import { z } from "zod";

const payloadSchema = z.object({
  schemaVersion: z.number().default(2),
  templateId: z.string().default("wedding-classic"),
  category: z.string().default("wedding"),
  title: z.string().default("결혼식 초대장"),
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

export type SafeInvitationPayload = z.infer<typeof payloadSchema>;

export function normalizeInvitationPayload(raw: unknown): SafeInvitationPayload {
  if (!raw || typeof raw !== "object") return payloadSchema.parse({});

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

  return payloadSchema.parse(record);
}
