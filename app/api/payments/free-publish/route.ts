import { NextResponse } from "next/server";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";
import { consumeRateLimits, getClientIdentifier } from "@/lib/rate-limit";
import {
  ensureJsonRequest,
  getBearerToken,
  getIdempotencyKey,
  publicSlugSchema,
  readJsonBody
} from "@/lib/supabase/public-write";

type FreePublishRequest = {
  invitationId?: string;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ success: false, message: "서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const bearerToken = getBearerToken(request);
  const authResult = bearerToken
    ? await admin.auth.getUser(bearerToken)
    : await supabase.auth.getUser();
  const user = authResult.data.user;

  if (authResult.error || !user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }
  if (user.is_anonymous) {
    return NextResponse.json(
      { success: false, message: "게스트 초대장은 게스트 전용 발행 경로를 사용해 주세요." },
      { status: 403 }
    );
  }

  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const json = await readJsonBody(request);
  if (!json.ok) {
    return NextResponse.json({ success: false, message: json.message }, { status: 400 });
  }

  const body = json.body as FreePublishRequest | null;

  if (!body?.invitationId || !publicSlugSchema.safeParse(body.invitationId).success) {
    return NextResponse.json({ success: false, message: "초대장 정보가 누락되었습니다." }, { status: 400 });
  }

  if (getIdempotencyKey(request) !== `free-publish:${body.invitationId}`) {
    return NextResponse.json(
      { success: false, message: "요청 식별자가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const { data: invitation, error } = await admin
    .from("invitations")
    .select("*")
    .eq("id", body.invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !invitation || invitation.status === "deletion_pending") {
    return NextResponse.json({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const clientIdentifier = getClientIdentifier(request);
  if (!clientIdentifier) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const quota = await consumeRateLimits({
    admin,
    policies: [
      { key: `free_publish:user:${user.id}:burst`, limit: 5, windowMs: MINUTE_MS },
      { key: `free_publish:user:${user.id}:rolling`, limit: 30, windowMs: HOUR_MS },
      { key: `free_publish:user:${user.id}:daily`, limit: 100, windowMs: DAY_MS },
      { key: `free_publish:client:${clientIdentifier}:daily`, limit: 100, windowMs: DAY_MS },
      { key: "free_publish:global:daily", limit: 10_000, windowMs: DAY_MS }
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

  const payload = normalizeInvitationPayload(invitation.payload);
  const publishedPayload = buildPublishedInvitationAssetPayload(invitation.slug, payload);
  const pricing = getInvitationPricing(payload);

  if (!pricing.isFree) {
    return NextResponse.json({ success: false, message: "유료 항목이 포함되어 있어 무료 발행을 사용할 수 없습니다." }, { status: 409 });
  }

  const { error: updateError } = await admin
    .from("invitations")
    .update({
      payload: publishedPayload,
      status: "published",
      published_at: new Date().toISOString(),
      repurchase_required: false,
      paid_payload_snapshot: payload
    })
    .eq("id", invitation.id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ success: false, message: "무료 발행 처리에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true, invitationId: invitation.id, slug: invitation.slug });
}
