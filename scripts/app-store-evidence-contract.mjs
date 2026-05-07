import { existsSync } from "node:fs";
import { isAbsolute, join } from "node:path";

export const requiredExternalEvidence = [
  { key: "appStoreConnectBuild42Processed", label: "App Store Connect shows build 1.0.0 (42) processed/available" },
  { key: "build42ExportComplianceSaved", label: "Build 42 export compliance is saved if prompted" },
  { key: "build42AssignedToInternalGroup", label: "Build 42 is assigned to Team (Expo)" },
  { key: "realIphoneTestFlightInstallLaunchPassed", label: "A real iPhone TestFlight install and launch smoke test passed" },
  { key: "appInfoSaved", label: "App Information fields are saved" },
  { key: "versionMetadataSaved", label: "Version metadata fields are saved" },
  { key: "build42SelectedForVersion", label: "Build 42 is selected for the App Store version" },
  { key: "privacyLabelsSaved", label: "App Privacy labels are saved" },
  { key: "screenshotsUploaded", label: "Required screenshots are uploaded" },
  { key: "reviewNotesSaved", label: "Review Notes are saved" },
  { key: "verifiedAppReviewContactSaved", label: "Verified App Review contact is saved" },
  { key: "iapStateVerifiedOrPaidFeaturesDisabled", label: "IAP state is verified or paid features are disabled" }
];

const appleConsoleEvidenceKeys = new Set([
  "appStoreConnectBuild42Processed",
  "build42ExportComplianceSaved",
  "build42AssignedToInternalGroup",
  "appInfoSaved",
  "versionMetadataSaved",
  "build42SelectedForVersion",
  "privacyLabelsSaved",
  "screenshotsUploaded",
  "reviewNotesSaved",
  "verifiedAppReviewContactSaved"
]);

export function createEmptyEvidenceManifest() {
  return Object.fromEntries(
    requiredExternalEvidence.map(({ key, label }) => [
      key,
      {
        status: false,
        capturedAt: "",
        evidence: label,
        artifact: ""
      }
    ])
  );
}

export function isKnownEvidenceKey(key) {
  return requiredExternalEvidence.some((item) => item.key === key);
}

export function hasMeaningfulText(value) {
  return typeof value === "string" && value.trim().length >= 8;
}

export function hasCapturedAt(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value.trim());
}

export function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function isExistingLocalPath(value, root) {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (!trimmed) {
    return false;
  }

  const path = isAbsolute(trimmed) ? trimmed : join(root, trimmed);
  return existsSync(path);
}

export function isUserConfirmationRef(value) {
  return typeof value === "string" && value.trim().startsWith("user-confirmation:") && value.trim().length >= 32;
}

export function hasValidArtifact(value, root) {
  return (
    typeof value === "string" &&
    (isHttpUrl(value.trim()) || isExistingLocalPath(value, root) || isUserConfirmationRef(value))
  );
}

export function hasValidArtifactForKey({ key, value, root }) {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (appleConsoleEvidenceKeys.has(key)) {
    return isHttpUrl(trimmed) || isUserConfirmationRef(trimmed);
  }

  return hasValidArtifact(trimmed, root);
}

export function artifactRequirementForKey(key) {
  if (appleConsoleEvidenceKeys.has(key)) {
    return "an App Store Connect/TestFlight http(s) URL or user-confirmation: reference";
  }

  return "an http(s) URL, existing local file path, or user-confirmation: reference";
}

export function validateEvidenceEntry({ entry, evidencePath, key, label, root }) {
  const blockers = [];

  if (entry === true) {
    blockers.push(`${evidencePath}: ${key} uses legacy boolean true; add capturedAt, evidence, and artifact`);
    return blockers;
  }

  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    blockers.push(`${evidencePath}: ${key} is missing object evidence for ${label}`);
    return blockers;
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

  if (!hasValidArtifactForKey({ key, value: entry.artifact, root })) {
    blockers.push(`${evidencePath}: ${key}.artifact must be ${artifactRequirementForKey(key)}`);
  }

  return blockers;
}
