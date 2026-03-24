import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCheckoutPrice, requestKakaoPayCancel } from "@/lib/payments/kakaopay";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CancelRequest = {
  paymentId: string;
  reason: string;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ success: false, message: "결제 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CancelRequest | null;

  if (!body?.paymentId || !body.reason) {
    return NextResponse.json({ success: false, message: "환불 요청 정보가 누락되었습니다." }, { status: 400 });
  }

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("*")
    .eq("id", body.paymentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (paymentError || !payment) {
    return NextResponse.json({ success: false, message: "결제 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    await admin.from("payments").update({
      status: "refund_pending",
      refund_reason: body.reason
    }).eq("id", payment.id);

    const cancelResult = await requestKakaoPayCancel({
      tid: payment.provider_tid,
      cancelAmount: payment.amount || getCheckoutPrice().amount
    });

    await admin.from("payments").update({
      status: "refunded",
      cancelled_at: new Date().toISOString(),
      refund_reason: body.reason
    }).eq("id", payment.id);

    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "cancel",
      request_payload: body,
      response_payload: cancelResult
    });

    await admin.from("invitations").update({
      status: "refunded",
      published_at: null
    }).eq("id", payment.invitation_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    await admin.from("payments").update({
      status: "payment_failed"
    }).eq("id", payment.id);

    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "fail",
      request_payload: body,
      response_payload: {
        message: error instanceof Error ? error.message : "환불 실패"
      }
    });

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "환불 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
