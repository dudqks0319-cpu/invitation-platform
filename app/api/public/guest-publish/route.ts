import { NextResponse } from "next/server";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { createInvitationSlug, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";
import { consumeRateLimits, getClientIdentifier } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ensureJsonRequest,
  getBearerToken,
  getIdempotencyKey,
  hashPublicWrite,
  publicSlugSchema,
  readJsonBody
} from "@/lib/supabase/public-write";

type GuestPublishRequest = {
  payload?: unknown;
  website?: string;
};

type ExistingGuestPublish = {
  id: string;
  slug: string;
  guest_publish_request_hash: string | null;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

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

function successResponse(invitation: { id: string; slug: string }) {
  return NextResponse.json({
    success: true,
    invitationId: invitation.id,
    slug: invitation.slug
  });
}

export async function POST(request: Request) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json(
      { success: false, message: "JSON 요청만 처리할 수 있습니다." },
      { status: 415 }
    );
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { success: false, message: bodyResult.message },
      { status: 400 }
    );
  }

  const body = bodyResult.body as GuestPublishRequest;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 }
    );
  }
  if ((body.website ?? "").trim().length > 0) {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  let payload: ReturnType<typeof normalizeDraft>;
  try {
    payload = normalizeDraft(body.payload ?? {});
  } catch {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

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

  const slug = payload.shareUrl || createInvitationSlug(payload);
  if (!publicSlugSchema.safeParse(slug).success) {
    return NextResponse.json(
      { success: false, message: "초대장 주소가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const idempotencyKey = getIdempotencyKey(request);
  if (!idempotencyKey) {
    return NextResponse.json(
      { success: false, message: "요청 식별자가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { success: false, message: "게스트 세션 인증이 필요합니다." },
      { status: 401 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "서버 설정이 완료되지 않았습니다." },
      { status: 503 }
    );
  }

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) {
    return NextResponse.json(
      { success: false, message: "게스트 세션을 확인할 수 없습니다." },
      { status: 401 }
    );
  }
  if (!user.is_anonymous) {
    return NextResponse.json(
      { success: false, message: "로그인 사용자는 본인 소유 초대장 발행 경로를 사용해 주세요." },
      { status: 403 }
    );
  }

  const clientIdentifier = getClientIdentifier(request);
  if (!clientIdentifier) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스 설정을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const publishedPayload = buildPublishedInvitationAssetPayload(slug, {
    ...payload,
    shareUrl: slug
  });
  const idempotencyHash = hashPublicWrite("guest-publish", user.id, idempotencyKey);
  const requestHash = hashPublicWrite(
    "guest-publish-request",
    JSON.stringify(publishedPayload)
  );

  const quota = await consumeRateLimits({
    admin,
    policies: [
      { key: `guest_publish:user:${user.id}:burst`, limit: 3, windowMs: MINUTE_MS },
      { key: `guest_publish:user:${user.id}:rolling`, limit: 10, windowMs: HOUR_MS },
      { key: `guest_publish:user:${user.id}:daily`, limit: 20, windowMs: DAY_MS },
      { key: `guest_publish:client:${clientIdentifier}:burst`, limit: 3, windowMs: MINUTE_MS },
      { key: `guest_publish:client:${clientIdentifier}:rolling`, limit: 10, windowMs: HOUR_MS },
      { key: `guest_publish:client:${clientIdentifier}:daily`, limit: 20, windowMs: DAY_MS },
      { key: "guest_publish:global:daily", limit: 1000, windowMs: DAY_MS }
    ]
  });

  if (!quota.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }
  if (!quota.allowed) {
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

  const verifiedAdmin = admin;
  const ownerId = user.id;
  async function findExisting() {
    return verifiedAdmin
      .from("invitations")
      .select("id, slug, guest_publish_request_hash")
      .eq("user_id", ownerId)
      .eq("guest_publish_idempotency_key_hash", idempotencyHash)
      .maybeSingle();
  }

  const { data: existing, error: existingError } = await findExisting();
  if (existingError) {
    return NextResponse.json(
      { success: false, message: "기존 발행 요청을 확인하지 못했습니다." },
      { status: 503 }
    );
  }
  if (existing) {
    if ((existing as ExistingGuestPublish).guest_publish_request_hash !== requestHash) {
      return NextResponse.json(
        { success: false, message: "같은 요청 식별자를 다른 발행 내용에 재사용할 수 없습니다." },
        { status: 409 }
      );
    }
    return successResponse(existing as ExistingGuestPublish);
  }

  const { data, error } = await admin
    .from("invitations")
    .insert({
      user_id: user.id,
      slug,
      title: publishedPayload.title,
      category: publishedPayload.category,
      template_id: publishedPayload.templateId,
      status: "published",
      payload: publishedPayload,
      repurchase_required: false,
      paid_payload_snapshot: payload,
      guest_publish_idempotency_key_hash: idempotencyHash,
      guest_publish_request_hash: requestHash,
      published_at: new Date().toISOString()
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      const replay = await findExisting();
      if (
        !replay.error &&
        replay.data &&
        (replay.data as ExistingGuestPublish).guest_publish_request_hash === requestHash
      ) {
        return successResponse(replay.data as ExistingGuestPublish);
      }
    }
    return NextResponse.json(
      { success: false, message: "무료 게스트 발행에 실패했습니다." },
      { status: 500 }
    );
  }

  return successResponse(data);
}
