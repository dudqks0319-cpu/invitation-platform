import { createPrivateKey, createSign } from "crypto";
import { env } from "@/lib/env";

type AppleEnvironment = "sandbox" | "production";

type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  bundleId?: string;
  environment?: string;
  [key: string]: unknown;
};

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function parseApplePrivateKey(raw: string) {
  return raw.replace(/\\n/g, "\n");
}

export function createAppleStoreServerJwt(now = Math.floor(Date.now() / 1000)) {
  const header = {
    alg: "ES256",
    kid: env.appleAppStoreKeyId,
    typ: "JWT"
  };

  const payload = {
    iss: env.appleAppStoreIssuerId,
    iat: now,
    exp: now + 300,
    aud: "appstoreconnect-v1",
    bid: env.appleBundleId
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signer = createSign("SHA256");
  signer.update(`${encodedHeader}.${encodedPayload}`);
  signer.end();

  const signature = signer.sign({
    key: createPrivateKey(parseApplePrivateKey(env.appleAppStorePrivateKey)),
    dsaEncoding: "ieee-p1363"
  });

  return `${encodedHeader}.${encodedPayload}.${toBase64Url(signature)}`;
}

export function decodeAppleSignedPayload(signedPayload: string): AppleTransactionPayload {
  const [, payload] = signedPayload.split(".");

  if (!payload) {
    throw new Error("Apple signed transaction payload 형식이 잘못되었습니다.");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return JSON.parse(Buffer.from(`${normalized}${padding}`, "base64").toString("utf8")) as AppleTransactionPayload;
}

async function requestAppleTransaction(transactionId: string, environment: AppleEnvironment) {
  const token = createAppleStoreServerJwt();
  const baseUrl =
    environment === "sandbox"
      ? "https://api.storekit-sandbox.itunes.apple.com"
      : "https://api.storekit.itunes.apple.com";

  const response = await fetch(`${baseUrl}/inApps/v1/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  const json = (await response.json().catch(() => ({}))) as {
    signedTransactionInfo?: string;
    errorMessage?: string;
  };

  return {
    ok: response.ok,
    status: response.status,
    json
  };
}

export async function verifyAppleTransaction(options: {
  transactionId: string;
  productId: string;
  environment?: AppleEnvironment;
}) {
  const attempts = options.environment ? [options.environment] : (["sandbox", "production"] as AppleEnvironment[]);
  let lastError = "Apple transaction 조회에 실패했습니다.";

  for (const environment of attempts) {
    const result = await requestAppleTransaction(options.transactionId, environment);

    if (!result.ok) {
      lastError = result.json.errorMessage || `Apple transaction 조회 실패 (${result.status})`;
      continue;
    }

    if (!result.json.signedTransactionInfo) {
      lastError = "Apple transaction 응답에 signedTransactionInfo가 없습니다.";
      continue;
    }

    const payload = decodeAppleSignedPayload(result.json.signedTransactionInfo);

    if (payload.productId !== options.productId) {
      throw new Error("Apple transaction의 상품 ID가 요청과 일치하지 않습니다.");
    }

    if (payload.bundleId !== env.appleBundleId) {
      throw new Error("Apple transaction의 bundle id가 서버 설정과 일치하지 않습니다.");
    }

    return {
      environment,
      productId: payload.productId ?? options.productId,
      transactionId: String(payload.transactionId ?? options.transactionId),
      originalTransactionId: payload.originalTransactionId ? String(payload.originalTransactionId) : null,
      bundleId: String(payload.bundleId ?? env.appleBundleId),
      payload
    };
  }

  throw new Error(lastError);
}
