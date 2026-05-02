#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const evidencePath = "docs/app-store-external-evidence.json";

const requiredExternalEvidence = [
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

const requiredLocalClaims = [
  {
    file: "docs/goal-completion-audit-90.md",
    snippets: [
      "Fast release gate recheck on 2026-05-02 14:56 KST",
      "55-file web/API test suite with 160 tests",
      "36-check App Store packet verifier",
      "The full active goal is not complete yet"
    ]
  },
  {
    file: "docs/app-store-connect-build38-packet.md",
    snippets: [
      "EAS submission status | `FINISHED`, `error: null`",
      "Latest EAS status recheck | `2026-05-02 14:47 KST`",
      "do not use it as the App Review contact",
      "submit only after the user explicitly confirms"
    ]
  },
  {
    file: "docs/security-gate-90.md",
    snippets: [
      "55-file web/API test suite with 160 tests",
      "36-check App Store packet verifier",
      "NEXT_PUBLIC_SUPPORT_EMAIL"
    ]
  }
];

const failures = [];
const blockers = [];

function read(relativePath) {
  const path = join(root, relativePath);

  if (!existsSync(path)) {
    failures.push(`${relativePath}: missing file`);
    return "";
  }

  return readFileSync(path, "utf8");
}

for (const { file, snippets } of requiredLocalClaims) {
  const content = read(file);

  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      failures.push(`${file}: missing local evidence snippet: ${snippet}`);
    }
  }
}

if (!existsSync(join(root, evidencePath))) {
  blockers.push(`${evidencePath}: missing external App Store Connect/TestFlight evidence manifest`);
} else {
  let evidence;

  try {
    evidence = JSON.parse(read(evidencePath));
  } catch (error) {
    failures.push(`${evidencePath}: invalid JSON (${error instanceof Error ? error.message : "unknown error"})`);
  }

  if (evidence) {
    for (const key of requiredExternalEvidence) {
      if (evidence[key] !== true) {
        blockers.push(`${evidencePath}: ${key} is not true`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("GOAL COMPLETION VERIFY RESULT");
  console.error("- Status: fail");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (blockers.length > 0) {
  console.log("GOAL COMPLETION VERIFY RESULT");
  console.log("- Status: blocked");
  console.log("- Local Gates: pass");
  console.log("- Missing External Evidence:");
  for (const blocker of blockers) {
    console.log(`  - ${blocker}`);
  }
  console.log("- Next Action: capture App Store Connect build 38, TestFlight iPhone, metadata, privacy, screenshot, review-note, and contact save evidence.");
  process.exit(2);
}

console.log("GOAL COMPLETION VERIFY RESULT");
console.log("- Status: pass");
console.log("- Local Gates: pass");
console.log("- External Evidence: pass");
