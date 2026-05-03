import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts/record-app-store-evidence.mjs");

function makeTempProject() {
  const root = mkdtempSync(join(tmpdir(), "invitehub-record-evidence-"));
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "docs/app-store-external-evidence.template.json"), "{}\n");
  return root;
}

function runRecorder(root: string, args: string[]) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: process.env.PATH ?? ""
    }
  });
}

function withTempProject(testFn: (root: string) => void) {
  const root = makeTempProject();

  try {
    testFn(root);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

describe("record-app-store-evidence", () => {
  it("lists the supported evidence keys", () => {
    withTempProject((root) => {
      const result = runRecorder(root, ["--list"]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("APP STORE EXTERNAL EVIDENCE KEYS");
      expect(result.stdout).toContain("appStoreConnectBuild40Processed");
      expect(result.stdout).toContain("iapStateVerifiedOrPaidFeaturesDisabled");
    });
  });

  it("records a structured evidence item into the ignored manifest path", () => {
    withTempProject((root) => {
      const result = runRecorder(root, [
        "--key",
        "appStoreConnectBuild40Processed",
        "--capturedAt",
        "2026-05-02T15:30:00+09:00",
        "--evidence",
        "App Store Connect TestFlight shows 1.0.0 (40) processed.",
        "--artifact",
        "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
      ]);

      const evidencePath = join(root, "docs/app-store-external-evidence.json");
      const manifest = JSON.parse(readFileSync(evidencePath, "utf8"));

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Status: pass");
      expect(existsSync(evidencePath)).toBe(true);
      expect(manifest.appStoreConnectBuild40Processed).toEqual({
        status: true,
        capturedAt: "2026-05-02T15:30:00+09:00",
        evidence: "App Store Connect TestFlight shows 1.0.0 (40) processed.",
        artifact: "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
      });
    });
  });

  it("refuses unknown keys and invalid artifacts", () => {
    withTempProject((root) => {
      const unknownKey = runRecorder(root, [
        "--key",
        "notARealKey",
        "--evidence",
        "Something was verified.",
        "--artifact",
        "https://appstoreconnect.apple.com"
      ]);

      const invalidArtifact = runRecorder(root, [
        "--key",
        "screenshotsUploaded",
        "--capturedAt",
        "2026-05-02T15:30:00+09:00",
        "--evidence",
        "Screenshots were uploaded to App Store Connect.",
        "--artifact",
        "uploaded in App Store Connect"
      ]);

      expect(unknownKey.status).toBe(1);
      expect(unknownKey.stderr).toContain("Unknown or missing --key");
      expect(invalidArtifact.status).toBe(1);
      expect(invalidArtifact.stderr).toContain("screenshotsUploaded.artifact must be");
    });
  });
});
