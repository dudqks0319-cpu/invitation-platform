import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts/verify-goal-completion.mjs");

const evidenceKeys = [
  "appStoreConnectBuild40Processed",
  "build40ExportComplianceSaved",
  "build40AssignedToInternalGroup",
  "realIphoneTestFlightInstallLaunchPassed",
  "appInfoSaved",
  "versionMetadataSaved",
  "build40SelectedForVersion",
  "privacyLabelsSaved",
  "screenshotsUploaded",
  "reviewNotesSaved",
  "verifiedAppReviewContactSaved",
  "iapStateVerifiedOrPaidFeaturesDisabled"
];

function makeTempProject() {
  const root = mkdtempSync(join(tmpdir(), "invitehub-goal-verify-"));
  mkdirSync(join(root, "docs"), { recursive: true });

  writeFileSync(
    join(root, "docs/goal-completion-audit-90.md"),
    [
      "Fast release gate recheck on 2026-05-03 13:24 KST",
      "Concrete Success Criteria",
      "Prompt-to-Artifact Checklist",
      "58-file web/API test suite with 177 tests",
      "54-check App Store packet verifier",
      "Build 40 local submission screenshot candidate"
    ].join("\n")
  );

  writeFileSync(
    join(root, "docs/app-store-connect-build40-packet.md"),
    [
      "EAS submission status | `FINISHED`, `error: null`",
      "Latest EAS status recheck | `2026-05-03 12:28 KST`",
      "do not use it as the App Review contact",
      "submit only after the user explicitly confirms"
    ].join("\n")
  );

  writeFileSync(
    join(root, "docs/security-gate-90.md"),
    [
      "58-file web/API test suite with 177 tests",
      "54-check App Store packet verifier",
      "NEXT_PUBLIC_SUPPORT_EMAIL"
    ].join("\n")
  );

  return root;
}

function makeCompleteEvidence(overrides: Record<string, unknown> = {}) {
  return Object.fromEntries(
    evidenceKeys.map((key) => [
      key,
      {
        status: true,
        capturedAt: "2026-05-02T15:10:00+09:00",
        evidence: `Verified ${key} in App Store Connect or TestFlight.`,
        artifact: "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios",
        ...(typeof overrides[key] === "object" && overrides[key] !== null ? overrides[key] : {})
      }
    ])
  );
}

function writeEvidence(root: string, evidence: unknown) {
  writeFileSync(join(root, "docs/app-store-external-evidence.json"), JSON.stringify(evidence, null, 2));
}

function runVerifier(root: string) {
  return spawnSync(process.execPath, [scriptPath], {
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

describe("verify-goal-completion", () => {
  it("blocks when the external evidence manifest is missing", () => {
    withTempProject((root) => {
      const result = runVerifier(root);

      expect(result.status).toBe(2);
      expect(result.stdout).toContain("Status: blocked");
      expect(result.stdout).toContain("missing external App Store Connect/TestFlight evidence manifest");
    });
  });

  it("blocks legacy boolean evidence even when set to true", () => {
    withTempProject((root) => {
      writeEvidence(root, {
        ...makeCompleteEvidence(),
        appStoreConnectBuild39Processed: true
      });

      const result = runVerifier(root);

      expect(result.status).toBe(2);
      expect(result.stdout).toContain("uses legacy boolean true");
    });
  });

  it("blocks artifacts that are not URLs, existing files, or user confirmations", () => {
    withTempProject((root) => {
      writeEvidence(
        root,
        makeCompleteEvidence({
          screenshotsUploaded: { artifact: "uploaded in App Store Connect" }
        })
      );

      const result = runVerifier(root);

      expect(result.status).toBe(2);
      expect(result.stdout).toContain("screenshotsUploaded.artifact must be");
    });
  });

  it("blocks local file artifacts for App Store Connect saved/uploaded evidence", () => {
    withTempProject((root) => {
      const localProof = join(root, "local-screenshot.png");
      writeFileSync(localProof, "not a real screenshot, only a path existence fixture");
      writeEvidence(
        root,
        makeCompleteEvidence({
          screenshotsUploaded: { artifact: localProof }
        })
      );

      const result = runVerifier(root);

      expect(result.status).toBe(2);
      expect(result.stdout).toContain(
        "screenshotsUploaded.artifact must be an App Store Connect/TestFlight http(s) URL or user-confirmation: reference"
      );
    });
  });

  it("passes only when local claims and every structured evidence item are present", () => {
    withTempProject((root) => {
      writeEvidence(root, makeCompleteEvidence());

      const result = runVerifier(root);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Status: pass");
      expect(result.stdout).toContain("External Evidence: pass");
    });
  });
});
