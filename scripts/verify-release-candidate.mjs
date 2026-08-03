#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), "..");
const EVIDENCE_PATH = "docs/release-candidate-evidence.json";
const STORE_BUNDLE_ID = "com.invitehub.app";
const BLOCKED_STALE_BUILD = "52";
const VALID_OPERATIONS = new Set(["build", "install", "upload"]);
const IDENTITY_ENVIRONMENT_KEYS = [
  "APP_VARIANT",
  "APP_BUNDLE_ID",
  "APP_ANDROID_PACKAGE",
  "EAS_BUILD_PROFILE",
  "EAS_NO_VCS"
];

function scalar(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed;
}

function parseTopLevelScalars(text) {
  const values = {};

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (match && match[2]?.trim()) {
      values[match[1]] = scalar(match[2]);
    }
  }

  return values;
}

function parseMappingSection(text, sectionName) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `${sectionName}:`);

  if (start < 0) return null;

  const values = {};
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(" ")) break;
    if (!line.trim()) continue;

    const match = line.match(/^  ([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (match && match[2]?.trim()) {
      values[match[1]] = scalar(match[2]);
    }
  }

  return values;
}

function same(left, right) {
  return String(left ?? "") === String(right ?? "");
}

function requireEqual(blockers, actual, expected, message) {
  if (!same(actual, expected)) blockers.push(message);
}

function isFullSha(value) {
  return typeof value === "string" && /^[a-f0-9]{40}$/i.test(value);
}

function hasApprovalReference(value) {
  return (
    typeof value === "string" &&
    value.startsWith("user-confirmation:") &&
    value.length >= 32
  );
}

export function validateReleaseCandidate({
  ledgerText,
  evidence,
  repository,
  operation,
  artifact
}) {
  const blockers = [];
  const ledger = parseTopLevelScalars(ledgerText);
  const publicState = parseMappingSection(ledgerText, "public") ?? {};
  const selected = parseMappingSection(ledgerText, "selected_candidate");

  if (!VALID_OPERATIONS.has(operation)) {
    return [`unsupported release operation: ${operation}`];
  }

  if (!selected) {
    blockers.push("release-ledger.yaml is missing selected_candidate");
    return blockers;
  }

  if (selected.selected !== true) {
    blockers.push("selected_candidate.selected must be true");
  }
  if (selected.source_state !== "clean_committed") {
    blockers.push("selected_candidate.source_state must be clean_committed");
  }
  if (!isFullSha(selected.git_sha)) {
    blockers.push("selected candidate git_sha must be a full 40-character commit SHA");
  }
  if (selected.evidence_path !== EVIDENCE_PATH) {
    blockers.push(`selected_candidate.evidence_path must be ${EVIDENCE_PATH}`);
  }
  if (selected.bundle_id !== STORE_BUNDLE_ID) {
    blockers.push(`selected bundle must equal the canonical Store bundle ${STORE_BUNDLE_ID}`);
  }
  if (String(selected.build_number ?? "") === BLOCKED_STALE_BUILD) {
    blockers.push(`native Build ${BLOCKED_STALE_BUILD} is a blocked stale build`);
  }
  if (same(selected.version, publicState.version)) {
    blockers.push("selected candidate version must differ from the public version");
  }

  requireEqual(blockers, ledger.version, selected.version, "ledger version does not match selected candidate");
  requireEqual(blockers, ledger.build_number, selected.build_number, "ledger build number does not match selected candidate");
  requireEqual(blockers, ledger.bundle_id, selected.bundle_id, "ledger bundle does not match selected candidate");
  requireEqual(blockers, ledger.git_sha, selected.git_sha, "ledger SHA does not match selected candidate");
  requireEqual(blockers, ledger.branch, selected.branch, "ledger branch does not match selected candidate");

  if (!evidence || typeof evidence !== "object") {
    blockers.push("selected candidate raw evidence is missing");
    return blockers;
  }

  if (evidence.schemaVersion !== 1) {
    blockers.push("raw evidence schemaVersion must be 1");
  }
  if (typeof evidence.capturedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(evidence.capturedAt)) {
    blockers.push("raw evidence capturedAt must be an ISO timestamp");
  }
  if (!hasApprovalReference(evidence.approvalReference)) {
    blockers.push("raw evidence approvalReference must contain explicit user confirmation");
  }

  const evidenceCandidate = evidence.selectedCandidate ?? {};
  const sourceEvidence = evidence.sourceEvidence ?? {};
  const evidenceNative = sourceEvidence.nativeIdentity ?? {};
  const liveNative = repository.nativeIdentity ?? {};

  for (const [evidenceKey, ledgerKey] of [
    ["version", "version"],
    ["buildNumber", "build_number"],
    ["bundleId", "bundle_id"],
    ["gitSha", "git_sha"],
    ["branch", "branch"],
    ["sourceState", "source_state"]
  ]) {
    requireEqual(
      blockers,
      evidenceCandidate[evidenceKey],
      selected[ledgerKey],
      `raw evidence ${evidenceKey} does not match selected candidate`
    );
  }

  requireEqual(blockers, repository.headSha, selected.git_sha, "HEAD SHA does not match the selected candidate");
  requireEqual(blockers, repository.branch, selected.branch, "current branch does not match the selected candidate");
  if (repository.statusPorcelain !== "") {
    blockers.push("release worktree is dirty");
  }
  if (Array.isArray(repository.identityEnvironmentOverrides) && repository.identityEnvironmentOverrides.length > 0) {
    blockers.push(
      `release identity environment overrides are forbidden: ${repository.identityEnvironmentOverrides.join(", ")}`
    );
  }
  requireEqual(blockers, sourceEvidence.headSha, selected.git_sha, "raw source HEAD does not match selected candidate");
  requireEqual(blockers, sourceEvidence.branch, selected.branch, "raw source branch does not match selected candidate");
  if (sourceEvidence.statusPorcelain !== "") {
    blockers.push("raw source evidence does not prove a clean worktree");
  }

  requireEqual(blockers, repository.appVersion, selected.version, "app.json version does not match the selected candidate");
  requireEqual(blockers, liveNative.version, selected.version, "native version does not match the selected candidate");
  requireEqual(blockers, liveNative.buildNumber, selected.build_number, "native build number does not match the selected candidate");
  requireEqual(blockers, liveNative.bundleId, selected.bundle_id, "native bundle does not match the selected candidate");
  requireEqual(blockers, evidenceNative.version, liveNative.version, "raw native version does not match live native identity");
  requireEqual(blockers, evidenceNative.buildNumber, liveNative.buildNumber, "raw native build does not match live native identity");
  requireEqual(blockers, evidenceNative.bundleId, liveNative.bundleId, "raw native bundle does not match live native identity");

  if (repository.eas?.appVersionSource !== "local") {
    blockers.push("EAS appVersionSource must be local for exact candidate binding");
  }
  if (repository.eas?.autoIncrement !== false) {
    blockers.push("EAS production autoIncrement must be false for exact candidate binding");
  }
  if (repository.eas?.distribution !== "store") {
    blockers.push("EAS production distribution must be store");
  }
  requireEqual(
    blockers,
    repository.eas?.productionBundleId,
    selected.bundle_id,
    "EAS production bundle does not match the selected candidate"
  );

  if (operation === "install" || operation === "upload") {
    if (!artifact || typeof artifact !== "object") {
      blockers.push(`${operation} requires a readable candidate artifact`);
      return blockers;
    }

    const evidenceArtifact = evidence.artifact ?? {};
    requireEqual(blockers, artifact.path, evidenceArtifact.path, "artifact path does not match raw evidence");
    requireEqual(blockers, artifact.sha256, evidenceArtifact.sha256, "artifact SHA-256 does not match raw evidence");
    requireEqual(blockers, artifact.version, evidenceArtifact.version, "artifact version does not match raw evidence");
    requireEqual(blockers, artifact.buildNumber, evidenceArtifact.buildNumber, "artifact build number does not match raw evidence");
    requireEqual(blockers, artifact.bundleId, evidenceArtifact.bundleId, "artifact bundle does not match raw evidence");
    requireEqual(blockers, evidenceArtifact.version, selected.version, "evidenced artifact version does not match selected candidate");
    requireEqual(blockers, evidenceArtifact.buildNumber, selected.build_number, "evidenced artifact build does not match selected candidate");
    requireEqual(blockers, evidenceArtifact.bundleId, selected.bundle_id, "evidenced artifact bundle does not match selected candidate");
    requireEqual(blockers, evidenceArtifact.gitSha, selected.git_sha, "evidenced artifact SHA provenance does not match selected candidate");
  }

  return [...new Set(blockers)];
}

function extractReleaseIdentity(projectText) {
  const releaseBlock = projectText.match(
    /\/\* Release \*\/ = \{[\s\S]*?buildSettings = \{([\s\S]*?)\n\s*\};\n\s*name = Release;/
  )?.[1];

  if (!releaseBlock) {
    throw new Error("could not locate the iOS Release build settings");
  }

  const readSetting = (name) =>
    releaseBlock.match(new RegExp(`\\b${name} = ([^;]+);`))?.[1]?.replace(/^"|"$/g, "").trim() ?? "";

  return {
    version: readSetting("MARKETING_VERSION"),
    buildNumber: readSetting("CURRENT_PROJECT_VERSION"),
    bundleId: readSetting("PRODUCT_BUNDLE_IDENTIFIER")
  };
}

function hashPath(path) {
  const hash = createHash("sha256");
  const stat = lstatSync(path);

  if (stat.isFile()) {
    hash.update(readFileSync(path));
    return hash.digest("hex");
  }
  if (!stat.isDirectory()) {
    throw new Error("artifact must be a regular file or directory");
  }

  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const entryPath = join(directory, entry.name);
      const relativePath = relative(path, entryPath);
      if (entry.isSymbolicLink()) throw new Error(`artifact contains symlink: ${relativePath}`);
      hash.update(relativePath);
      hash.update("\0");
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile()) hash.update(readFileSync(entryPath));
      else throw new Error(`artifact contains unsupported entry: ${relativePath}`);
      hash.update("\0");
    }
  };

  visit(path);
  return hash.digest("hex");
}

