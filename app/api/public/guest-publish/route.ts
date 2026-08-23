import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  buildPublishedInvitationAssetPayload,
  getStoredInvitationAssetPaths
} from "@/lib/invitation-assets";
import { createInvitationSlug, normalizeDraft } from "@/lib/invitation-payload";
import { createGuestOwnerToken, hashGuestOwnerToken } from "@/lib/guest-owner-token";
import { getInvitationPricing } from "@/lib/payments/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  consumeRateLimitPolicies,
  getClientFingerprint,
  hashRateLimitIdempotencyKey
} from "@/lib/rate-limit";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

type GuestPublishRequest = {
  payload?: unknown;
  website?: string;
};

const GUEST_PUBLISHER_EMAIL = "guest-publisher@invitehub.app";
const GUEST_PUBLISH_MAX_JSON_BODY_BYTES = 2 * 1024 * 1024;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/i;
const MAX_FREE_GALLERY_PHOTOS = 8;

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

function hasUnboundExternalPhotos(payload: ReturnType<typeof normalizeDraft>) {
  const inlineOverlay = payload.templateId === "image-text-overlay";
  const mainUnbound = Boolean(
    payload.mainImageUrl &&
    !payload.mainImagePath &&
    !(inlineOverlay && payload.mainImageUrl.startsWith("data:image/"))
  );
  const backgroundUnbound = Boolean(
    payload.backgroundImageUrl &&
    !payload.backgroundImagePath &&
    !(inlineOverlay && payload.backgroundImageUrl.startsWith("data:image/"))
  );
  const galleryUnbound = payload.galleryImages.some((url, index) => Boolean(url && !payload.galleryImagePaths[index]));
  return mainUnbound || backgroundUnbound || galleryUnbound;
}

async function validateGuestAssetOwnership(request: Request, payload: ReturnType<typeof normalizeDraft>) {
  const paths = getStoredInvitationAssetPaths(payload);
  if (payload.galleryImagePaths.length > MAX_FREE_GALLERY_PHOTOS || payload.galleryImages.length > MAX_FREE_GALLERY_PHOTOS) {
    return { ok: false as const, status: 400, message: `갤러리 사진은 최대 ${MAX_FREE_GALLERY_PHOTOS}장까지 발행할 수 있습니다.` };
  }
  if (hasUnboundExternalPhotos(payload)) {
    return { ok: false as const, status: 400, message: "서버에서 확인된 사진만 게스트 초대장에 넣을 수 있습니다." };
  }
  if (paths.length === 0) return { ok: true as const };

  const token = getBearerToken(request);
  if (!token) {
    return { ok: false as const, status: 401, message: "사진 발행을 위한 게스트 세션이 필요합니다." };
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false as const, status: 503, message: "사진 소유권 확인 서버가 준비되지 않았습니다." };
  }
  const {
    data: { user },
    error
  } = await admin.auth.getUser(token);
  if (error || !user?.id) {
    return { ok: false as const, status: 401, message: "게스트 세션을 확인할 수 없습니다." };
  }

  const expectedPrefix = `${user.id}/guest/`;
  const ownsEveryPath = paths.every((path) =>
    path.startsWith(expectedPrefix) && /^[a-f0-9]{64}\.jpg$/.test(path.slice(expectedPrefix.length))
  );
  if (!ownsEveryPath) {
    return { ok: false as const, status: 403, message: "본인이 업로드한 사진만 발행할 수 있습니다." };
  }

  return { ok: true as const };
}

function getMissingFields(payload: ReturnType<typeof normalizeDraft>) {
  return [
    !payload.title.trim() ? "초대장 제목" : null,
    !payload.eventDateTime.trim() ? "행사 일시" : null,
    !payload.venueName.trim() ? "예식장 이름" : null,
    !payload.venueAddress.trim() ? "예식장 주소" : null,
    !payload.groomName.trim() ? "신랑 이름" : null,
    !payload.brideName.trim() ? "신부 이름" : null
  ].filter(Boolean) as string[];
}

async function ensureGuestPublisherId() {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      ok: false as const,
      message: "서버 설정이 완료되지 않았습니다."
    };
  }

  const configuredUserId = (process.env.SUPABASE_GUEST_PUBLISHER_USER_ID ?? "").trim();
  if (configuredUserId) {
    if (!UUID_PATTERN.test(configuredUserId)) {
      return {
        ok: false as const,
        message: "게스트 발행 계정 설정이 올바르지 않습니다."
      };
    }

    return {
      ok: true as const,
      admin,
      userId: configuredUserId
    };
  }

  const { data: usersData, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });

  if (listError) {
    return {
      ok: false as const,
      message: "게스트 발행 계정을 확인하지 못했습니다."
    };
  }

  const existing = usersData.users.find((user) => user.email === GUEST_PUBLISHER_EMAIL);
  if (existing?.id) {
    return {
      ok: true as const,
      admin,
      userId: existing.id
    };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: GUEST_PUBLISHER_EMAIL,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: {
      role: "guest-publisher",
      system: true
    }
  });

  if (createError || !created.user?.id) {
    return {
      ok: false as const,
      message: "게스트 발행 계정을 만들지 못했습니다."
    };
  }

  return {
    ok: true as const,
    admin,
    userId: created.user.id
  };
}

