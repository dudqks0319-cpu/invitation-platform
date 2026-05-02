import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts/verify-goal-completion.mjs");

const evidenceKeys = [
  "appStoreConnectBuild38Processed",
  "build38ExportComplianceSaved",
  "build38AssignedToInternalGroup",
  "realIphoneTestFlightInstallLaunchPassed",
  "appInfoSaved",
  "versionMetadataSaved",
  "build38SelectedForVersion",
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
      "Fast release gate recheck on 2026-05-02 14:56 KST",
      "55-file web/API test suite with 160 tests",
      "36-check App Store packet verifier",
      "The full active goal is not complete yet"
    ].join("\n")
  );

  writeFileSync(
    join(root, "docs/app-store-connect-build38-packet.md"),
    [
      "EAS submission status | `FINISHED`, `error: null`",
      "Latest EAS status recheck | `2026-05-02 14:47 KST`",
      "do not use it as the App Review contact",
      "submit only after the user explicitly confirms"
    ].join("\n")
  );

  writeFileSync(
    join(root, "docs/security-gate-90.md"),
    [
      "55-file web/API test suite with 160 tests",
      "36-check App Store packet verifier",
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
        appStoreConnectBuild38Processed: true
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
