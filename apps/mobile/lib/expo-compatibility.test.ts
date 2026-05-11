import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type LockPackage = {
  dependencies?: Record<string, string>;
  version?: string;
};

type PackageLock = {
  packages: Record<string, LockPackage>;
};

function readPackageLock() {
  return JSON.parse(readFileSync("package-lock.json", "utf8")) as PackageLock;
}

describe("Expo SDK compatibility", () => {
  it("pins the mobile app to the latest resolved Expo 55 patch instead of accepting audit downgrade fixes", () => {
    const lock = readPackageLock();
    const mobilePackage = lock.packages["apps/mobile"];
    const resolvedExpo = lock.packages["node_modules/expo"];
    const metroConfig = lock.packages["node_modules/@expo/metro-config"];

    expect(mobilePackage.dependencies?.expo).toBe("~55.0.23");
    expect(resolvedExpo.version).toBe("55.0.23");
    expect(metroConfig.version?.startsWith("55.")).toBe(true);
  });
});
