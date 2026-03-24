import { z } from "zod";

export const storageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxUploadBytes = 10 * 1024 * 1024;

export const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

export const publicRsvpSchema = z.object({
  guestName: z.string().trim().min(1).max(100),
  guestPhone: z.string().trim().max(20).optional().default(""),
  attending: z.enum(["yes", "no"]).transform((value) => value === "yes"),
  guests: z.coerce.number().int().min(0).max(50),
  memo: z.string().trim().max(500).optional().default(""),
  website: z.string().trim().max(0).optional().default("")
});

export const publicGuestbookSchema = z.object({
  nickname: z.string().trim().min(1).max(50),
  message: z.string().trim().min(1).max(500),
  website: z.string().trim().max(0).optional().default("")
});

export function ensureJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}
