#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const expected = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  buildId: "61bc2e17-0c5a-45f3-94ee-bf3b63e09f03",
  submissionId: "25518b07-b8de-4507-8a0e-20d85bfe9e14",
  appVersion: "1.0.0",
  buildNumber: "41",
  commit: "0655ced",
  liveBaseUrl: "https://invitation-platform-youngbeens-projects.vercel.app"
};
const nextNativeBuildNumber = "42";
const expectedBuild42 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  appVersion: "1.0.0",
  buildNumber: "42",
  commit: "73872e2",
  crashFixCommit: "0d21924",
  buildId: "88c911f5-3c21-41e8-a6a2-a04939fa6179",
  submissionId: "ba6727cf-2c1d-464f-a005-6ce9670d4f81",
  artifact: "https://expo.dev/artifacts/eas/hTEP9Gx8wMFmK6w9aKSmcc.ipa"
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

const packet = read("docs/app-store-connect-build41-packet.md");
const build42Packet = read("docs/app-store-connect-build42-packet.md");
const readiness = read("docs/app-store-readiness-90.md");
const audit = read("docs/goal-completion-audit-90.md");
const security = read("docs/security-gate-90.md");
const metadata = read("docs/store-submission-metadata.md");
const appleReview = read("docs/apple-review.md");
const inputPacket = read("docs/app-store-connect-input-packet-build42.md");
const build38Packet = read("docs/app-store-connect-build38-packet.md");
const build39Packet = read("docs/app-store-connect-build39-packet.md");
const build40Packet = read("docs/app-store-connect-build40-packet.md");
const executionChecklist = read("docs/app-store-connect-execution-checklist.md");
const supportPage = read("app/support/page.tsx");
const envExample = read(".env.example");
const supportContact = read("lib/support-contact.ts");
const supportContactTest = read("lib/support-contact.test.ts");
const crashTriage = read("docs/testflight-crash-triage-2026-05-03.md");
const crashTriageBuild42 = read("docs/testflight-crash-triage-2026-05-06.md");
const mobileEntry = read("apps/mobile/index.js");
const mobilePackage = read("apps/mobile/package.json");
const mobileEntryTest = read("apps/mobile/entry.test.ts");
const mobileMetroConfig = read("apps/mobile/metro.config.js");
const mobileBabelConfig = read("apps/mobile/babel.config.js");
const iosProject = read("apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj");
const iosPodfileProperties = read("apps/mobile/ios/Podfile.properties.json");
const iosPodfileLock = read("apps/mobile/ios/Podfile.lock");
const nativeStartupSafetyTest = read("apps/mobile/lib/native-startup-safety.test.ts");
const collectDeviceEvidence = read("scripts/collect-testflight-device-evidence.sh");
const awaitDevice = read("scripts/await-testflight-device.sh");
const diagnoseDeviceConnection = read("scripts/diagnose-ios-device-connection.sh");

for (const value of Object.values(expected)) {
  includes("docs/app-store-connect-build41-packet.md", packet, value);
}

for (const value of Object.values(expectedBuild42)) {
  includes("docs/app-store-connect-build42-packet.md", build42Packet, value);
}

includes("docs/app-store-connect-build41-packet.md", packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build41-packet.md", packet, "Do not use `invitehub.co.kr` yet");
includes("docs/app-store-connect-build41-packet.md", packet, "do not use it as the App Review contact");
includes("docs/app-store-connect-build41-packet.md", packet, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-connect-build41-packet.md", packet, "For build 41, do not attach or promote an IAP product");
includes("docs/app-store-connect-build41-packet.md", packet, "NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("docs/app-store-connect-build41-packet.md", packet, "EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false");
includes("docs/app-store-connect-build41-packet.md", packet, "submit only after the user explicitly confirms");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "Latest EAS status recheck | `2026-05-07 21:44 KST`");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "Latest App Store Connect check | `2026-05-07 21:49 KST`");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "TestFlight state | Processed in App Store Connect; `Team (Expo)` assigned; iPhone install/launch pending");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "React.framework");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "ReactNativeDependencies.framework");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "hermesvm.framework");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "node scripts/eas-build-submission-status.mjs 88c911f5-3c21-41e8-a6a2-a04939fa6179");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "Do not count simulator launch as TestFlight proof");

