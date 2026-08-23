import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isRevenueCatWebhookEnabled } from "@/lib/env";
import { isAllowedAnyStoreProductId, isAllowedStoreProductId } from "@/lib/payments/store-entitlements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureJsonRequest, readJsonBody } from "@/lib/supabase/public-write";

const purchaseEventTypes = new Set(["NON_RENEWING_PURCHASE"]);
const revokeEventTypes = new Set(["CANCELLATION"]);
const maxDateMilliseconds = 8_640_000_000_000_000;

export const dynamic = "force-dynamic";

const revenueCatWebhookSchema = z.object({
  event: z.object({
    app_user_id: z.string().uuid().optional(),
    environment: z.string().optional(),
    id: z.string().optional(),
    original_transaction_id: z.string().optional().nullable(),
    product_id: z.string().trim().min(1).max(120).optional(),
    purchased_at_ms: z.number().int().nonnegative().max(maxDateMilliseconds).optional().nullable(),
    store: z.string().optional(),
    transaction_id: z.string().optional().nullable(),
    type: z.string().trim().min(1)
  }).passthrough()
}).passthrough();

function hasValidWebhookAuth(request: Request) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  if (!expected || !authorization) {
    return false;
  }

  const expectedHash = createHash("sha256").update(`Bearer ${expected}`).digest();
  const authorizationHash = createHash("sha256").update(authorization).digest();
  return timingSafeEqual(expectedHash, authorizationHash);
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "Authorization");
  return response;
}

function getPlatform(store: string | undefined) {
  const normalized = (store ?? "").toUpperCase();
  if (normalized === "APP_STORE") {
    return "ios" as const;
  }

  if (normalized === "PLAY_STORE") {
    return "android" as const;
  }

  return null;
}

type StorePlatform = NonNullable<ReturnType<typeof getPlatform>>;

function getProvider(platform: StorePlatform) {
  return platform === "ios" ? "apple_iap" : "google_play";
}

function getStoreTransactionId(event: z.infer<typeof revenueCatWebhookSchema>["event"]) {
  return event.transaction_id || event.original_transaction_id || "";
}

function getPurchasedAt(purchasedAtMs: number | null | undefined) {
  if (!purchasedAtMs) {
    return new Date().toISOString();
  }

  return new Date(purchasedAtMs).toISOString();
}

export async function POST(request: Request) {
  if (!isRevenueCatWebhookEnabled() || !hasValidWebhookAuth(request)) {
    return noStoreJson({ success: false, message: "RevenueCat 웹훅 인증이 필요합니다." }, { status: 401 });
  }

  if (!ensureJsonRequest(request)) {
    return noStoreJson({ success: false, message: "JSON 요청만 허용됩니다." }, { status: 415 });
  }

  const json = await readJsonBody(request, 80 * 1024);
  if (!json.ok) {
    return noStoreJson({ success: false, message: json.message }, { status: 400 });
  }

  const parsed = revenueCatWebhookSchema.safeParse(json.body);
  if (!parsed.success) {
    return noStoreJson({ success: false, message: "RevenueCat 이벤트 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { event } = parsed.data;
  if (event.type === "TEST") {
    return noStoreJson({ success: true, test: true });
  }

  if (purchaseEventTypes.has(event.type)) {
    const platform = getPlatform(event.store);
    const transactionId = getStoreTransactionId(event);

    if (!transactionId) {
      return noStoreJson({ success: false, message: "RevenueCat transaction_id가 필요합니다." }, { status: 400 });
    }

    if (event.store && !platform) {
      return noStoreJson({ success: false, message: "지원하지 않는 RevenueCat store입니다." }, { status: 400 });
    }

    if (!event.app_user_id || !event.product_id || !platform) {
      return noStoreJson({ success: false, message: "RevenueCat 구매 이벤트 정보가 누락되었습니다." }, { status: 400 });
    }

    const provider = getProvider(platform);
    if (!isAllowedStoreProductId(provider, event.product_id)) {
      return noStoreJson({ success: false, message: "허용되지 않은 RevenueCat 상품입니다." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return noStoreJson({ success: false, message: "Supabase service role 설정이 필요합니다." }, { status: 503 });
    }

    const { data, error } = await admin.rpc("grant_publish_credit", {
      p_entitlement: "publish_credit",
      p_platform: platform,
      p_product_id: event.product_id,
      p_purchased_at: getPurchasedAt(event.purchased_at_ms),
      p_quantity: 1,
      p_raw_event: event,
      p_transaction_id: transactionId,
      p_user_id: event.app_user_id
    });

    if (error) {
      return noStoreJson({ success: false, message: "발행권 적립에 실패했습니다." }, { status: 500 });
    }

    return noStoreJson({ success: true, granted: Boolean(data) });
  }

  if (revokeEventTypes.has(event.type)) {
    const platform = getPlatform(event.store);
    const transactionId = getStoreTransactionId(event);

    if (!transactionId) {
      return noStoreJson({ success: false, message: "RevenueCat transaction_id가 필요합니다." }, { status: 400 });
    }

    if (event.store && !platform) {
      return noStoreJson({ success: false, message: "지원하지 않는 RevenueCat store입니다." }, { status: 400 });
    }

    const provider = platform ? getProvider(platform) : null;
    const allowedProduct = provider
      ? !event.product_id || isAllowedStoreProductId(provider, event.product_id)
      : !event.product_id || isAllowedAnyStoreProductId(event.product_id);
    if (!allowedProduct) {
      return noStoreJson({ success: false, message: "허용되지 않은 RevenueCat 상품입니다." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return noStoreJson({ success: false, message: "Supabase service role 설정이 필요합니다." }, { status: 503 });
    }

    const { data, error } = await admin.rpc("revoke_publish_credit", {
      p_raw_event: event,
      p_revoked_at: new Date().toISOString(),
      p_transaction_id: transactionId
    });

    if (error) {
      return noStoreJson({ success: false, message: "발행권 회수에 실패했습니다." }, { status: 500 });
    }

    return noStoreJson({ success: true, revokedQuantity: data ?? 0 });
  }

  return noStoreJson({ success: true, ignored: true });
}
