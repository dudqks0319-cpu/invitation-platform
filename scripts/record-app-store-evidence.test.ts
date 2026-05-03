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
      expect(result.stdout).toContain("appStoreConnectBuild41Processed");
      expect(result.stdout).toContain("iapStateVerifiedOrPaidFeaturesDisabled");
    });
  });

  it("records a structured evidence item into the ignored manifest path", () => {
    withTempProject((root) => {
      const result = runRecorder(root, [
        "--key",
        "appStoreConnectBuild41Processed",
        "--capturedAt",
        "2026-05-02T15:30:00+09:00",
        "--evidence",
        "App Store Connect TestFlight shows 1.0.0 (41) processed.",
        "--artifact",
        "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
      ]);

      const evidencePath = join(root, "docs/app-store-external-evidence.json");
      const manifest = JSON.parse(readFileSync(evidencePath, "utf8"));

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Status: pass");
      expect(existsSync(evidencePath)).toBe(true);
      expect(manifest.appStoreConnectBuild41Processed).toEqual({
        status: true,
        capturedAt: "2026-05-02T15:30:00+09:00",
        evidence: "App Store Connect TestFlight shows 1.0.0 (41) processed.",
        artifact: "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
      });
    });
  });

  it("backfills missing required evidence keys in an existing manifest", () => {
    withTempProject((root) => {
      const evidencePath = join(root, "docs/app-store-external-evidence.json");
      writeFileSync(
        evidencePath,
        JSON.stringify({
          appStoreConnectBuild41Processed: {
            status: true,
            capturedAt: "2026-05-02T15:30:00+09:00",
            evidence: "App Store Connect TestFlight shows 1.0.0 (41) processed.",
            artifact: "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
          }
        })
      );

      const result = runRecorder(root, [
        "--key",
        "build41AssignedToInternalGroup",
        "--capturedAt",
        "2026-05-02T15:31:00+09:00",
        "--evidence",
        "Build 41 is assigned to Team (Expo).",
        "--artifact",
        "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
      ]);

      const manifest = JSON.parse(readFileSync(evidencePath, "utf8"));

      expect(result.status).toBe(0);
      expect(manifest.appStoreConnectBuild41Processed.status).toBe(true);
      expect(manifest.build41AssignedToInternalGroup.status).toBe(true);
      expect(manifest.build41SelectedForVersion).toEqual({
        status: false,
        capturedAt: "",
        evidence: "Build 41 is selected for the App Store version",
        artifact: ""
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

  it("refuses local paths for App Store Connect upload evidence", () => {
    withTempProject((root) => {
      const localProof = join(root, "local-screenshot.png");
      writeFileSync(localProof, "fixture");

      const result = runRecorder(root, [
        "--key",
        "screenshotsUploaded",
        "--capturedAt",
        "2026-05-02T15:30:00+09:00",
        "--evidence",
        "Screenshots were uploaded to App Store Connect.",
        "--artifact",
        localProof
      ]);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        "screenshotsUploaded.artifact must be an App Store Connect/TestFlight http(s) URL or user-confirmation: reference"
      );
    });
  });
});
