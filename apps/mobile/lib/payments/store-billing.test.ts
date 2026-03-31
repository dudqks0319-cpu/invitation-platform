import { describe, expect, it } from "vitest";
import { getStoreBillingNotice, getStoreBillingProvider } from "./store-billing";

describe("store billing helpers", () => {
  it("maps iOS to Apple IAP", () => {
    expect(getStoreBillingProvider("ios")).toBe("apple_iap");
    expect(getStoreBillingNotice("ios")).toContain("Apple");
  });

  it("maps Android to Google Play", () => {
    expect(getStoreBillingProvider("android")).toBe("google_play");
    expect(getStoreBillingNotice("android")).toContain("Google Play");
  });

  it("returns null for unsupported platforms", () => {
    expect(getStoreBillingProvider("web")).toBeNull();
  });
});
