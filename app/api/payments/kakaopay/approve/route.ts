import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { requestKakaoPayApprove } from "@/lib/payments/kakaopay";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const paymentId = requestUrl.searchParams.get("paymentId");
  const pgToken = requestUrl.searchParams.get("pg_token");
  const admin = createSupabaseAdminClient();

  if (!admin || !paymentId || !pgToken) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !payment) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("id", payment.invitation_id)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  try {
    const approveResult = await requestKakaoPayApprove({
      orderId: payment.provider_order_id,
      userId: payment.user_id,
      tid: payment.provider_tid,
      pgToken
    });

    const normalizedPayload = normalizeInvitationPayload(invitation.payload);

    await admin.from("payments").update({
      status: "paid",
      approved_at: new Date().toISOString()
    }).eq("id", payment.id);

    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "approve",
      request_payload: { paymentId, pgToken },
      response_payload: approveResult
    });

    await admin.from("invitations").update({
      status: "published",
      published_at: new Date().toISOString(),
      repurchase_required: false,
      paid_payload_snapshot: normalizedPayload
    }).eq("id", invitation.id);

    const successUrl = new URL("/checkout", requestUrl.origin);
    successUrl.searchParams.set("payment", "success");
    successUrl.searchParams.set("invitationId", invitation.id);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    await admin.from("payments").update({
      status: "payment_failed"
    }).eq("id", payment.id);

    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "fail",
      request_payload: { paymentId, pgToken },
      response_payload: {
        message: error instanceof Error ? error.message : "결제 승인 실패"
      }
    });

    await admin.from("invitations").update({
      status: "payment_failed"
    }).eq("id", invitation.id);

    return NextResponse.redirect(new URL(`/checkout?payment=failed&invitationId=${invitation.id}`, requestUrl.origin));
  }
}
