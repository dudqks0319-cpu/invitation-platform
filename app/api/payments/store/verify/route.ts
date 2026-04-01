import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  isAppleStoreVerificationEnabled,
  isGooglePlayVerificationEnabled
} from "@/lib/env";
import { verifyAppleTransaction } from "@/lib/payments/apple-store";
import { verifyGooglePlayPurchase } from "@/lib/payments/google-play";
import { getInvitationPricing } from "@/lib/payments/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";

type StoreVerifyBody = {
  provider?: "apple_iap" | "google_play";
  productId?: string;
  invitationId?: string;
  purchaseToken?: string;
  receiptData?: string;
  transactionId?: string;
  environment?: "sandbox" | "production";
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return { user: null };
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const {
    data: { user },
    error
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { user: null };
  }

  return { user };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as StoreVerifyBody | null;
  const admin = createSupabaseAdminClient();
  const { user } = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!admin) {
    return NextResponse.json({ success: false, message: "스토어 결제 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  if (!body?.provider || !body.productId || !body.invitationId) {
    return NextResponse.json({ success: false, message: "스토어 결제 검증 정보가 누락되었습니다." }, { status: 400 });
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

  if (invitation.user_id !== user.id) {
    return NextResponse.json({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const normalizedPayload = normalizeInvitationPayload(invitation.payload);
  const pricing = getInvitationPricing(normalizedPayload);

  if (pricing.isFree) {
    return NextResponse.json(
      { success: false, message: "무료 구성은 스토어 검증이 아니라 무료 발행 경로를 사용해야 합니다." },
      { status: 409 }
    );
  }

  let verification: Record<string, unknown>;
  let providerReference = "";

  if (body.provider === "apple_iap") {
    if (!body.transactionId && !body.receiptData) {
      return NextResponse.json({ success: false, message: "Apple 결제 검증에는 transactionId 또는 receiptData가 필요합니다." }, { status: 400 });
    }

    if (!isAppleStoreVerificationEnabled()) {
      return NextResponse.json({ success: false, message: "Apple 영수증 검증 서버 설정이 완료되지 않았습니다." }, { status: 503 });
    }

    try {
      verification = await verifyAppleTransaction({
        transactionId: body.transactionId ?? "",
        productId: body.productId,
        environment: body.environment
      }) as Record<string, unknown>;
      providerReference = String(verification.transactionId ?? body.transactionId ?? "");
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error instanceof Error ? error.message : "Apple 영수증 검증에 실패했습니다." },
        { status: 400 }
      );
    }
  } else {
    if (!body.purchaseToken) {
      return NextResponse.json({ success: false, message: "Google Play 결제 검증에는 purchaseToken이 필요합니다." }, { status: 400 });
    }

    if (!isGooglePlayVerificationEnabled()) {
      return NextResponse.json({ success: false, message: "Google Play 영수증 검증 서버 설정이 완료되지 않았습니다." }, { status: 503 });
    }

    try {
      verification = await verifyGooglePlayPurchase({
        productId: body.productId,
        purchaseToken: body.purchaseToken
      }) as Record<string, unknown>;
      providerReference = body.purchaseToken;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error instanceof Error ? error.message : "Google Play 영수증 검증에 실패했습니다." },
        { status: 400 }
      );
    }
  }

  const buyerName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user.email ||
    "앱 사용자";
  const providerOrderId = `${body.provider}:${providerReference || body.productId}`;

  const { data: existingPayment } = await admin
    .from("payments")
    .select("*")
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();

  if (
    existingPayment &&
    (existingPayment.user_id !== user.id || existingPayment.invitation_id !== invitation.id)
  ) {
    return NextResponse.json({ success: false, message: "이미 다른 발행에 사용된 스토어 결제입니다." }, { status: 409 });
  }

  const payment = existingPayment
    ? existingPayment
    : (
        await admin
          .from("payments")
          .insert({
            invitation_id: invitation.id,
            user_id: user.id,
            provider: body.provider,
            status: "paid",
            amount: pricing.amount,
            currency: "KRW",
            buyer_name: buyerName,
            buyer_email: user.email || "unknown@invitehub.local",
            buyer_phone: user.phone || "",
            provider_tid: providerReference || null,
            provider_order_id: providerOrderId,
            ready_payload: verification,
            approved_at: new Date().toISOString()
          })
          .select()
          .single()
      ).data;

  if (!payment) {
    return NextResponse.json({ success: false, message: "스토어 결제 기록을 저장하지 못했습니다." }, { status: 500 });
  }

  await admin.from("payment_audit_logs").insert({
    payment_id: payment.id,
    action: "approve",
    request_payload: {
      invitationId: invitation.id,
      provider: body.provider,
      productId: body.productId
    },
    response_payload: verification
  });

  const { error: updateError } = await admin
    .from("invitations")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      repurchase_required: false,
      paid_payload_snapshot: normalizedPayload
    })
    .eq("id", invitation.id);

  if (updateError) {
    return NextResponse.json({ success: false, message: "스토어 결제 후 초대장을 발행하지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    invitationId: invitation.id,
    slug: invitation.slug,
    verification
  });
}
