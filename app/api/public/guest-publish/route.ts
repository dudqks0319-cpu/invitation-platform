import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { createInvitationSlug, normalizeDraft } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { consumeRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

type GuestPublishRequest = {
  payload?: unknown;
  website?: string;
};

const GUEST_PUBLISHER_EMAIL = "guest-publisher@invitehub.app";
const GUEST_PUBLISH_LIMIT = 10;
const GUEST_PUBLISH_WINDOW_MS = 60 * 60 * 1000;
const guestPublishBuckets = new Map<string, { count: number; resetAt: number }>();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function consumeGuestPublishFallback(key: string) {
  const now = Date.now();
  const current = guestPublishBuckets.get(key);

  if (!current || current.resetAt <= now) {
    const next = {
      count: 1,
      resetAt: now + GUEST_PUBLISH_WINDOW_MS
    };
    guestPublishBuckets.set(key, next);
    return {
      allowed: true
    };
  }

  if (current.count >= GUEST_PUBLISH_LIMIT) {
    return {
      allowed: false
    };
  }

  guestPublishBuckets.set(key, {
    ...current,
    count: current.count + 1
  });

  return {
    allowed: true
  };
}

export async function POST(request: Request) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 처리할 수 있습니다." }, { status: 415 });
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json({ success: false, message: bodyResult.message }, { status: 400 });
  }

  const body = bodyResult.body as GuestPublishRequest;
  if ((body.website ?? "").trim().length > 0) {
    return NextResponse.json({ success: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const guestPublisher = await ensureGuestPublisherId();
  if (!guestPublisher.ok) {
    return NextResponse.json({ success: false, message: guestPublisher.message }, { status: 503 });
  }

  const rateLimit = await consumeRateLimit({
    admin: guestPublisher.admin,
    key: `guest_publish:${getClientIdentifier(request)}`,
    limit: GUEST_PUBLISH_LIMIT,
    windowMs: GUEST_PUBLISH_WINDOW_MS
  });

  const rateLimitAllowed = rateLimit.ok
    ? rateLimit.allowed
    : consumeGuestPublishFallback(`guest_publish_fallback:${getClientIdentifier(request)}`).allowed;

  if (!rateLimitAllowed) {
    return NextResponse.json({ success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
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
      { success: false, message: "현재 무료 발행 대상이 아닌 항목이 포함되어 있습니다." },
      { status: 409 }
    );
  }

  const slug = payload.shareUrl || createInvitationSlug(payload);
  const publishedPayload = buildPublishedInvitationAssetPayload(slug, {
    ...payload,
    shareUrl: slug
  });

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
      paid_payload_snapshot: payload,
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
    slug
  });
}
