import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCheckoutPrice, requestKakaoPayReady } from "@/lib/payments/kakaopay";
import { generateApproveNonce } from "@/lib/payments/nonce";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ReadyRequest = {
  invitationId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
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

  const body = (await request.json().catch(() => null)) as ReadyRequest | null;

  if (!body?.invitationId || !body.buyerName || !body.buyerEmail || !body.buyerPhone) {
    return NextResponse.json({ success: false, message: "결제 정보가 누락되었습니다." }, { status: 400 });
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("*")
    .eq("id", body.invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return NextResponse.json({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const price = getCheckoutPrice();
  const paymentOrderId = crypto.randomUUID();
  const approveNonce = generateApproveNonce();
  const siteOrigin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      invitation_id: invitation.id,
      user_id: user.id,
      provider: "kakaopay",
      status: "payment_pending",
      amount: price.amount,
      currency: price.currency,
      buyer_name: body.buyerName,
      buyer_email: body.buyerEmail,
      buyer_phone: body.buyerPhone,
      provider_order_id: paymentOrderId,
      approve_nonce: approveNonce
    })
    .select()
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ success: false, message: "결제를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  try {
    const approvalUrl = new URL("/api/payments/kakaopay/approve", siteOrigin);
    approvalUrl.searchParams.set("paymentId", payment.id);
    approvalUrl.searchParams.set("nonce", approveNonce);

    const cancelUrl = new URL("/checkout", siteOrigin);
    cancelUrl.searchParams.set("invitationId", invitation.id);
    cancelUrl.searchParams.set("payment", "cancelled");

    const failUrl = new URL("/checkout", siteOrigin);
    failUrl.searchParams.set("invitationId", invitation.id);
    failUrl.searchParams.set("payment", "failed");

    const readyResult = await requestKakaoPayReady({
      orderId: payment.provider_order_id,
      userId: user.id,
      approvalUrl: approvalUrl.toString(),
      cancelUrl: cancelUrl.toString(),
      failUrl: failUrl.toString(),
      itemName: `${invitation.title} 결제`
    });

    await admin.from("payments").update({
      provider_tid: readyResult.tid,
      ready_payload: readyResult
    }).eq("id", payment.id);

    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "ready",
      request_payload: {
        ...body,
        paymentOrderId
      },
      response_payload: readyResult
    });

    await admin.from("invitations").update({
      status: "payment_pending"
    }).eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      redirectUrl:
        readyResult.next_redirect_pc_url ||
        readyResult.next_redirect_mobile_url ||
        readyResult.next_redirect_app_url
    });
  } catch (error) {
    await admin.from("payments").update({
      status: "payment_failed"
    }).eq("id", payment.id);

    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "fail",
      request_payload: body,
      response_payload: {
        message: error instanceof Error ? error.message : "결제 준비 실패"
      }
    });

    await admin.from("invitations").update({
      status: "payment_failed"
    }).eq("id", invitation.id);

    return NextResponse.json(
      { success: false, message: "결제 준비에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
