import { createPrivateKey, createSign } from "crypto";
import { env } from "@/lib/env";

type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function parseServiceAccount(): GoogleServiceAccount {
  const parsed = JSON.parse(env.googlePlayServiceAccountJson) as GoogleServiceAccount;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Google Play 서비스 계정 JSON에 필수 필드가 없습니다.");
  }

  return {
    ...parsed,
    private_key: parsed.private_key.replace(/\\n/g, "\n")
  };
}

async function getGooglePlayAccessToken() {
  const serviceAccount = parseServiceAccount();
  const tokenUri = serviceAccount.token_uri || "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: tokenUri,
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${encodedHeader}.${encodedPayload}`);
  signer.end();
  const signature = signer.sign(createPrivateKey(serviceAccount.private_key));

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${encodedHeader}.${encodedPayload}.${toBase64Url(signature)}`
    }),
    cache: "no-store"
  });

  const json = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };

  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description || "Google Play access token 발급에 실패했습니다.");
  }

  return json.access_token;
}

export async function verifyGooglePlayPurchase(options: { productId: string; purchaseToken: string }) {
  const accessToken = await getGooglePlayAccessToken();
  const endpoint = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
    env.googlePlayPackageName
  )}/purchases/products/${encodeURIComponent(options.productId)}/tokens/${encodeURIComponent(options.purchaseToken)}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const json = (await response.json().catch(() => ({}))) as {
    purchaseState?: number;
    acknowledgementState?: number;
    consumptionState?: number;
    orderId?: string;
    purchaseToken?: string;
    productId?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(json.error?.message || "Google Play 결제 검증에 실패했습니다.");
  }

  if (json.productId !== options.productId) {
    throw new Error("Google Play 응답의 상품 ID가 요청과 일치하지 않습니다.");
  }

  if (json.purchaseToken !== options.purchaseToken) {
    throw new Error("Google Play 응답의 purchaseToken이 요청과 일치하지 않습니다.");
  }

  if (json.purchaseState !== 0) {
    throw new Error("Google Play 구매 상태가 완료 상태가 아닙니다.");
  }

  return {
    productId: json.productId ?? options.productId,
    purchaseToken: json.purchaseToken ?? options.purchaseToken,
    purchaseState: json.purchaseState,
    acknowledgementState: json.acknowledgementState ?? null,
    consumptionState: json.consumptionState ?? null,
    orderId: json.orderId ?? null,
    payload: json
  };
}
