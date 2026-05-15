import { z } from "zod";

export const storageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxUploadBytes = 5 * 1024 * 1024;
export const maxJsonBodyBytes = 64 * 1024;
export const maxMultipartEnvelopeBytes = 64 * 1024;

type StorageMimeType = (typeof storageMimeTypes)[number];

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

export function ensureSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function getRequestContentLength(request: Request) {
  const value = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function exceedsMultipartUploadLimit(request: Request, maxBytes = maxUploadBytes) {
  const contentLength = getRequestContentLength(request);
  return contentLength > maxBytes + maxMultipartEnvelopeBytes;
}

export function isStorageMimeType(mimeType: string): mimeType is StorageMimeType {
  return storageMimeTypes.includes(mimeType as StorageMimeType);
}

export function hasAllowedImageMagic(bytes: Uint8Array, mimeType: string) {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (mimeType === "image/jpeg") {
    return isJpeg;
  }

  if (mimeType === "image/png") {
    return isPng;
  }

  if (mimeType === "image/webp") {
    return isWebp;
  }

  return false;
}

async function readBlobBytes(blob: Blob) {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }

  if (typeof FileReader !== "undefined") {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."));
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(blob);
    });
  }

  return new Response(blob).arrayBuffer();
}

export async function isValidImageFile(file: File) {
  if (!isStorageMimeType(file.type)) {
    return false;
  }

  const bytes = new Uint8Array(await readBlobBytes(file.slice(0, 12)));
  return hasAllowedImageMagic(bytes, file.type);
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
    const rawBody = await request.text();
    const actualBytes = new TextEncoder().encode(rawBody).byteLength;

    if (actualBytes > maxBytes) {
      return {
        ok: false as const,
        message: "요청 본문이 너무 큽니다."
      };
    }

    return {
      ok: true as const,
      body: rawBody ? JSON.parse(rawBody) : null
    };
  } catch {
    return {
      ok: false as const,
      message: "요청 본문을 읽지 못했습니다. 다시 시도해 주세요."
    };
  }
}
