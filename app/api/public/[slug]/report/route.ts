import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolvePublishedInvitationBySlug } from "@/lib/invitation-variants";
import { applyGuestbookReportAutoBlock } from "@/lib/public-abuse";
import { consumeRateLimit, getClientIdentifier, hashClientIdentifier } from "@/lib/rate-limit";
import { ensureJsonRequest, publicContentReportSchema, readJsonBody } from "@/lib/supabase/public-write";

const WINDOW_MS = 60 * 1000;
const LIMIT = 3;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!ensureJsonRequest(request)) {
    return NextResponse.json(
      { success: false, message: "JSON 요청만 허용됩니다." },
      { status: 415 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "서버 설정이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  const { slug } = await context.params;
  const clientIdentifier = getClientIdentifier(request);
  const clientHash = hashClientIdentifier(clientIdentifier);
  const limitResult = await consumeRateLimit({
    admin,
    key: `report:${slug}:${clientHash}`,
    limit: LIMIT,
    windowMs: WINDOW_MS
  });

  if (!limitResult.ok) {
    return NextResponse.json(
      { success: false, message: "요청 보호 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 }
    );
  }

  if (!limitResult.allowed) {
    return NextResponse.json(
      { success: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { success: false, message: bodyResult.message },
      { status: 400 }
    );
  }

  const parsed = publicContentReportSchema.safeParse(bodyResult.body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true, message: "신고가 접수되었습니다." });
  }

  const lookup = await resolvePublishedInvitationBySlug(admin, slug);

  if (!lookup) {
    return NextResponse.json(
      { success: false, message: "유효하지 않은 초대장입니다." },
      { status: 404 }
    );
  }

  const targetId = parsed.data.targetType === "invitation" ? lookup.invitation.id : parsed.data.targetId;
  if (!targetId) {
    return NextResponse.json(
      { success: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const { error } = await admin.from("content_reports").insert({
    target_type: parsed.data.targetType,
    target_id: targetId,
    invitation_id: lookup.invitation.id,
    variant_id: lookup.variant?.id ?? null,
    reason: parsed.data.reason,
    detail: parsed.data.detail || null,
    reporter_contact: parsed.data.reporterContact || null,
    client_hash: clientHash,
    status: "pending"
  });

  if (error) {
    return NextResponse.json(
      { success: false, message: "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  await applyGuestbookReportAutoBlock({
    admin,
    invitationId: lookup.invitation.id,
    targetType: parsed.data.targetType,
    targetId
  });

  return NextResponse.json({
    success: true,
    message: "신고가 접수되었습니다. 운영자가 확인하겠습니다."
  });
}
