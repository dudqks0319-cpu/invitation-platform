import { INVITATION_CURRENCY, INVITATION_ITEM_NAME } from "@/lib/payments/constants";
import type { InvitationDraftPayload } from "@/lib/invitation-payload";
import { getInvitationPricing } from "@/lib/payments/pricing";

const KAKAOPAY_BASE_URL = "https://open-api.kakaopay.com/online/v1/payment";

function requireKakaoConfig() {
  const cid = process.env.KAKAOPAY_CID ?? "";
  const secretKey = process.env.KAKAOPAY_SECRET_KEY ?? "";

  if (!cid || !secretKey) {
    throw new Error("KakaoPay server configuration is incomplete.");
  }

  return { cid, secretKey };
}

async function requestKakaoPay<T>(path: string, payload: Record<string, unknown>) {
  const { secretKey } = requireKakaoConfig();

  const response = await fetch(`${KAKAOPAY_BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `SECRET_KEY ${secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const text = await response.text();
  let data: Record<string, unknown> | null = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    throw new Error(
      (typeof data?.msg === "string" && data.msg) ||
      (typeof data?.message === "string" && data.message) ||
      "KakaoPay request failed."
    );
  }

  return data as T;
}

export function getCheckoutPrice(payload?: InvitationDraftPayload) {
  const pricing = payload ? getInvitationPricing(payload) : { amount: 0 };

  return {
    amount: pricing.amount,
    currency: INVITATION_CURRENCY,
    itemName: INVITATION_ITEM_NAME
  };
}

export async function requestKakaoPayReady(input: {
  orderId: string;
  userId: string;
  amount: number;
  itemName?: string;
  approvalUrl: string;
  cancelUrl: string;
  failUrl: string;
}) {
  const { cid } = requireKakaoConfig();

  return requestKakaoPay<{
    tid: string;
    next_redirect_pc_url?: string;
    next_redirect_mobile_url?: string;
    next_redirect_app_url?: string;
    created_at?: string;
  }>("ready", {
    cid,
    partner_order_id: input.orderId,
    partner_user_id: input.userId,
    item_name: input.itemName || INVITATION_ITEM_NAME,
    quantity: 1,
    total_amount: input.amount,
    tax_free_amount: 0,
    approval_url: input.approvalUrl,
    cancel_url: input.cancelUrl,
    fail_url: input.failUrl
  });
}

export async function requestKakaoPayApprove(input: {
  orderId: string;
  userId: string;
  tid: string;
  pgToken: string;
}) {
  const { cid } = requireKakaoConfig();

  return requestKakaoPay<{
    aid?: string;
    tid: string;
    amount?: { total?: number };
    approved_at?: string;
  }>("approve", {
    cid,
    tid: input.tid,
    partner_order_id: input.orderId,
    partner_user_id: input.userId,
    pg_token: input.pgToken
  });
}

export async function requestKakaoPayCancel(input: {
  tid: string;
  cancelAmount: number;
  cancelTaxFreeAmount?: number;
}) {
  const { cid } = requireKakaoConfig();

  return requestKakaoPay<{
    tid: string;
    canceled_at?: string;
  }>("cancel", {
    cid,
    tid: input.tid,
    cancel_amount: input.cancelAmount,
    cancel_tax_free_amount: input.cancelTaxFreeAmount ?? 0
  });
}
