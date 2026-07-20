import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const mobileRoot = path.dirname(fileURLToPath(import.meta.url));

describe("iOS StoreKit configuration", () => {
  it("provides the local simulator product used by paid publishing", () => {
    const storeKitPath = path.join(mobileRoot, "ios/InviteHub/InviteHub.storekit");
    const storeKit = JSON.parse(readFileSync(storeKitPath, "utf8")) as {
      products?: Array<{ productID?: string; type?: string }>;
    };

    expect(storeKit.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productID: "com.invitehub.publish.credit",
          type: "Consumable"
        })
      ])
    );
  });

  it("loads the StoreKit configuration when the iOS scheme runs in Debug", () => {
    const schemePath = path.join(mobileRoot, "ios/InviteHub.xcodeproj/xcshareddata/xcschemes/InviteHub.xcscheme");
    const scheme = readFileSync(schemePath, "utf8");

    expect(scheme).toContain('storeKitConfigurationFileReference = "container:InviteHub/InviteHub.storekit"');
  });
});