for (const [file, content] of [
  ["docs/app-store-connect-build41-packet.md", packet],
  ["docs/app-store-connect-build42-packet.md", build42Packet],
  ["docs/app-store-connect-build40-packet.md", build40Packet],
  ["docs/app-store-connect-build39-packet.md", build39Packet],
  ["docs/app-store-connect-build38-packet.md", build38Packet],
  ["docs/app-store-connect-execution-checklist.md", executionChecklist],
  ["docs/app-store-readiness-90.md", readiness],
  ["docs/goal-completion-audit-90.md", audit],
  ["docs/security-gate-90.md", security],
  ["docs/testflight-crash-triage-2026-05-03.md", crashTriage],
  ["docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42]
]) {
  notIncludes(
    file,
    content,
    "TE Team (Expo)",
    `${file}: stale TestFlight internal group alias must be Team (Expo)`
  );
}

const reviewNotes = packet.match(/## Review Notes[\s\S]*?```txt\n([\s\S]*?)\n```/)?.[1] ?? "";
check("review notes block is present", reviewNotes.length > 0, "docs/app-store-connect-build41-packet.md: missing Review Notes txt block");
notIncludes(
  "docs/app-store-connect-build41-packet.md Review Notes",
  reviewNotes,
  "support@invitehub.co.kr",
  "Review Notes must not publish the unverified support@invitehub.co.kr mailbox"
);
notIncludes(
  "docs/app-store-connect-build41-packet.md Review Notes",
  reviewNotes,
  "자동 욕설 필터",
  "Review Notes must not claim an unverified profanity-filter feature"
);

includes("docs/app-store-readiness-90.md", readiness, "Build 42 App Store Connect entry values");
includes("docs/app-store-readiness-90.md", readiness, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-readiness-90.md", readiness, "returned build 42 `FINISHED`, linked submission `FINISHED`, `error: null`");
includes("docs/goal-completion-audit-90.md", audit, "## Completion Verdict");
includes("docs/goal-completion-audit-90.md", audit, "Do not mark the goal complete until");
includes("docs/goal-completion-audit-90.md", audit, "build 41 is uploaded and submitted");
includes("docs/goal-completion-audit-90.md", audit, "Build 42 local crash-fix candidate");
includes("docs/goal-completion-audit-90.md", audit, "processed and assigned to internal group `Team (Expo)`");
includes("docs/goal-completion-audit-90.md", audit, "Build 42 EAS upload and submission evidence");
includes("docs/goal-completion-audit-90.md", audit, "App Review contact email");
includes("docs/goal-completion-audit-90.md", audit, "TestFlight device evidence harness");
includes("docs/security-gate-90.md", security, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/store-submission-metadata.md", metadata, "Do not use");
includes("docs/apple-review.md", appleReview, "DNS/MX");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "Build Number | `42`");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, expectedBuild42.buildId);
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, expectedBuild42.submissionId);
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, expectedBuild42.artifact);
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "output/store-screenshots-submission-build40");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "호스트가 대시보드에서 승인하거나 숨길 수 있습니다");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "realIphoneTestFlightInstallLaunchPassed");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "appStoreConnectBuild42Processed");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "build42SelectedForVersion");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "node scripts/verify-goal-completion.mjs");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "Do not use `support@invitehub.co.kr`");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "Do not press final Add for Review or Submit for Review");

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
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "A crash alert with that app name does not prove build 41 is installed");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "Build 41: status `제출 준비 완료`");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "installs `-`, sessions `-`, crashes `-`");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "bundle version `39` installed");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "Unable to launch com.invitehub.app because the device was not, or could not be, unlocked");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "Unhandled JS Exception: Error: No routes found");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "expo-router/entry");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "EXPO_ROUTER_APP_ROOT");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "transform.routerRoot");
includes("docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42, "Prepare build 42 as the emergency crash-fix candidate");
includes("docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42, "React-Core-prebuilt");
includes("docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42, "ReactNativeDependencies");
includes("docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42, "CFBundleVersion`: `42`");
includes("docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42, "Do not claim the crash is fixed until build 42 is installed from TestFlight");
includes("apps/mobile/package.json", mobilePackage, "\"main\": \"expo-router/entry\"");
includes("apps/mobile/index.js", mobileEntry, "expo-router/entry");
notIncludes("apps/mobile/index.js", mobileEntry, "require.context");
notIncludes("apps/mobile/index.js", mobileEntry, "ExpoRoot");
includes("apps/mobile/metro.config.js", mobileMetroConfig, "expo/metro-config");
includes("apps/mobile/metro.config.js", mobileMetroConfig, "getDefaultConfig(__dirname)");
includes("apps/mobile/babel.config.js", mobileBabelConfig, "babel-preset-expo/build/expo-router-plugin");
includes("apps/mobile/babel.config.js", mobileBabelConfig, "expoRouterBabelPlugin");
includes("apps/mobile/babel.config.js", mobileBabelConfig, "plugins: [expoRouterBabelPlugin]");
includes(
  "apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj",
  iosProject,
  `CURRENT_PROJECT_VERSION = ${nextNativeBuildNumber}`
);
includes("apps/mobile/ios/Podfile.properties.json", iosPodfileProperties, "\"ios.buildReactNativeFromSource\": \"true\"");
notIncludes(
  "apps/mobile/ios/Podfile.lock",
  iosPodfileLock,
  "React-Core-prebuilt",
  "Podfile.lock must not include React-Core-prebuilt for build 42"
);
notIncludes(
  "apps/mobile/ios/Podfile.lock",
  iosPodfileLock,
  "ReactNativeDependencies",
  "Podfile.lock must not include ReactNativeDependencies for build 42"
);
notIncludes(
  "apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj",
  iosProject,
  "React.framework",
  "Native project must not embed React.framework for build 42"
);
notIncludes(
  "apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj",
  iosProject,
  "ReactNativeDependencies.framework",
  "Native project must not embed ReactNativeDependencies.framework for build 42"
);
includes("apps/mobile/lib/native-startup-safety.test.ts", nativeStartupSafetyTest, "does not load optional auth/browser native modules");
includes("apps/mobile/lib/native-startup-safety.test.ts", nativeStartupSafetyTest, "builds React Native iOS from source");
includes("apps/mobile/lib/native-startup-safety.test.ts", nativeStartupSafetyTest, "ios.buildReactNativeFromSource");
notIncludes(
  "apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj",
  iosProject,
  "CURRENT_PROJECT_VERSION = 28",
  "Native iOS project must not keep the stale pre-build-41 build number"
);
includes("apps/mobile/entry.test.ts", mobileEntryTest, "uses the Expo Router entry");
includes("apps/mobile/entry.test.ts", mobileEntryTest, "uses Expo Metro config");
includes("apps/mobile/entry.test.ts", mobileEntryTest, "loads the Expo Router Babel transform");
includes("apps/mobile/entry.test.ts", mobileEntryTest, "expo-router/entry");
includes("apps/mobile/entry.test.ts", mobileEntryTest, "require.context");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "bash scripts/await-testflight-device.sh --launch");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "bash scripts/await-testflight-device.sh --open-testflight");
includes("docs/testflight-crash-triage-2026-05-03.md", crashTriage, "bash scripts/diagnose-ios-device-connection.sh");
includes("scripts/collect-testflight-device-evidence.sh", collectDeviceEvidence, "BUNDLE_ID=\"${BUNDLE_ID:-com.invitehub.app}\"");
includes("scripts/collect-testflight-device-evidence.sh", collectDeviceEvidence, "TESTFLIGHT_BUNDLE_ID=\"${TESTFLIGHT_BUNDLE_ID:-com.apple.TestFlight}\"");
includes("scripts/collect-testflight-device-evidence.sh", collectDeviceEvidence, "--bundle-id \"$BUNDLE_ID\"");
includes("scripts/collect-testflight-device-evidence.sh", collectDeviceEvidence, "--open-testflight");
includes("scripts/await-testflight-device.sh", awaitDevice, "tunnelState");
includes("scripts/await-testflight-device.sh", awaitDevice, "OPEN_TESTFLIGHT_ON_READY");
includes("scripts/await-testflight-device.sh", awaitDevice, "collector_args+=(--launch)");
includes("scripts/diagnose-ios-device-connection.sh", diagnoseDeviceConnection, "xcrun xctrace list devices");
includes("scripts/diagnose-ios-device-connection.sh", diagnoseDeviceConnection, "system_profiler SPUSBDataType");
includes("scripts/diagnose-ios-device-connection.sh", diagnoseDeviceConnection, "device-summary.json");
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
check(
  "scripts/diagnose-ios-device-connection.sh is executable",
  isExecutable("scripts/diagnose-ios-device-connection.sh"),
  "scripts/diagnose-ios-device-connection.sh must be executable"
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
console.log(`- Current Candidate Build: ${expectedBuild42.appVersion} (${expectedBuild42.buildNumber})`);
console.log(`- Current EAS Build: ${expectedBuild42.buildId}`);
console.log("- Required follow-up: iPhone TestFlight install/launch and final metadata still need Apple-side evidence.");
