import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const GUEST_OWNER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,160}$/;
const TOKEN_HASH_PATTERN = /^[a-f0-9]{64}$/i;

export function createGuestOwnerToken() {
  return randomBytes(32).toString("base64url");
}

export function hashGuestOwnerToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isGuestOwnerTokenFormat(value: string) {
  return GUEST_OWNER_TOKEN_PATTERN.test(value);
}

export function verifyGuestOwnerToken(token: string, expectedHash?: string | null) {
  if (!expectedHash || !isGuestOwnerTokenFormat(token) || !TOKEN_HASH_PATTERN.test(expectedHash)) {
    return false;
  }

  const actual = Buffer.from(hashGuestOwnerToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
