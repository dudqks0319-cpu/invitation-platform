import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { getPublishMissingFields, getPublishMissingFieldsMessage } from "@/lib/invitation-publish-readiness";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureJsonRequest, ensureSameOriginRequest, readJsonBody } from "@/lib/supabase/public-write";

const publishRecoverySchema = z.object({
  invitationId: z.string().trim().min(1).max(120)
});

export async function POST(request: Request) {
  if (!ensureSameOriginRequest(request)) {
    return NextResponse.json({ success: false, message: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!admin) {
    return NextResponse.json({ success: false, message: "발행 복구 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  if (!ensureJsonRequest(request)) {
    return NextResponse.json({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const json = await readJsonBody(request, 16 * 1024);
  if (!json.ok) {
    return NextResponse.json({ success: false, message: json.message }, { status: 400 });
  }

  const parsed = publishRecoverySchema.safeParse(json.body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "복구할 초대장 정보가 누락되었습니다." }, { status: 400 });
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("*")
    .eq("id", parsed.data.invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  if (invitation.status === "published") {
    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      slug: invitation.slug,
      recovered: false,
      message: "이미 공개 링크가 준비되어 있습니다."
    });
  }

  const { data: payment } = await admin
    .from("payments")
    .select("id")
    .eq("invitation_id", invitation.id)
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("approved_at", { ascending: false })
    .maybeSingle();

  if (!payment) {
    return NextResponse.json(
      { success: false, message: "확인된 결제 기록이 없어 발행 복구를 진행할 수 없습니다." },
      { status: 409 }
    );
  }

  const normalizedPayload = normalizeInvitationPayload(invitation.payload);
  const missingFields = getPublishMissingFields(normalizedPayload);

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        success: false,
        paymentConfirmed: true,
        publishBlocked: true,
        message: `결제는 확인됐지만 ${getPublishMissingFieldsMessage(missingFields)}`,
        invitationId: invitation.id,
        slug: invitation.slug
      },
      { status: 409 }
    );
  }

  const publishedPayload = buildPublishedInvitationAssetPayload(invitation.slug, normalizedPayload);

  const { error: updateError } = await admin
    .from("invitations")
    .update({
      payload: publishedPayload,
      status: "published",
      published_at: new Date().toISOString(),
      repurchase_required: false,
      paid_payload_snapshot: normalizedPayload
    })
    .eq("id", invitation.id);

  if (updateError) {
    return NextResponse.json({ success: false, message: "결제 확인 후 초대장을 발행하지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    invitationId: invitation.id,
    slug: invitation.slug,
    recovered: true,
    message: "결제 확인된 초대장을 공개 링크로 발행했습니다."
  });
}
