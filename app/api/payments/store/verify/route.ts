import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isAppleStoreVerificationEnabled,
  isGooglePlayVerificationEnabled,
  isLegacyStoreVerificationEnabled
} from "@/lib/env";
import { verifyAppleTransaction } from "@/lib/payments/apple-store";
import { verifyGooglePlayPurchase } from "@/lib/payments/google-play";
import { getInvitationPricing } from "@/lib/payments/pricing";
import {
  getStoreProviderReference,
  isAllowedStoreProductId,
  sanitizeStoreVerification
} from "@/lib/payments/store-entitlements";
import { buildPublishedInvitationAssetPayload } from "@/lib/invitation-assets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeInvitationPayload } from "@/lib/supabase/invitation-payload";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

export const dynamic = "force-dynamic";

const storeVerifySchema = z.object({
  provider: z.enum(["apple_iap", "google_play"]),
  productId: z.string().trim().min(1).max(120),
  invitationId: z.string().trim().min(1).max(120),
  purchaseToken: z.string().trim().min(1).max(4096).optional(),
  receiptData: z.string().trim().min(1).max(65536).optional(),
  transactionId: z.string().trim().min(1).max(512).optional(),
  environment: z.enum(["sandbox", "production"]).optional()
});

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

function storeVerifyJson(body: Record<string, unknown>, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Authorization");
  return response;
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
  const { user } = await getAuthenticatedUser(request);

  if (!user) {
    return storeVerifyJson({ success: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isLegacyStoreVerificationEnabled()) {
    return storeVerifyJson(
      {
        success: false,
        message: "레거시 스토어 직접 검증 경로는 비활성화되었습니다. RevenueCat 발행권 경로를 사용해 주세요."
      },
      { status: 410 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return storeVerifyJson({ success: false, message: "스토어 결제 서버 설정이 완료되지 않았습니다." }, { status: 503 });
  }

  if (!ensureJsonRequest(request)) {
    return storeVerifyJson({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const json = await readJsonBody(request, 80 * 1024);
  if (!json.ok) {
    return storeVerifyJson({ success: false, message: json.message }, { status: 400 });
  }

  const parsed = storeVerifySchema.safeParse(json.body);
  if (!parsed.success) {
    return storeVerifyJson({ success: false, message: "스토어 결제 검증 정보가 누락되었습니다." }, { status: 400 });
  }

  const body = parsed.data;

  if (!isAllowedStoreProductId(body.provider, body.productId)) {
    return storeVerifyJson({ success: false, message: "허용되지 않은 스토어 상품입니다." }, { status: 400 });
  }

  const { data: invitation, error: invitationError } = await admin
    .from("invitations")
    .select("*")
    .eq("id", body.invitationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invitationError || !invitation) {
    return storeVerifyJson({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  if (invitation.user_id !== user.id) {
    return storeVerifyJson({ success: false, message: "초대장을 찾을 수 없습니다." }, { status: 404 });
  }

  const normalizedPayload = normalizeInvitationPayload(invitation.payload);
  const publishedPayload = buildPublishedInvitationAssetPayload(invitation.slug, normalizedPayload);
  const pricing = getInvitationPricing(normalizedPayload);

  if (pricing.isFree) {
    return storeVerifyJson(
      { success: false, message: "무료 구성은 스토어 검증이 아니라 무료 발행 경로를 사용해야 합니다." },
      { status: 409 }
    );
  }

  let verification: Record<string, unknown>;

  if (body.provider === "apple_iap") {
    if (!body.transactionId && !body.receiptData) {
      return storeVerifyJson({ success: false, message: "Apple 결제 검증에는 transactionId 또는 receiptData가 필요합니다." }, { status: 400 });
    }

    if (!isAppleStoreVerificationEnabled()) {
      return storeVerifyJson({ success: false, message: "Apple 영수증 검증 서버 설정이 완료되지 않았습니다." }, { status: 503 });
    }

    try {
      verification = await verifyAppleTransaction({
        transactionId: body.transactionId ?? "",
        productId: body.productId,
        environment: body.environment
      }) as Record<string, unknown>;
    } catch (error) {
      return storeVerifyJson(
        { success: false, message: error instanceof Error ? error.message : "Apple 영수증 검증에 실패했습니다." },
        { status: 400 }
      );
    }
  } else {
    if (!body.purchaseToken) {
      return storeVerifyJson({ success: false, message: "Google Play 결제 검증에는 purchaseToken이 필요합니다." }, { status: 400 });
    }

    if (!isGooglePlayVerificationEnabled()) {
      return storeVerifyJson({ success: false, message: "Google Play 영수증 검증 서버 설정이 완료되지 않았습니다." }, { status: 503 });
    }

    try {
      verification = await verifyGooglePlayPurchase({
        productId: body.productId,
        purchaseToken: body.purchaseToken
      }) as Record<string, unknown>;
    } catch (error) {
      return storeVerifyJson(
        { success: false, message: error instanceof Error ? error.message : "Google Play 영수증 검증에 실패했습니다." },
        { status: 400 }
      );
    }
  }

  const sanitizedVerification = sanitizeStoreVerification(body.provider, verification);
  const providerReference = getStoreProviderReference(body.provider, verification);
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
    return storeVerifyJson({ success: false, message: "이미 다른 발행에 사용된 스토어 결제입니다." }, { status: 409 });
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
            ready_payload: sanitizedVerification,
            approved_at: new Date().toISOString()
          })
          .select()
          .single()
      ).data;

  if (!payment) {
    return storeVerifyJson({ success: false, message: "스토어 결제 기록을 저장하지 못했습니다." }, { status: 500 });
  }

  await admin.from("payment_audit_logs").insert({
    payment_id: payment.id,
    action: "approve",
    request_payload: {
      invitationId: invitation.id,
      provider: body.provider,
      productId: body.productId
    },
    response_payload: sanitizedVerification
  });

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
    return storeVerifyJson({ success: false, message: "스토어 결제 후 초대장을 발행하지 못했습니다." }, { status: 500 });
  }

  return storeVerifyJson({
    success: true,
    invitationId: invitation.id,
    slug: invitation.slug,
    verification: sanitizedVerification
  });
}
