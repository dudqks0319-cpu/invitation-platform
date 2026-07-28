#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const EXPECTED_BUNDLE_ID = "com.invitehub.app";
const EXPECTED_VERSION = "1.0.3";
const EXPECTED_BUILD = "66";
const DEFAULT_EVIDENCE_DIR =
  "output/testflight-device-evidence/20260728-iphone12pro-readonly";
const REQUIRED_CAPTURES = [
  "devices",
  "lock-state",
  "testflight-app",
  "invitehub-app",
  "invitehub-processes"
];
const MAX_EVIDENCE_AGE_SECONDS = Number.parseInt(
  process.env.MAX_EVIDENCE_AGE_SECONDS ?? "86400",
  10
);
const argumentsAfterScript = process.argv.slice(2);
const requireLaunch = argumentsAfterScript.includes("--require-launch");
const evidenceDirectoryArgument = argumentsAfterScript.find(
  (argument) => !argument.startsWith("--")
);

function fail(message) {
  console.error(`TESTFLIGHT BUILD 66 EVIDENCE FAILED: ${message}`);
  process.exit(1);
}

function readRequired(path, label) {
  if (!existsSync(path)) {
    fail(`missing ${label}: ${path}`);
  }

  return readFileSync(path, "utf8");
}

function readJson(path, label) {
  const content = readRequired(path, label);

  try {
    return JSON.parse(content);
  } catch {
    fail(`invalid JSON in ${label}: ${path}`);
  }
}

const evidenceDir = resolve(
  process.cwd(),
  evidenceDirectoryArgument ?? process.env.EVIDENCE_DIR ?? DEFAULT_EVIDENCE_DIR
);

if (
  !Number.isFinite(MAX_EVIDENCE_AGE_SECONDS) ||
  MAX_EVIDENCE_AGE_SECONDS <= 0
) {
  fail("MAX_EVIDENCE_AGE_SECONDS must be a positive integer");
}

function requireFreshFile(path, label) {
  const ageSeconds = (Date.now() - statSync(path).mtimeMs) / 1000;
  if (ageSeconds < -300) {
    fail(`${label} timestamp is unexpectedly in the future`);
  }
  if (ageSeconds > MAX_EVIDENCE_AGE_SECONDS) {
    fail(
      `${label} is stale (${Math.floor(ageSeconds)} seconds old; maximum ${MAX_EVIDENCE_AGE_SECONDS})`
    );
  }
}

function verifyCapture(capture) {
  const exitCodePath = resolve(evidenceDir, `${capture}.exit-code.txt`);
  const exitCode = readRequired(exitCodePath, `${capture} exit code`).trim();
  requireFreshFile(exitCodePath, `${capture} exit code`);

  if (exitCode !== "0") {
    fail(`${capture} command exited with ${exitCode || "an empty status"}`);
  }

  const jsonPath = resolve(evidenceDir, `${capture}.json`);
  const json = readJson(jsonPath, `${capture} capture`);
  requireFreshFile(jsonPath, `${capture} capture`);

  if (json.info?.outcome !== "success") {
    fail(`${capture} JSON outcome is not success`);
  }

  return json;
}

for (const capture of REQUIRED_CAPTURES) {
  verifyCapture(capture);
}

const devices = readJson(resolve(evidenceDir, "devices.json"), "devices capture");
const lockState = readJson(
  resolve(evidenceDir, "lock-state.json"),
  "lock-state capture"
);
const testflightApp = readJson(
  resolve(evidenceDir, "testflight-app.json"),
  "TestFlight app capture"
);
const invitehubApp = readJson(
  resolve(evidenceDir, "invitehub-app.json"),
  "InviteHub app capture"
);
const invitehubProcesses = readJson(
  resolve(evidenceDir, "invitehub-processes.json"),
  "InviteHub process capture"
);

const installedApps = invitehubApp.result?.apps;
if (!Array.isArray(installedApps)) {
  fail("InviteHub app capture has no apps array");
}

const matchingApps = installedApps.filter(
  (app) => app.bundleIdentifier === EXPECTED_BUNDLE_ID
);
if (matchingApps.length !== 1) {
  fail(
    `expected exactly one installed ${EXPECTED_BUNDLE_ID} app, found ${matchingApps.length}`
  );
}

const installedApp = matchingApps[0];
if (installedApp.version !== EXPECTED_VERSION) {
  fail(
    `expected app version ${EXPECTED_VERSION}, found ${installedApp.version ?? "missing"}`
  );
}
if (String(installedApp.bundleVersion ?? "") !== EXPECTED_BUILD) {
  fail(
    `expected app build ${EXPECTED_BUILD}, found ${installedApp.bundleVersion ?? "missing"}`
  );
}

const deviceIdentifier = invitehubApp.result?.deviceIdentifier;
if (typeof deviceIdentifier !== "string" || deviceIdentifier.length === 0) {
  fail("InviteHub app capture has no device identifier");
}

for (const [label, identifier] of [
  ["lock-state", lockState.result?.deviceIdentifier],
  ["TestFlight app", testflightApp.result?.deviceIdentifier],
  ["InviteHub process", invitehubProcesses.result?.deviceIdentifier]
]) {
  if (identifier !== deviceIdentifier) {
    fail(`${label} capture belongs to a different device`);
  }
}

const device = devices.result?.devices?.find(
  (candidate) => candidate.identifier === deviceIdentifier
);
if (!device) {
  fail(`device ${deviceIdentifier} is missing from devices capture`);
}
if (device.connectionProperties?.tunnelState !== "connected") {
  fail(`device ${deviceIdentifier} was not connected when captured`);
}
if (device.hardwareProperties?.reality !== "physical") {
  fail(`device ${deviceIdentifier} is not identified as a physical device`);
}

if (requireLaunch) {
  verifyCapture("launch");
  const processesAfterLaunch = verifyCapture(
    "invitehub-processes-after-launch"
  );
  if (
    !Array.isArray(processesAfterLaunch.result?.runningProcesses) ||
    processesAfterLaunch.result.runningProcesses.length === 0
  ) {
    fail("no InviteHub process was running after launch");
  }
}

console.log("TESTFLIGHT BUILD 66 DEVICE EVIDENCE RESULT");
console.log("- Status: pass");
console.log(`- Evidence: ${evidenceDir}`);
console.log("- Device: redacted");
console.log(`- Model: ${device.hardwareProperties?.marketingName ?? "unknown"}`);
console.log(`- Bundle: ${EXPECTED_BUNDLE_ID}`);
console.log(`- Version: ${EXPECTED_VERSION}`);
console.log(`- Build: ${EXPECTED_BUILD}`);
console.log(
  requireLaunch
    ? "- Scope: fresh device capture proves matching installed metadata and a running post-launch process; developer installation does not prove EAS artifact identity, TestFlight assignment, or App Store submission."
    : "- Scope: fresh read-only device capture proves matching installed metadata only; developer installation does not prove EAS artifact identity, TestFlight assignment, launch success, or App Store submission."
);
