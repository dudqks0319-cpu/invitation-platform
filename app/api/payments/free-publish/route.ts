import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

type FreePublishRequest = {
  invitationId?: string;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ success: false, message: "서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as FreePublishRequest | null;

  if (!body?.invitationId) {
    return NextResponse.json({ success: false, message: "초대장 정보가 누락되었습니다." }, { status: 400 });
  }

  const { data: invitation, error } = await admin
    .from("invitations")
    .select("*")
    .eq("id", body.invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !invitation) {
    return NextResponse.json({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const payload = normalizeInvitationPayload(invitation.payload);
  const pricing = getInvitationPricing(payload);

  if (!pricing.isFree) {
    return NextResponse.json({ success: false, message: "유료 항목이 포함되어 있어 무료 발행을 사용할 수 없습니다." }, { status: 409 });
  }

  const { error: updateError } = await admin
    .from("invitations")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      repurchase_required: false,
      paid_payload_snapshot: payload
    })
    .eq("id", invitation.id);

  if (updateError) {
    return NextResponse.json({ success: false, message: "무료 발행 처리에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true, invitationId: invitation.id, slug: invitation.slug });
}
