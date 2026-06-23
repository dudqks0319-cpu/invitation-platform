import { z } from "zod";

export const storageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxUploadBytes = 5 * 1024 * 1024;
export const maxJsonBodyBytes = 64 * 1024;

export const publicRsvpSchema = z.object({
  guestName: z.string().trim().min(1).max(40),
  guestPhone: z.string().trim().max(30).optional().default(""),
  attending: z.enum(["yes", "no"]).transform((value) => value === "yes"),
  guests: z.coerce.number().int().min(0).max(20),
  memo: z.string().trim().max(300).optional().default(""),
  website: z.string().trim().max(0).optional().default("")
});

export const publicGuestbookSchema = z.object({
  nickname: z.string().trim().min(1).max(30),
  message: z.string().trim().min(1).max(300),
  website: z.string().trim().max(0).optional().default("")
});

export const publicContentReportSchema = z.object({
  targetType: z.enum(["invitation", "guestbook", "image"]).default("invitation"),
  targetId: z.string().trim().uuid().optional(),
  reason: z.enum(["inappropriate", "privacy", "spam", "copyright", "other"]),
  detail: z.string().trim().max(500).optional().default(""),
  reporterContact: z.string().trim().max(120).optional().default(""),
  website: z.string().trim().max(0).optional().default("")
}).superRefine((value, context) => {
  if (value.targetType !== "invitation" && !value.targetId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "신고 대상이 필요합니다.",
      path: ["targetId"]
    });
  }
});

export function ensureJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

export async function readJsonBody(request: Request, maxBytes = maxJsonBodyBytes) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      ok: false as const,
      message: "요청 본문이 너무 큽니다."
    };
  }

  try {
    return {
      ok: true as const,
      body: await request.json()
    };
  } catch {
    return {
      ok: false as const,
      message: "요청 본문을 읽지 못했습니다. 다시 시도해 주세요."
    };
  }
}