function getSafeRequestedSlug(value: string) {
  const slug = value.trim().toLowerCase();

  if (!slug || slug.startsWith("-") || slug.endsWith("-") || !PUBLIC_SLUG_PATTERN.test(slug)) {
    return "";
  }

  return slug;
}

export async function POST(request: Request) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 처리할 수 있습니다." }, { status: 415 });
  }

  const bodyResult = await readJsonBody(request, GUEST_PUBLISH_MAX_JSON_BODY_BYTES);
  if (!bodyResult.ok) {
    return NextResponse.json({ success: false, message: bodyResult.message }, { status: 400 });
  }

  const body = bodyResult.body as GuestPublishRequest;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ success: false, message: "입력값이 올바르지 않습니다." }, { status: 400 });
  }
  if ((body.website ?? "").trim().length > 0) {
    return NextResponse.json({ success: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const payload = normalizeDraft(body.payload ?? {});
  const missingFields = getMissingFields(payload);
  if (missingFields.length > 0) {
    return NextResponse.json(
      { success: false, message: `공개 전 입력이 필요한 항목: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  const pricing = getInvitationPricing(payload);
  if (!pricing.isFree) {
    return NextResponse.json(
      { success: false, message: "유료 옵션이 포함되어 있어 로그인 후 앱 스토어 결제로 발행해야 합니다." },
      { status: 409 }
    );
  }

  const assetOwnership = await validateGuestAssetOwnership(request, payload);
  if (!assetOwnership.ok) {
    return NextResponse.json(
      { success: false, message: assetOwnership.message },
      { status: assetOwnership.status }
    );
  }

  const idempotency = hashRateLimitIdempotencyKey(request.headers.get("idempotency-key"));
  if (!idempotency.ok) {
    const status = idempotency.message === "rate_limit_idempotency_invalid" ? 400 : 503;
    const message = status === 400
      ? "요청 식별자가 올바르지 않습니다."
      : "요청 보호 서비스 설정을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    return NextResponse.json({ success: false, message }, { status });
  }

  const client = getClientFingerprint(request);
  if (!client.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스 설정을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const slug = getSafeRequestedSlug(payload.shareUrl) || createInvitationSlug(payload);
  const publishedPayload = buildPublishedInvitationAssetPayload(slug, {
    ...payload,
    shareUrl: slug
  });
  const ownerToken = createGuestOwnerToken();

  const guestPublisher = await ensureGuestPublisherId();
  if (!guestPublisher.ok) {
    return NextResponse.json({ success: false, message: guestPublisher.message }, { status: 503 });
  }

  const quota = await consumeRateLimitPolicies({
    admin: guestPublisher.admin,
    policies: [
      { name: "burst", key: `guest_publish:burst:${client.fingerprint}`, limit: 3, windowMs: MINUTE_MS },
      {
        name: "rolling_hour",
        key: `guest_publish:rolling_hour:${client.fingerprint}`,
        limit: 10,
        windowMs: HOUR_MS
      },
      { name: "daily", key: `guest_publish:daily:${client.fingerprint}`, limit: 25, windowMs: DAY_MS },
      { name: "global_burst", key: "guest_publish:global:burst", limit: 100, windowMs: MINUTE_MS },
      { name: "global_daily", key: "guest_publish:global:daily", limit: 1000, windowMs: DAY_MS },
      {
        name: "idempotency",
        key: `guest_publish:idempotency:${idempotency.digest}`,
        limit: 1,
        windowMs: DAY_MS
      }
    ]
  });

  if (!quota.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  if (!quota.allowed) {
    if (quota.policy === "idempotency") {
      return NextResponse.json(
        { success: false, message: "이미 처리된 발행 요청입니다." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((quota.resetAt - Date.now()) / 1000)))
        }
      }
    );
  }

  const { data, error } = await guestPublisher.admin
    .from("invitations")
    .insert({
      user_id: guestPublisher.userId,
      slug,
      title: publishedPayload.title,
      category: publishedPayload.category,
      template_id: publishedPayload.templateId,
      status: "published",
      payload: publishedPayload,
      repurchase_required: false,
      paid_payload_snapshot: null,
      guest_owner_token_hash: hashGuestOwnerToken(ownerToken),
      guest_owner_created_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: "무료 게스트 발행에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    invitationId: data.id,
    slug,
    ownerToken
  });
}
