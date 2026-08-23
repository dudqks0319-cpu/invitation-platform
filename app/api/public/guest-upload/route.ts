import { NextResponse } from "next/server";
import { INVITATION_ASSET_BUCKET } from "@/lib/invitation-assets";
import { MAX_GUEST_PHOTO_BYTES, validateGuestJpeg } from "@/lib/guest-image-validation";
import {
  consumeRateLimitPolicies,
  getClientFingerprint,
  hashRateLimitIdempotencyKey
} from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_MULTIPART_BODY_BYTES = MAX_GUEST_PHOTO_BYTES + 512 * 1024;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

function json(body: Record<string, unknown>, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Authorization");
  return response;
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return json({ success: false, message: "사진 업로드를 위한 게스트 세션이 필요합니다." }, { status: 401 });
  }

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.startsWith("multipart/form-data;") || !contentType.includes("boundary=")) {
    return json({ success: false, message: "multipart 사진 요청만 처리할 수 있습니다." }, { status: 415 });
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (!contentLengthHeader) {
    return json({ success: false, message: "사진 요청 크기를 확인할 수 없습니다." }, { status: 411 });
  }
  const contentLength = Number(contentLengthHeader);
  if (!Number.isInteger(contentLength) || contentLength < 1) {
    return json({ success: false, message: "사진 요청 크기가 올바르지 않습니다." }, { status: 400 });
  }
  if (contentLength > MAX_MULTIPART_BODY_BYTES) {
    return json({ success: false, message: "사진 크기는 2MB 이하여야 합니다." }, { status: 413 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return json({ success: false, message: "사진 업로드 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const {
    data: { user },
    error: userError
  } = await admin.auth.getUser(token);
  if (userError || !user?.id) {
    return json({ success: false, message: "게스트 세션을 확인할 수 없습니다." }, { status: 401 });
  }

  const idempotency = hashRateLimitIdempotencyKey(request.headers.get("idempotency-key"));
  const userSubject = hashRateLimitIdempotencyKey(`guest-upload-user:${user.id}`);
  if (!idempotency.ok || !userSubject.ok) {
    const invalidKey = !idempotency.ok && idempotency.message === "rate_limit_idempotency_invalid";
    return json(
      {
        success: false,
        message: invalidKey
          ? "사진 업로드 요청 식별자가 올바르지 않습니다."
          : "요청 보호 서비스 설정을 확인할 수 없습니다."
      },
      { status: invalidKey ? 400 : 503 }
    );
  }

  const client = getClientFingerprint(request);
  if (!client.ok) {
    return json({ success: false, message: "요청 보호 서비스 설정을 확인할 수 없습니다." }, { status: 503 });
  }

  const quota = await consumeRateLimitPolicies({
    admin,
    policies: [
      { name: "user_burst", key: `guest_upload:user:burst:${userSubject.digest}`, limit: 3, windowMs: MINUTE_MS },
      { name: "user_hour", key: `guest_upload:user:hour:${userSubject.digest}`, limit: 20, windowMs: HOUR_MS },
      { name: "user_daily", key: `guest_upload:user:daily:${userSubject.digest}`, limit: 30, windowMs: DAY_MS },
      {
        name: "fingerprint_daily",
        key: `guest_upload:fingerprint:daily:${client.fingerprint}`,
        limit: 50,
        windowMs: DAY_MS
      },
      { name: "global_burst", key: "guest_upload:global:burst", limit: 200, windowMs: MINUTE_MS },
      { name: "global_daily", key: "guest_upload:global:daily", limit: 2000, windowMs: DAY_MS },
      {
        name: "idempotency",
        key: `guest_upload:idempotency:${idempotency.digest}`,
        limit: 1,
        windowMs: DAY_MS
      }
    ]
  });

  if (!quota.ok) {
    return json({ success: false, message: "사진 업로드 보호 서비스를 사용할 수 없습니다." }, { status: 503 });
  }
  if (!quota.allowed) {
    return json(
      {
        success: false,
        message: quota.policy === "idempotency"
          ? "이미 처리된 사진 업로드 요청입니다."
          : "사진 업로드 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
      },
      { status: quota.policy === "idempotency" ? 409 : 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ success: false, message: "사진 업로드 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const file = formData.get("file");
  if (
    !file ||
    typeof file !== "object" ||
    !("arrayBuffer" in file) ||
    typeof file.arrayBuffer !== "function" ||
    !("size" in file) ||
    typeof file.size !== "number" ||
    !("type" in file) ||
    typeof file.type !== "string"
  ) {
    return json({ success: false, message: "업로드할 사진이 없습니다." }, { status: 400 });
  }
  if (file.size > MAX_GUEST_PHOTO_BYTES) {
    return json({ success: false, message: "사진 크기는 2MB 이하여야 합니다." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateGuestJpeg(bytes, file.type);
  if (!validation.ok) {
    return json({ success: false, message: validation.message }, { status: 400 });
  }

  const path = `${user.id}/guest/${idempotency.digest}.jpg`;
  const { data, error } = await admin.storage.from(INVITATION_ASSET_BUCKET).upload(path, bytes, {
    cacheControl: "3600",
    contentType: "image/jpeg",
    upsert: false
  });

  if (error || !data?.path) {
    return json({ success: false, message: "사진을 업로드하지 못했습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  return json({
    success: true,
    path: data.path,
    width: validation.width,
    height: validation.height
  });
}
