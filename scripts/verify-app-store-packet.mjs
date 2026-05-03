#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const expected = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  buildId: "86a14873-bdfd-4390-87d1-81ae0ddd06dc",
  submissionId: "cf537e44-73dd-4a2d-8640-7d31e9facba8",
  appVersion: "1.0.0",
  buildNumber: "40",
  commit: "9c83039",
  liveBaseUrl: "https://invitation-platform-youngbeens-projects.vercel.app"
};

const checks = [];
const failures = [];

function read(relativePath) {
  const path = join(root, relativePath);

  if (!existsSync(path)) {
    failures.push(`${relativePath}: missing file`);
    return "";
  }

  return readFileSync(path, "utf8");
}

function check(name, condition, detail) {
  checks.push(name);

  if (!condition) {
    failures.push(detail ?? name);
  }
}

function includes(file, content, value) {
  check(`${file} includes ${value}`, content.includes(value), `${file}: expected to include ${value}`);
}

function notIncludes(file, content, value, detail) {
  check(`${file} excludes ${value}`, !content.includes(value), detail ?? `${file}: expected to exclude ${value}`);
}

function isExecutable(relativePath) {
  const path = join(root, relativePath);

  return existsSync(path) && (statSync(path).mode & 0o111) !== 0;
}

const packet = read("docs/app-store-connect-build40-packet.md");
const readiness = read("docs/app-store-readiness-90.md");
const audit = read("docs/goal-completion-audit-90.md");
const security = read("docs/security-gate-90.md");
const metadata = read("docs/store-submission-metadata.md");
const appleReview = read("docs/apple-review.md");
const inputPacket = read("docs/app-store-connect-input-packet-build40.md");
const supportPage = read("app/support/page.tsx");
const envExample = read(".env.example");
const supportContact = read("lib/support-contact.ts");
const supportContactTest = read("lib/support-contact.test.ts");
const crashTriage = read("docs/testflight-crash-triage-2026-05-03.md");
const collectDeviceEvidence = read("scripts/collect-testflight-device-evidence.sh");
const awaitDevice = read("scripts/await-testflight-device.sh");

for (const value of Object.values(expected)) {
  includes("docs/app-store-connect-build40-packet.md", packet, value);
}

includes("docs/app-store-connect-build40-packet.md", packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build40-packet.md", packet, "Do not use `invitehub.co.kr` yet");
includes("docs/app-store-connect-build40-packet.md", packet, "do not use it as the App Review contact");
includes("docs/app-store-connect-build40-packet.md", packet, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-connect-build40-packet.md", packet, "For build 40, do not attach or promote an IAP product");
includes("docs/app-store-connect-build40-packet.md", packet, "NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("docs/app-store-connect-build40-packet.md", packet, "EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("docs/app-store-connect-build40-packet.md", packet, "submit only after the user explicitly confirms");

const reviewNotes = packet.match(/## Review Notes[\s\S]*?```txt\n([\s\S]*?)\n```/)?.[1] ?? "";
check("review notes block is present", reviewNotes.length > 0, "docs/app-store-connect-build40-packet.md: missing Review Notes txt block");
notIncludes(
  "docs/app-store-connect-build40-packet.md Review Notes",
  reviewNotes,
  "support@invitehub.co.kr",
  "Review Notes must not publish the unverified support@invitehub.co.kr mailbox"
);
notIncludes(
  "docs/app-store-connect-build40-packet.md Review Notes",
  reviewNotes,
  "자동 욕설 필터",
  "Review Notes must not claim an unverified profanity-filter feature"
);

includes("docs/app-store-readiness-90.md", readiness, "Build 40 App Store Connect entry values");
includes("docs/app-store-readiness-90.md", readiness, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-readiness-90.md", readiness, "returned build 40 `FINISHED`, linked submission `FINISHED`, `error: null`");
includes("docs/goal-completion-audit-90.md", audit, "## Completion Verdict");
includes("docs/goal-completion-audit-90.md", audit, "Do not mark the goal complete until");
includes("docs/goal-completion-audit-90.md", audit, "build 40 is uploaded and submitted");
includes("docs/goal-completion-audit-90.md", audit, "App Review contact email");
includes("docs/goal-completion-audit-90.md", audit, "TestFlight device evidence harness");
includes("docs/security-gate-90.md", security, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/store-submission-metadata.md", metadata, "Do not use");
includes("docs/apple-review.md", appleReview, "DNS/MX");
includes("docs/app-store-connect-input-packet-build40.md", inputPacket, "Build Number | `40`");
includes("docs/app-store-connect-input-packet-build40.md", inputPacket, expected.buildId);
includes("docs/app-store-connect-input-packet-build40.md", inputPacket, expected.liveBaseUrl);
includes("docs/app-store-connect-input-packet-build40.md", inputPacket, "output/store-screenshots-submission-build40");
includes("docs/app-store-connect-input-packet-build40.md", inputPacket, "Do not use `support@invitehub.co.kr`");
includes("docs/app-store-connect-input-packet-build40.md", inputPacket, "final submit action still requires separate explicit user confirmation");

notIncludes(
  "app/support/page.tsx",
  supportPage,
  "support@invitehub.co.kr",
  "Public support page must not hardcode the unverified support mailbox"
);
includes("app/support/page.tsx", supportPage, "getSupportEmail");
includes("app/support/page.tsx", supportPage, "App Store Connect에 등록된 지원 연락처");
includes(".env.example", envExample, "NEXT_PUBLIC_SUPPORT_EMAIL=");
includes(".env.example", envExample, "NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("lib/support-contact.ts", supportContact, "normalizeSupportEmail");
includes("lib/support-contact.ts", supportContact, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("lib/support-contact.test.ts", supportContactTest, "normalizeSupportEmail");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "A crash alert with that app name does not prove build 40 is installed");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "Build 40: status `제출 준비 완료`");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "installs `-`, sessions `-`, crashes `-`");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "bash scripts/await-testflight-device.sh --launch");
includes("scripts/collect-testflight-device-evidence.sh", collectDeviceEvidence, "BUNDLE_ID=\"${BUNDLE_ID:-com.invitehub.app}\"");
includes("scripts/collect-testflight-device-evidence.sh", collectDeviceEvidence, "--bundle-id \"$BUNDLE_ID\"");
includes("scripts/await-testflight-device.sh", awaitDevice, "tunnelState");
includes("scripts/await-testflight-device.sh", awaitDevice, "scripts/collect-testflight-device-evidence.sh --launch");
check(
  "scripts/collect-testflight-device-evidence.sh is executable",
  isExecutable("scripts/collect-testflight-device-evidence.sh"),
  "scripts/collect-testflight-device-evidence.sh must be executable"
);
check(
  "scripts/await-testflight-device.sh is executable",
  isExecutable("scripts/await-testflight-device.sh"),
  "scripts/await-testflight-device.sh must be executable"
);

if (failures.length > 0) {
  console.error("APP STORE PACKET VERIFY RESULT");
  console.error("- Status: fail");
  console.error(`- Checks: ${checks.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("APP STORE PACKET VERIFY RESULT");
console.log("- Status: pass");
console.log(`- Checks: ${checks.length}`);
console.log(`- Build: ${expected.appVersion} (${expected.buildNumber})`);
console.log(`- EAS Build: ${expected.buildId}`);
console.log("- Required follow-up: iPhone TestFlight install/launch and final metadata still need Apple-side evidence.");
