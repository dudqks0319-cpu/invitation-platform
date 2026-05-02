#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const expected = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  buildId: "d185dfc1-9110-4d81-b510-08e02f1ece7f",
  submissionId: "77395141-a80b-48f9-8e43-c61114fafa25",
  appVersion: "1.0.0",
  buildNumber: "38",
  commit: "d8ed82188b3233bebe7be90c173d434f36690581",
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

const packet = read("docs/app-store-connect-build38-packet.md");
const readiness = read("docs/app-store-readiness-90.md");
const audit = read("docs/goal-completion-audit-90.md");
const security = read("docs/security-gate-90.md");
const metadata = read("docs/store-submission-metadata.md");
const appleReview = read("docs/apple-review.md");
const supportPage = read("app/support/page.tsx");
const envExample = read(".env.example");
const supportContact = read("lib/support-contact.ts");
const supportContactTest = read("lib/support-contact.test.ts");

for (const value of Object.values(expected)) {
  includes("docs/app-store-connect-build38-packet.md", packet, value);
}

includes("docs/app-store-connect-build38-packet.md", packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build38-packet.md", packet, "Do not use `invitehub.co.kr` yet");
includes("docs/app-store-connect-build38-packet.md", packet, "do not use it as the App Review contact");
includes("docs/app-store-connect-build38-packet.md", packet, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-connect-build38-packet.md", packet, "For build 38, do not attach or promote an IAP product");
includes("docs/app-store-connect-build38-packet.md", packet, "NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("docs/app-store-connect-build38-packet.md", packet, "EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("docs/app-store-connect-build38-packet.md", packet, "submit only after the user explicitly confirms");

const reviewNotes = packet.match(/## Review Notes[\s\S]*?```txt\n([\s\S]*?)\n```/)?.[1] ?? "";
check("review notes block is present", reviewNotes.length > 0, "docs/app-store-connect-build38-packet.md: missing Review Notes txt block");
notIncludes(
  "docs/app-store-connect-build38-packet.md Review Notes",
  reviewNotes,
  "support@invitehub.co.kr",
  "Review Notes must not publish the unverified support@invitehub.co.kr mailbox"
);
notIncludes(
  "docs/app-store-connect-build38-packet.md Review Notes",
  reviewNotes,
  "자동 욕설 필터",
  "Review Notes must not claim an unverified profanity-filter feature"
);

includes("docs/app-store-readiness-90.md", readiness, "Build 38 App Store Connect entry values");
includes("docs/app-store-readiness-90.md", readiness, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-readiness-90.md", readiness, "returned build 38 `FINISHED`, linked submission `FINISHED`, `error: null`");
includes("docs/goal-completion-audit-90.md", audit, "The full active goal is not complete yet");
includes("docs/goal-completion-audit-90.md", audit, "build 38 has not been visually confirmed");
includes("docs/goal-completion-audit-90.md", audit, "verified App Review contact email");
includes("docs/security-gate-90.md", security, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/store-submission-metadata.md", metadata, "Do not use");
includes("docs/apple-review.md", appleReview, "DNS/MX");

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
console.log("- Required follow-up: App Store Connect build 38 processing, TestFlight install, and final metadata still need Apple-side evidence.");