function plistIdentity(plistPath) {
  const read = (key) => execFileSync(
    "/usr/libexec/PlistBuddy",
    ["-c", `Print :${key}`, plistPath],
    { encoding: "utf8" }
  ).trim();

  return {
    version: read("CFBundleShortVersionString"),
    buildNumber: read("CFBundleVersion"),
    bundleId: read("CFBundleIdentifier")
  };
}

function readArtifactState(inputPath) {
  const artifactPath = resolve(ROOT, inputPath);
  if (!existsSync(artifactPath)) throw new Error(`artifact does not exist: ${inputPath}`);

  let identity;
  if (lstatSync(artifactPath).isDirectory() && extname(artifactPath) === ".app") {
    identity = plistIdentity(join(artifactPath, "Info.plist"));
  } else if (extname(artifactPath) === ".ipa") {
    const entries = execFileSync("/usr/bin/unzip", ["-Z1", artifactPath], { encoding: "utf8" })
      .split(/\r?\n/)
      .filter((entry) => /^Payload\/[^/]+\.app\/Info\.plist$/.test(entry));
    if (entries.length !== 1) throw new Error("IPA must contain exactly one application Info.plist");

    const tempRoot = mkdtempSync(join(tmpdir(), "osamosam-candidate-plist-"));
    const plistPath = join(tempRoot, "Info.plist");
    try {
      writeFileSync(plistPath, execFileSync("/usr/bin/unzip", ["-p", artifactPath, entries[0]]));
      identity = plistIdentity(plistPath);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  } else {
    throw new Error("install/upload artifact must be an .app directory or .ipa file");
  }

  return {
    path: relative(ROOT, artifactPath),
    sha256: hashPath(artifactPath),
    ...identity
  };
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf8"));
}

function collectRepositoryState() {
  const appJson = readJson("apps/mobile/app.json");
  const eas = readJson("apps/mobile/eas.json");
  const projectText = readFileSync(
    join(ROOT, "apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj"),
    "utf8"
  );
  const production = eas.build?.production ?? {};

  return {
    headSha: execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    branch: execFileSync("git", ["-C", ROOT, "branch", "--show-current"], { encoding: "utf8" }).trim(),
    statusPorcelain: execFileSync(
      "git",
      ["-C", ROOT, "status", "--porcelain=v1", "--untracked-files=all"],
      { encoding: "utf8" }
    ).trim(),
    identityEnvironmentOverrides: IDENTITY_ENVIRONMENT_KEYS.filter(
      (key) => Object.hasOwn(process.env, key) && process.env[key] !== ""
    ),
    appVersion: appJson.expo?.version ?? "",
    nativeIdentity: extractReleaseIdentity(projectText),
    eas: {
      appVersionSource: eas.cli?.appVersionSource,
      productionBundleId: production.env?.APP_BUNDLE_ID,
      distribution: production.distribution,
      autoIncrement: production.autoIncrement
    }
  };
}

function parseArgs(argv) {
  const operation = argv[0];
  let artifactPath = "";

  for (let index = 1; index < argv.length; index += 1) {
    if (argv[index] !== "--artifact" || !argv[index + 1] || artifactPath) {
      throw new Error("Usage: verify-release-candidate.mjs <build|install|upload> [--artifact <.app|.ipa>]");
    }
    artifactPath = argv[index + 1];
    index += 1;
  }

  if (!VALID_OPERATIONS.has(operation)) {
    throw new Error("Usage: verify-release-candidate.mjs <build|install|upload> [--artifact <.app|.ipa>]");
  }
  if ((operation === "install" || operation === "upload") && !artifactPath) {
    throw new Error(`${operation} requires --artifact`);
  }

  return { operation, artifactPath };
}

function main() {
  const { operation, artifactPath } = parseArgs(process.argv.slice(2));
  const evidenceFullPath = join(ROOT, EVIDENCE_PATH);
  const evidence = existsSync(evidenceFullPath) ? readJson(EVIDENCE_PATH) : null;
  const artifact = artifactPath ? readArtifactState(artifactPath) : undefined;
  const blockers = validateReleaseCandidate({
    ledgerText: readFileSync(join(ROOT, "release-ledger.yaml"), "utf8"),
    evidence,
    repository: collectRepositoryState(),
    operation,
    artifact
  });

  console.log("RELEASE CANDIDATE PREFLIGHT RESULT");
  console.log(`- Operation: ${operation}`);

  if (blockers.length > 0) {
    console.error("- Status: blocked");
    for (const blocker of blockers) console.error(`- ${blocker}`);
    process.exitCode = 2;
    return;
  }

  console.log("- Status: pass");
  console.log("- Candidate identity, clean source, explicit selection, and raw evidence are bound.");
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  try {
    main();
  } catch (error) {
    console.error("RELEASE CANDIDATE PREFLIGHT RESULT");
    console.error("- Status: blocked");
    console.error(`- ${error instanceof Error ? error.message : "unknown preflight error"}`);
    process.exitCode = 2;
  }
}
