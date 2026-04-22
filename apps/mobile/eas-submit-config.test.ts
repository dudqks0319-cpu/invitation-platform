import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const mobileDir = path.dirname(fileURLToPath(import.meta.url));
const iosProject = readFileSync(
  path.join(mobileDir, "ios/InviteHub.xcodeproj/project.pbxproj"),
  "utf8"
);
const iosInfoPlist = readFileSync(
  path.join(mobileDir, "ios/InviteHub/Info.plist"),
  "utf8"
);
const easConfig = JSON.parse(
  readFileSync(path.join(mobileDir, "eas.json"), "utf8")
) as {
  build: {
    production: {
      env: {
        APP_BUNDLE_ID: string;
      };
    };
    testflight: {
      env: {
        APP_BUNDLE_ID: string;
      };
      ios: {
        buildConfiguration: string;
      };
    };
  };
  submit: {
    production: {
      ios?: {
        ascAppId?: string;
      };
    };
    testflight: {
      ios: {
        ascAppId: string;
      };
    };
  };
};

describe("EAS submit config", () => {
  it("does not pin production submissions to known mismatched App Store Connect apps", () => {
    const productionBundleId = easConfig.build.production.env.APP_BUNDLE_ID;
    const productionAscAppId = easConfig.submit.production.ios?.ascAppId;
    const knownMismatchedAscAppIds = {
      "6761149001": "InviteHub dev app, com.invitehub.app.dev",
      "6762567054": "jipbab-note app, com.jipbab.note"
    };

    expect(productionBundleId).toBe("com.invitehub.app");
    expect(knownMismatchedAscAppIds).not.toHaveProperty(
      String(productionAscAppId)
    );
  });

  it("targets the existing InviteHub TestFlight app with a matching dev bundle", () => {
    expect(easConfig.build.testflight.env.APP_BUNDLE_ID).toBe(
      "com.invitehub.app.dev"
    );
    expect(easConfig.build.testflight.ios.buildConfiguration).toBe(
      "TestFlight"
    );
    expect(easConfig.submit.testflight.ios.ascAppId).toBe("6761149001");
  });

  it("lets EAS profiles drive the native iOS bundle identifier", () => {
    expect(iosProject).toContain("name = TestFlight;");
    expect(iosProject).toContain(
      "PRODUCT_BUNDLE_IDENTIFIER = com.invitehub.app;"
    );
    expect(iosProject).toContain(
      "PRODUCT_BUNDLE_IDENTIFIER = com.invitehub.app.dev;"
    );
    expect(iosInfoPlist).toContain(
      "<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>"
    );
  });
});
