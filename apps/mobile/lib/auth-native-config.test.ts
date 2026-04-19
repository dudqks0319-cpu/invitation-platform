import { describe, expect, it } from "vitest";
import { isNativeGoogleConfigured, isNativeKakaoConfigured, nativeAuthConfig } from "./auth-native-config";

describe("auth-native-config", () => {
  it("exposes string defaults", () => {
    expect(typeof nativeAuthConfig.googleWebClientId).toBe("string");
    expect(typeof nativeAuthConfig.googleIosClientId).toBe("string");
    expect(typeof nativeAuthConfig.googleIosUrlScheme).toBe("string");
    expect(typeof nativeAuthConfig.kakaoNativeAppKey).toBe("string");
  });

  it("returns booleans for native provider readiness", () => {
    expect(typeof isNativeGoogleConfigured()).toBe("boolean");
    expect(typeof isNativeKakaoConfigured()).toBe("boolean");
  });
});
