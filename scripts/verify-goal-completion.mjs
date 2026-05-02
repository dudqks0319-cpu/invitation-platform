#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

const root = process.cwd();
const evidencePath = "docs/app-store-external-evidence.json";

const requiredExternalEvidence = [
  { key: "appStoreConnectBuild38Processed", label: "App Store Connect shows build 1.0.0 (38) processed/available" },
  { key: "build38ExportComplianceSaved", label: "Build 38 export compliance is saved if prompted" },
  { key: "build38AssignedToInternalGroup", label: "Build 38 is assigned to TE Team (Expo)" },
  { key: "realIphoneTestFlightInstallLaunchPassed", label: "A real iPhone TestFlight install and launch smoke test passed" },
  { key: "appInfoSaved", label: "App Information fields are saved" },
  { key: "versionMetadataSaved", label: "Version metadata fields are saved" },
  { key: "build38SelectedForVersion", label: "Build 38 is selected for the App Store version" },
  { key: "privacyLabelsSaved", label: "App Privacy labels are saved" },
  { key: "screenshotsUploaded", label: "Required screenshots are uploaded" },
  { key: "reviewNotesSaved", label: "Review Notes are saved" },
  { key: "verifiedAppReviewContactSaved", label: "Verified App Review contact is saved" },
  { key: "iapStateVerifiedOrPaidFeaturesDisabled", label: "IAP state is verified or paid features are disabled" }
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

function hasMeaningfulText(value) {
  return typeof value === "string" && value.trim().length >= 8;
}

function hasCapturedAt(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim());
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isExistingLocalPath(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  const path = isAbsolute(trimmed) ? trimmed : join(root, trimmed);
  return existsSync(path);
}

function isUserConfirmationRef(value) {
  return value.trim().startsWith("user-confirmation:") && value.trim().length >= 32;
}

function hasValidArtifact(value) {
  return (
    typeof value === "string" &&
    (isHttpUrl(value.trim()) || isExistingLocalPath(value) || isUserConfirmationRef(value))
  );
}

function validateEvidenceEntry(evidence, key, label) {
  const entry = evidence[key];

  if (entry === true) {
    blockers.push(`${evidencePath}: ${key} uses legacy boolean true; add capturedAt, evidence, and artifact`);
    return;
  }

  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    blockers.push(`${evidencePath}: ${key} is missing object evidence for ${label}`);
    return;
  }

  if (entry.status !== true) {
    blockers.push(`${evidencePath}: ${key}.status is not true`);
  }

  if (!hasCapturedAt(entry.capturedAt)) {
    blockers.push(`${evidencePath}: ${key}.capturedAt must start with YYYY-MM-DD`);
  }

  if (!hasMeaningfulText(entry.evidence)) {
    blockers.push(`${evidencePath}: ${key}.evidence is missing`);
  }

  if (!hasValidArtifact(entry.artifact)) {
    blockers.push(`${evidencePath}: ${key}.artifact must be an http(s) URL, existing local file path, or user-confirmation: reference`);
  }
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
    for (const { key, label } of requiredExternalEvidence) {
      validateEvidenceEntry(evidence, key, label);
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
