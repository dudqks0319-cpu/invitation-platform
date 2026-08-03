import { z } from "zod";
import { createHash } from "node:crypto";

export const storageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxUploadBytes = 5 * 1024 * 1024;
export const maxJsonBodyBytes = 64 * 1024;
export const publicSlugSchema = z.string().regex(/^[a-z0-9](?:[a-z0-9_-]{0,126}[a-z0-9])?$/i);
const idempotencyKeySchema = z
  .string()
  .trim()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

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
  const mediaType = (request.headers.get("content-type") ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  return mediaType === "application/json";
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] ?? "";
}

export function getIdempotencyKey(request: Request) {
  const result = idempotencyKeySchema.safeParse(
    request.headers.get("idempotency-key") ?? ""
  );
  return result.success ? result.data : null;
}

export function hashPublicWrite(...parts: string[]) {
  return createHash("sha256").update(parts.join("\u0000")).digest("hex");
}

export async function readJsonBody(request: Request, maxBytes = maxJsonBodyBytes) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      ok: false as const,
      message: "요청 본문이 너무 큽니다."
    };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return {
      ok: false as const,
      message: "요청 본문을 읽지 못했습니다. 다시 시도해 주세요."
    };
  }

  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytesRead = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        await reader.cancel();
        return {
          ok: false as const,
          message: "요청 본문이 너무 큽니다."
        };
      }

      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();

    return {
      ok: true as const,
      body: JSON.parse(text) as unknown
    };
  } catch {
    return {
      ok: false as const,
      message: "요청 본문을 읽지 못했습니다. 다시 시도해 주세요."
    };
  }
}
