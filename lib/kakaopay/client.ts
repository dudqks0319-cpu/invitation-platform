import { env, isKakaoPayEnabled } from "@/lib/env";

const KAKAOPAY_BASE_URL = "https://open-api.kakaopay.com/online/v1/payment";

type ReadyPayload = {
  partner_order_id: string;
  partner_user_id: string;
  item_name: string;
  quantity: number;
  total_amount: number;
  tax_free_amount: number;
  approval_url: string;
  cancel_url: string;
  fail_url: string;
};

type ApprovePayload = {
  tid: string;
  partner_order_id: string;
  partner_user_id: string;
  pg_token: string;
};

type CancelPayload = {
  tid: string;
  cancel_amount: number;
  cancel_tax_free_amount: number;
  cancel_reason?: string;
};

async function kakaoPayFetch<T>(path: string, body: object) {
  if (!isKakaoPayEnabled()) {
    throw new Error("카카오페이 환경 변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${KAKAOPAY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `SECRET_KEY ${env.kakaoPaySecretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cid: env.kakaoPayCid,
      ...body
    })
  });

  const json = (await response.json().catch(() => ({}))) as T & { code?: string; msg?: string };

  if (!response.ok) {
    throw new Error(json?.msg || "카카오페이 API 호출에 실패했습니다.");
  }

  return json;
}

export async function requestKakaoPayReady(payload: ReadyPayload) {
  return kakaoPayFetch<{
    tid: string;
    next_redirect_app_url?: string;
    next_redirect_mobile_url?: string;
    next_redirect_pc_url?: string;
    android_app_scheme?: string;
    ios_app_scheme?: string;
    created_at?: string;
  }>("/ready", payload);
}

export async function requestKakaoPayApprove(payload: ApprovePayload) {
  return kakaoPayFetch<{
    aid?: string;
    tid: string;
    approved_at?: string;
    amount?: {
      total?: number;
    };
  }>("/approve", payload);
}

export async function requestKakaoPayCancel(payload: CancelPayload) {
  return kakaoPayFetch<{
    aid?: string;
    tid: string;
    canceled_at?: string;
  }>("/cancel", payload);
}
