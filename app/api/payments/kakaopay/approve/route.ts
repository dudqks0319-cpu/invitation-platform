import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { requestKakaoPayApprove } from "@/lib/payments/kakaopay";
import { isNonceExpired, isValidNonceFormat } from "@/lib/payments/nonce";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const paymentId = requestUrl.searchParams.get("paymentId");
  const pgToken = requestUrl.searchParams.get("pg_token");
  const nonce = requestUrl.searchParams.get("nonce");
  const admin = createSupabaseAdminClient();
  const supabase = await createServerSupabaseClient();

  if (!admin || !paymentId || !pgToken || !nonce || !isValidNonceFormat(nonce)) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  const {
    data: { user }
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (!user) {
    const signInUrl = new URL("/sign-in", requestUrl.origin);
    signInUrl.searchParams.set("next", `${requestUrl.pathname}${requestUrl.search}`);
    signInUrl.searchParams.set("error", "결제 승인을 마치려면 다시 로그인해 주세요.");
    return NextResponse.redirect(signInUrl);
  }

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (
    paymentError ||
    !payment ||
    payment.status !== "payment_pending" ||
    !payment.provider_tid ||
    !payment.provider_order_id ||
    payment.approve_nonce !== nonce ||
    payment.nonce_used_at ||
    isNonceExpired(payment.created_at)
  ) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  if (payment.user_id !== user.id) {
    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "fail",
      request_payload: { paymentId, pgToken, nonce, reason: "user_mismatch" },
      response_payload: {
        message: "결제 승인 사용자와 세션 사용자가 일치하지 않습니다."
      }
    });

    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("id", payment.invitation_id)
    .maybeSingle();

  if (!invitation || invitation.user_id !== payment.user_id) {
    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  if (invitation.user_id !== user.id) {
    await admin.from("payment_audit_logs").insert({
      payment_id: payment.id,
      action: "fail",
      request_payload: { paymentId, pgToken, nonce, reason: "invitation_owner_mismatch" },
      response_payload: {
        message: "초대장 소유자와 세션 사용자가 일치하지 않습니다."
      }
    });

    return NextResponse.redirect(new URL("/checkout?payment=failed", requestUrl.origin));
  }

  await admin.from("payments").update({
    nonce_used_at: new Date().toISOString()
  }).eq("id", payment.id);

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
      request_payload: { paymentId, pgToken, nonce },
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
      request_payload: { paymentId, pgToken, nonce },
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
