import {
  generateApproveNonce,
  isNonceExpired,
  isValidNonceFormat
} from "@/lib/payments/nonce";

describe("payment approve nonce helpers", () => {
  it("creates a 64 character hex nonce", () => {
    const nonce = generateApproveNonce();

    expect(nonce).toMatch(/^[a-f0-9]{64}$/);
    expect(isValidNonceFormat(nonce)).toBe(true);
  });

  it("detects invalid nonce formats", () => {
    expect(isValidNonceFormat("abc")).toBe(false);
    expect(isValidNonceFormat("g".repeat(64))).toBe(false);
  });

  it("expires nonces older than the allowed age", () => {
    const now = Date.now();
    const recent = new Date(now - 5 * 60 * 1000).toISOString();
    const stale = new Date(now - 31 * 60 * 1000).toISOString();

    expect(isNonceExpired(recent)).toBe(false);
    expect(isNonceExpired(stale)).toBe(true);
  });
});
