import { z } from "zod";

export const storageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxUploadBytes = 5 * 1024 * 1024;

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

export function ensureJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

export async function readJsonBody(request: Request) {
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
