import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const previewSource = readFileSync(join(process.cwd(), "apps/mobile/app/builder/preview.tsx"), "utf8");

describe("paid publish preview gate", () => {
  it("does not load the store purchase card when paid publishing is disabled", () => {
    expect(previewSource).toContain("if (!paidPublishingEnabled)");
    expect(previewSource).toContain("setStorePurchaseCard(null)");
    expect(previewSource).toContain('import("@/components/payments/StorePurchaseCard")');
  });

  it("includes capped photos in the free release without opening the paid purchase path", () => {
    expect(previewSource).toContain("사진 포함 무료 발행");
    expect(previewSource).toContain("현재 무료 버전에 포함됩니다.");
    expect(previewSource).not.toContain("사진 발행 미지원");
    expect(previewSource).not.toContain("사진 없는 공개 링크 발행만 제공합니다.");
    expect(previewSource).not.toContain("App Store 상품 준비 후 다시 활성화합니다.");
  });

  it("requires a full account and publish readiness before purchase", () => {
    expect(previewSource).toContain("accessToken={canUsePaidAccount ? session?.access_token : \"\"}");
    expect(previewSource).toContain("userId={canUsePaidAccount ? user?.id : \"\"}");
    expect(previewSource).toContain("paidPublishBlockReason");
    expect(previewSource).toContain("!publishReadiness.canPublish");
    expect(previewSource).toContain("ensureDraftForPurchase");
  });
});
