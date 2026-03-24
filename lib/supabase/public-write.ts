import { z } from "zod";

export const storageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export const maxUploadBytes = 10 * 1024 * 1024;

export const publicRsvpSchema = z.object({
  guestName: z.string().min(1, "이름을 입력해 주세요.").max(40),
  guestPhone: z.string().max(30).default(""),
  attending: z
    .enum(["yes", "no"])
    .transform((val) => val === "yes"),
  guests: z.coerce.number().int().min(0).max(20),
  memo: z.string().max(300).default(""),
  website: z.string().max(0, "잘못된 요청입니다.").default("")
});

export const publicGuestbookSchema = z.object({
  nickname: z.string().min(1, "이름을 입력해 주세요.").max(30),
  message: z.string().min(1, "메시지를 입력해 주세요.").max(300),
  website: z.string().max(0, "잘못된 요청입니다.").default("")
});

export function ensureJsonRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}
