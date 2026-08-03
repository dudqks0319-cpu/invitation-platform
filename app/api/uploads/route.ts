import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { isAccountDeletionPending } from "@/lib/account-deletion";
import {
  INVITATION_ASSET_BUCKET,
  INVITATION_ASSET_OWNER_TTL_SECONDS,
  INVITATION_ASSET_TTL_SECONDS,
  isOwnedInvitationAssetPath,
  isSafeSignedAssetUrl,
  withInvitationAssetTimeout
} from "@/lib/invitation-assets";
import {
  InvitationImageValidationError,
  UserStorageQuotaError,
  canonicalizeInvitationImage,
  enforceUserStorageQuota
} from "@/lib/invitation-upload-security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { consumeRateLimits, getClientIdentifier, getPrivacySafeIdentifier } from "@/lib/rate-limit";
import {
  ensureJsonRequest,
  getBearerToken,
  getIdempotencyKey,
  maxUploadBytes,
  readJsonBody,
  storageMimeTypes
} from "@/lib/supabase/public-write";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_MULTIPART_OVERHEAD_BYTES = 256 * 1024;
const MAX_MULTIPART_REQUEST_BYTES = maxUploadBytes + MAX_MULTIPART_OVERHEAD_BYTES;

function isDuplicateObjectError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      (
        ("statusCode" in error && String(error.statusCode) === "409") ||
        ("message" in error && /already exists|duplicate/i.test(String(error.message)))
      )
  );
}

async function getAuthenticatedClients(request: Request) {
  const admin = createSupabaseAdminClient();
  const bearerToken = getBearerToken(request);

  if (!admin) {
    return {
      supabase: null,
      admin: null,
      user: null
    };
  }

  if (bearerToken) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return { supabase: null, admin: null, user: null };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(bearerToken);
    return { supabase, admin, user: error ? null : user };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { supabase: null, admin: null, user: null };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  return {
    supabase,
    admin,
    user: error ? null : user
  };
}

async function consumeUploadQuota({
  admin,
  clientIdentifier,
  operation,
  userIdentifier
}: {
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>;
  clientIdentifier: string;
  operation: "upload" | "upload_delete";
  userIdentifier: string;
}) {
  return consumeRateLimits({
    admin,
    policies: [
      { key: `${operation}:user:${userIdentifier}:burst`, limit: operation === "upload" ? 5 : 10, windowMs: MINUTE_MS },
      { key: `${operation}:user:${userIdentifier}:rolling`, limit: operation === "upload" ? 30 : 60, windowMs: HOUR_MS },
      { key: `${operation}:user:${userIdentifier}:daily`, limit: operation === "upload" ? 100 : 200, windowMs: DAY_MS },
      { key: `${operation}:client:${clientIdentifier}:daily`, limit: operation === "upload" ? 100 : 200, windowMs: DAY_MS },
      { key: `${operation}:global:daily`, limit: operation === "upload" ? 10_000 : 20_000, windowMs: DAY_MS }
    ]
  });
}

function quotaResponse(result: Awaited<ReturnType<typeof consumeUploadQuota>>) {
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  if (!result.allowed) {
    return NextResponse.json(
      { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)))
        }
      }
    );
  }
  return null;
}

async function accountDeletionResponse(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string
) {
  const pending = await isAccountDeletionPending(admin, userId);
  if (pending === false) return null;
  return NextResponse.json(
    {
      success: false,
      message: pending
        ? "계정 삭제가 진행 중이어서 저장소 작업을 시작할 수 없습니다."
        : "계정 상태를 확인할 수 없어 저장소 작업을 시작하지 않았습니다."
    },
    { status: pending ? 423 : 503 }
  );
}

