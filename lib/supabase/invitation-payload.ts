import { z } from "zod";

const payloadSchema = z.object({
  schemaVersion: z.coerce.number().int().default(2),
  templateId: z.string().default("wedding-classic"),
  category: z.string().default("wedding"),
  title: z.string().default("결혼식 초대장"),
  eventDateTime: z.string().default(""),
  venueName: z.string().default(""),
  venueAddress: z.string().default(""),
  message: z.string().default(""),
  videoUrl: z.string().default(""),
  backgroundMusicUrl: z.string().default(""),
  thankYouMessage: z.string().default(""),
  groomName: z.string().default(""),
  brideName: z.string().default(""),
  groomPhone: z.string().default(""),
  bridePhone: z.string().default(""),
  groomFatherName: z.string().default(""),
  groomMotherName: z.string().default(""),
  brideFatherName: z.string().default(""),
  brideMotherName: z.string().default(""),
  groomFatherPhone: z.string().default(""),
  groomMotherPhone: z.string().default(""),
  brideFatherPhone: z.string().default(""),
  brideMotherPhone: z.string().default(""),
  groomBank: z.string().default(""),
  groomBankHolder: z.string().default(""),
  groomBankAccount: z.string().default(""),
  brideBank: z.string().default(""),
  brideBankHolder: z.string().default(""),
  brideBankAccount: z.string().default(""),
  kakaoPayLink: z.string().default(""),
  shareUrl: z.string().default(""),
  kakaoJsKey: z.string().default(""),
  mapAddress: z.string().default(""),
  naverMapLink: z.string().default(""),
  transportNote: z.string().default(""),
  mainImageUrl: z.string().default(""),
  mainImagePath: z.string().default(""),
  backgroundImageUrl: z.string().default("")
  ,
  backgroundImagePath: z.string().default(""),
  galleryImages: z.array(z.string()).default([])
});

export type SafeInvitationPayload = z.infer<typeof payloadSchema>;

export function normalizeInvitationPayload(input: unknown) {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  return payloadSchema.parse({
    ...raw,
    mainImageUrl: typeof raw.mainImageUrl === "string" && raw.mainImageUrl
      ? raw.mainImageUrl
      : typeof raw.mainImageData === "string"
        ? raw.mainImageData
        : "",
    mainImagePath: typeof raw.mainImagePath === "string" ? raw.mainImagePath : "",
    backgroundImageUrl: typeof raw.backgroundImageUrl === "string" && raw.backgroundImageUrl
      ? raw.backgroundImageUrl
      : typeof raw.backgroundImageData === "string"
        ? raw.backgroundImageData
        : "",
    backgroundImagePath: typeof raw.backgroundImagePath === "string" ? raw.backgroundImagePath : "",
    galleryImages: Array.isArray(raw.galleryImages)
      ? raw.galleryImages.filter((item): item is string => typeof item === "string")
      : []
  });
}
