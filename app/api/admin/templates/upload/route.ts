import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  INVITATION_ASSET_BUCKET,
  INVITATION_ASSET_OWNER_TTL_SECONDS,
  isSafeSignedAssetUrl,
  withInvitationAssetTimeout
} from "@/lib/invitation-assets";
import {
  InvitationImageValidationError,
  UserStorageQuotaError,
  canonicalizeInvitationImage,
  enforceUserStorageQuota
} from "@/lib/invitation-upload-security";
import { consumeRateLimits, getClientIdentifier, getPrivacySafeIdentifier } from "@/lib/rate-limit";
import { isTemplateAdminEmail } from "@/lib/template-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { maxUploadBytes, storageMimeTypes } from "@/lib/supabase/public-write";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const MAX_REQUEST_BYTES = maxUploadBytes + 256 * 1024;
const TIMEOUT_MS = 1500;

function isDuplicate(error: unknown) {
  return Boolean(error && typeof error === "object" && (
    ("statusCode" in error && String(error.statusCode) === "409") ||
    ("message" in error && /already exists|duplicate/i.test(String(error.message)))
  ));
}

function unavailable() {
  return NextResponse.json({ success: false, message: "템플릿 자산 서비스를 사용할 수 없습니다." }, { status: 503 });
}

export async function POST(request: Request) {
  if (process.env.INVITATION_ASSET_ACCESS_ENABLED !== "true") return unavailable();
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return unavailable();

  let authResult;
  try {
    authResult = await withInvitationAssetTimeout(supabase.auth.getUser(), TIMEOUT_MS);
  } catch {
    return unavailable();
  }
  const user = authResult.data.user;
  if (authResult.error || !user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isTemplateAdminEmail(user.email)) {
    return NextResponse.json({ success: false, message: "템플릿 관리자 권한이 필요합니다." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (!Number.isSafeInteger(contentLength) || contentLength < 1) {
    return NextResponse.json({ success: false, message: "업로드 크기를 확인할 수 없습니다." }, { status: 411 });
  }
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ success: false, message: "업로드 요청이 너무 큽니다." }, { status: 413 });
  }

  const clientIdentifier = getClientIdentifier(request);
  const userIdentifier = getPrivacySafeIdentifier("template_asset_admin", user.id);
  if (!clientIdentifier || !userIdentifier) return unavailable();
  const quota = await consumeRateLimits({
    admin,
    timeoutMs: TIMEOUT_MS,
    policies: [
      { key: `template_asset:user:${userIdentifier}:burst`, limit: 5, windowMs: MINUTE_MS },
      { key: `template_asset:user:${userIdentifier}:daily`, limit: 100, windowMs: DAY_MS },
      { key: `template_asset:client:${clientIdentifier}:daily`, limit: 100, windowMs: DAY_MS },
      { key: "template_asset:global:daily", limit: 1_000, windowMs: DAY_MS }
    ]
  });
  if (!quota.ok) return unavailable();
  if (!quota.allowed) return NextResponse.json({ success: false, message: "업로드 요청이 너무 많습니다." }, { status: 429 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "업로드할 이미지가 없습니다." }, { status: 400 });
  }
  if (!storageMimeTypes.includes(file.type as (typeof storageMimeTypes)[number]) || file.size > maxUploadBytes) {
    return NextResponse.json({ success: false, message: "5MB 이하 JPEG, PNG, WebP 이미지만 허용됩니다." }, { status: 400 });
  }

  let canonical;
  try {
    canonical = await canonicalizeInvitationImage(Buffer.from(await file.arrayBuffer()), file.type);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof InvitationImageValidationError ? error.message : "이미지를 확인하지 못했습니다."
    }, { status: 400 });
  }
  const digest = createHash("sha256").update(canonical.buffer).digest("hex");
  const path = `${user.id}/templates/${digest}.${canonical.extension}`;
  const bucket = admin.storage.from(INVITATION_ASSET_BUCKET);
  let alreadyExists = false;
  try {
    alreadyExists = (await enforceUserStorageQuota(bucket, user.id, canonical.buffer.length, path)).alreadyExists;
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof UserStorageQuotaError ? error.message : "저장소 사용량을 확인하지 못했습니다."
    }, { status: 503 });
  }

  const uploadResult = alreadyExists
    ? { data: null, error: null }
    : await withInvitationAssetTimeout(bucket.upload(path, canonical.buffer, {
        cacheControl: "31536000",
        contentType: canonical.contentType,
        upsert: false
      }), TIMEOUT_MS).catch(() => ({ data: null, error: new Error("timeout") }));
  const created = !alreadyExists && Boolean(uploadResult.data);
  if (!alreadyExists && (uploadResult.error && !isDuplicate(uploadResult.error) || !uploadResult.data && !isDuplicate(uploadResult.error))) {
    return NextResponse.json({ success: false, message: "이미지를 저장하지 못했습니다." }, { status: 503 });
  }
  if (uploadResult.data?.path && uploadResult.data.path !== path) {
    if (created) await withInvitationAssetTimeout(bucket.remove([path]), TIMEOUT_MS).catch(() => undefined);
    return unavailable();
  }

  const signedResult = await withInvitationAssetTimeout(
    bucket.createSignedUrl(path, INVITATION_ASSET_OWNER_TTL_SECONDS),
    TIMEOUT_MS
  ).catch(() => ({ data: null, error: new Error("timeout") }));
  const signedUrl = signedResult.data?.signedUrl ?? "";
  if (signedResult.error || !isSafeSignedAssetUrl(signedUrl)) {
    if (created) await withInvitationAssetTimeout(bucket.remove([path]), TIMEOUT_MS).catch(() => undefined);
    return unavailable();
  }

  return NextResponse.json({
    success: true,
    created,
    publicUrl: signedUrl,
    path,
    expiresIn: INVITATION_ASSET_OWNER_TTL_SECONDS
  }, { headers: { "Cache-Control": "private, no-store" } });
}