export async function POST(request: Request) {
  if (process.env.INVITATION_ASSET_ACCESS_ENABLED !== "true") {
    return NextResponse.json(
      { success: false, message: "자산 접근 서비스가 비활성화되어 있습니다." },
      { status: 503 }
    );
  }
  const { supabase, admin, user } = await getAuthenticatedClients(request);

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "현재 업로드 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  const deletionResponse = await accountDeletionResponse(admin, user.id);
  if (deletionResponse) return deletionResponse;

  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (!Number.isSafeInteger(contentLength) || contentLength < 1) {
    return NextResponse.json(
      { success: false, message: "업로드 요청 크기를 확인할 수 없습니다." },
      { status: 411 }
    );
  }
  if (contentLength > MAX_MULTIPART_REQUEST_BYTES) {
    return NextResponse.json(
      { success: false, message: "업로드 요청이 너무 큽니다." },
      { status: 413 }
    );
  }

  const clientIdentifier = getClientIdentifier(request);
  const userIdentifier = getPrivacySafeIdentifier("upload_user", user.id);
  if (!clientIdentifier || !userIdentifier) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  const uploadQuota = quotaResponse(await consumeUploadQuota({
    admin,
    clientIdentifier,
    operation: "upload",
    userIdentifier
  }));
  if (uploadQuota) {
    return uploadQuota;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { success: false, message: "업로드 요청을 읽지 못했습니다." },
      { status: 400 }
    );
  }
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "업로드할 파일이 없습니다." },
      { status: 400 }
    );
  }

  if (!storageMimeTypes.includes(file.type as (typeof storageMimeTypes)[number])) {
    return NextResponse.json(
      { success: false, message: "JPEG, PNG, WebP 이미지만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json(
      { success: false, message: "이미지 크기는 5MB 이하여야 합니다." },
      { status: 400 }
    );
  }

  let canonicalImage;
  try {
    canonicalImage = await canonicalizeInvitationImage(
      Buffer.from(await file.arrayBuffer()),
      file.type
    );
  } catch (error) {
    const message =
      error instanceof InvitationImageValidationError
        ? error.message
        : "이미지를 확인하지 못했습니다.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  const digest = createHash("sha256").update(canonicalImage.buffer).digest("hex");
  const path = `${user.id}/${digest}.${canonicalImage.extension}`;
  const bucket = admin.storage.from(INVITATION_ASSET_BUCKET);
  let alreadyExists = false;
  try {
    const quota = await enforceUserStorageQuota(
      bucket,
      user.id,
      canonicalImage.buffer.length,
      path
    );
    alreadyExists = quota.alreadyExists;
  } catch (error) {
    const message =
      error instanceof UserStorageQuotaError
        ? error.message
        : "저장소 사용량을 확인하지 못했습니다.";
    return NextResponse.json({ success: false, message }, { status: 503 });
  }

  const { data, error } = alreadyExists
    ? { data: null, error: null }
    : await bucket.upload(path, canonicalImage.buffer, {
        cacheControl: "3600",
        contentType: canonicalImage.contentType,
        upsert: false
      });

  const created = !alreadyExists && Boolean(data);
  if (
    !alreadyExists &&
    ((error && !isDuplicateObjectError(error)) || (!data && !isDuplicateObjectError(error)))
  ) {
    return NextResponse.json(
      { success: false, message: "이미지를 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  if (data?.path && data.path !== path) {
    if (created) await withInvitationAssetTimeout(bucket.remove([path]), 1500).catch(() => undefined);
    return NextResponse.json(
      { success: false, message: "저장된 자산 경로를 확인하지 못했습니다." },
      { status: 503 }
    );
  }
  const storedPath = path;
  const signedResult = await withInvitationAssetTimeout(
    bucket.createSignedUrl(storedPath, INVITATION_ASSET_TTL_SECONDS),
    1500
  ).catch(() => ({ data: null, error: new Error("asset_sign_timeout") }));
  const signedUrl = signedResult.data?.signedUrl ?? "";
  if (signedResult.error || !isSafeSignedAssetUrl(signedUrl)) {
    if (created) {
      await withInvitationAssetTimeout(bucket.remove([storedPath]), 1500).catch(() => undefined);
    }
    return NextResponse.json(
      { success: false, message: "이미지 미리보기 URL을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    created,
    publicUrl: signedUrl,
    path: storedPath
  });
}

export async function DELETE(request: Request) {
  const { supabase, admin, user } = await getAuthenticatedClients(request);

  if (!supabase || !admin) {
    return NextResponse.json(
      { success: false, message: "현재 업로드 서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  const deletionResponse = await accountDeletionResponse(admin, user.id);
  if (deletionResponse) return deletionResponse;

  if (!ensureJsonRequest(request)) {
    return NextResponse.json(
      { success: false, message: "JSON 요청만 허용됩니다." },
      { status: 415 }
    );
  }
  const body = await readJsonBody(request, 4 * 1024);
  const path = body.ok && body.body && typeof body.body === "object" && "path" in body.body
    ? (body.body as { path?: unknown }).path
    : "";

  if (typeof path !== "string" || !path) {
    return NextResponse.json(
      { success: false, message: "삭제할 파일 경로가 없습니다." },
      { status: 400 }
    );
  }

  if (!isOwnedInvitationAssetPath(path, user.id)) {
    return NextResponse.json(
      { success: false, message: "본인 소유 파일만 삭제할 수 있습니다." },
      { status: 403 }
    );
  }

  if (getIdempotencyKey(request) !== `upload-delete:${path.split("/")[1]}`) {
    return NextResponse.json(
      { success: false, message: "요청 식별자가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const clientIdentifier = getClientIdentifier(request);
  const userIdentifier = getPrivacySafeIdentifier("upload_delete_user", user.id);
  if (!clientIdentifier || !userIdentifier) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  const deleteQuota = quotaResponse(await consumeUploadQuota({
    admin,
    clientIdentifier,
    operation: "upload_delete",
    userIdentifier
  }));
  if (deleteQuota) {
    return deleteQuota;
  }

  const { error } = await admin.storage.from(INVITATION_ASSET_BUCKET).remove([path]);

  if (error) {
    return NextResponse.json(
      { success: false, message: "이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  if (process.env.INVITATION_ASSET_ACCESS_ENABLED !== "true") {
    return NextResponse.json({ success: false, message: "자산 접근 서비스가 비활성화되어 있습니다." }, { status: 503 });
  }
  const { admin, user } = await getAuthenticatedClients(request);
  if (!admin) return NextResponse.json({ success: false, message: "자산 접근 서비스를 준비 중입니다." }, { status: 503 });
  if (!user) return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });

  const deletionResponse = await accountDeletionResponse(admin, user.id);
  if (deletionResponse) return deletionResponse;

  const requestUrl = new URL(request.url);
  const keys = [...requestUrl.searchParams.keys()];
  if (keys.length !== 1 || keys[0] !== "path" || requestUrl.searchParams.getAll("path").length !== 1) {
    return NextResponse.json({ success: false, message: "단일 자산 경로만 허용됩니다." }, { status: 400 });
  }
  const path = requestUrl.searchParams.get("path") ?? "";
  if (!isOwnedInvitationAssetPath(path, user.id)) {
    return NextResponse.json({ success: false, message: "본인 소유 파일만 조회할 수 있습니다." }, { status: 403 });
  }

  const clientIdentifier = getClientIdentifier(request);
  const userIdentifier = getPrivacySafeIdentifier("owner_asset_user", user.id);
  if (!clientIdentifier || !userIdentifier) {
    return NextResponse.json({ success: false, message: "요청 보호 서비스를 사용할 수 없습니다." }, { status: 503 });
  }
  const quota = await consumeRateLimits({
    admin,
    timeoutMs: 750,
    policies: [
      { key: `owner_asset:user:${userIdentifier}:burst`, limit: 30, windowMs: MINUTE_MS },
      { key: `owner_asset:user:${userIdentifier}:rolling`, limit: 300, windowMs: HOUR_MS },
      { key: `owner_asset:user:${userIdentifier}:daily`, limit: 1_000, windowMs: DAY_MS },
      { key: `owner_asset:client:${clientIdentifier}:daily`, limit: 1_000, windowMs: DAY_MS },
      { key: "owner_asset:global:daily", limit: 1_000, windowMs: DAY_MS }
    ]
  });
  if (!quota.ok) return NextResponse.json({ success: false, message: "요청 보호 서비스를 사용할 수 없습니다." }, { status: 503 });
  if (!quota.allowed) return NextResponse.json({ success: false, message: "자산 요청이 너무 많습니다." }, { status: 429 });

  let signedResult: { data: { signedUrl?: string } | null; error: unknown };
  try {
    signedResult = await withInvitationAssetTimeout(
      admin.storage.from(INVITATION_ASSET_BUCKET).createSignedUrl(path, INVITATION_ASSET_OWNER_TTL_SECONDS),
      750
    );
  } catch {
    return NextResponse.json({ success: false, message: "자산 URL을 생성하지 못했습니다." }, { status: 503 });
  }
  const signedUrl = signedResult.data?.signedUrl ?? "";
  if (signedResult.error || !isSafeSignedAssetUrl(signedUrl)) {
    return NextResponse.json({ success: false, message: "자산 URL을 생성하지 못했습니다." }, { status: 503 });
  }
  return NextResponse.json(
    { success: true, signedUrl, expiresIn: INVITATION_ASSET_OWNER_TTL_SECONDS },
    { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } }
  );
}
