import { randomBytes } from "node:crypto";

export function generateApproveNonce() {
  return randomBytes(32).toString("hex");
}

export function isValidNonceFormat(nonce: string) {
  return /^[a-f0-9]{64}$/.test(nonce);
}

export function isNonceExpired(paymentCreatedAt: string, maxAgeMs = 30 * 60 * 1000) {
  const createdAt = new Date(paymentCreatedAt).getTime();

  if (Number.isNaN(createdAt)) {
    return true;
  }

  return Date.now() - createdAt > maxAgeMs;
}
