#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

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
const currentNativeBuildNumber = "52";
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
const expectedBuild43 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  appVersion: "1.0.0",
  buildNumber: "43",
  sourceCommit: "4af7f3c",
  buildId: "9a4a25a7-c362-4ba0-9c01-fdac8b0f942c",
  submissionId: "595cd20f-6d0d-4c72-887f-ffcc7b614dd6",
  artifact: "https://expo.dev/artifacts/eas/k435zPEohnNNZiQAiAB9Wq.ipa"
};
const expectedBuild45 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  displayName: "초대장허브",
  appVersion: "1.0.0",
  buildNumber: "45",
  sourceCommit: "8f21618",
  buildId: "3b625bcc-4a25-49c3-90d8-f844979cb189",
  submissionId: "dae1101a-afe1-48bf-9dd1-7b8599891181",
  artifact: "https://expo.dev/artifacts/eas/8kjgoaMSvQMvxcL6WPnxnT.ipa"
};
const expectedBuild46 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  displayName: "초대장허브",
  appVersion: "1.0.1",
  buildNumber: "46",
  sourceCommit: "737884b",
  buildId: "4aefa47b-ca9e-4d90-8029-a8ab6f45a528",
  submissionId: "023a9129-d68b-406a-a5b5-58e03c98a13a",
  artifact: "https://expo.dev/artifacts/eas/afGx9mRBMme34vyPZ7Jyu1.ipa"
};
const expectedBuild47 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  displayName: "초대장허브",
  appVersion: "1.0.1",
  buildNumber: "47",
  sourceCommit: "4221622",
  buildId: "52514ba4-4f26-4a35-bb21-a565b3a471a9",
  submissionId: "37ac90b7-1af6-43ed-a92d-5c3135917a33",
  artifact: "https://expo.dev/artifacts/eas/bayNvUjUads2HBqsoiZ3Rg.ipa"
};
const expectedBuild48 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  displayName: "초대장허브",
  appVersion: "1.0.1",
  buildNumber: "48",
  sourceCommit: "0cd5297",
  buildId: "6456cecd-d38d-40c9-a804-85189d1c9400",
  submissionId: "2dfa0414-c11f-4899-a094-3fbf263c7c19",
  artifact: "https://expo.dev/artifacts/eas/doCY1SirwjM6oM9C2ZkDmu.ipa"
};
const expectedBuild49 = {
  appId: "6763630299",
  bundleId: "com.invitehub.app",
  displayName: "초대장허브",
  appVersion: "1.0.1",
  buildNumber: "49",
  sourceCommit: "dbe4ef7",
  buildId: "441a4e1a-662b-404b-8143-1c016cbc4a77",
  submissionId: "fe4a28ea-1467-44ed-a498-d7ace915dd6f",
  artifact: "https://expo.dev/artifacts/eas/9pKXtn9zy9nJVfFhEtFcKD.ipa"
};
const expectedCurrentCandidate = {
  appVersion: "1.0.3",
  buildNumber: "67",
  sourceCommit: "0196fb4a337e1b894af93d3c9b1374d0cfd30783",
  buildId: "616d9c95-7189-4a76-8751-9d8ed947c833",
  artifactBytes: "176900384",
  artifactBytesFormatted: "176,900,384",
  artifactSha256:
    "356de45d57c46bbf31f88a63cc743a193c5dd29490da310d3dce1409f8f0482e",
  displayName: "오삼오삼"
};
const expectedUploadedCandidate = {
  buildNumber: "66",
  buildId: "b1a187d7-0776-4dd0-b648-9685edbb7760",
  submissionId: "90000462-1a28-424d-a496-bef9ad8d7f41",
};

const checks = [];
const failures = [];

function fatal(message) {
  console.error(`APP STORE PACKET VERIFY FAILED: ${message}`);
  process.exit(1);
}

function read(relativePath) {
  const path = resolve(root, relativePath);

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

function includesOneOf(file, content, values) {
  check(
    `${file} includes one of ${values.join(", ")}`,
    values.some((value) => content.includes(value)),
    `${file}: expected to include one of ${values.join(", ")}`
  );
}

function notIncludes(file, content, value, detail) {
  check(`${file} excludes ${value}`, !content.includes(value), detail ?? `${file}: expected to exclude ${value}`);
}

function isExecutable(relativePath) {
  const path = resolve(root, relativePath);

  return existsSync(path) && (statSync(path).mode & 0o111) !== 0;
}

const packet = read("docs/app-store-connect-build41-packet.md");
const build42Packet = read("docs/app-store-connect-build42-packet.md");
const build43Packet = read("docs/app-store-connect-build43-packet.md");
const build45Packet = read("docs/app-store-connect-build45-packet.md");
const build46Packet = read("docs/app-store-connect-build46-packet.md");
const build47Packet = read("docs/app-store-connect-build47-packet.md");
const build48Packet = read("docs/app-store-connect-build48-packet.md");
const build49Packet = read("docs/app-store-connect-build49-packet.md");
const build46InputPacket = read("docs/app-store-connect-input-packet-build46.md");
const fixturePathsAllowed =
  process.env.NODE_ENV === "test" &&
  process.env.ALLOW_RELEASE_FIXTURE_PATHS === "1";

function canonicalEvidencePath(environmentName, defaultPath) {
  const override = process.env[environmentName];
  if (override && !fixturePathsAllowed) {
    fatal(
      `${environmentName} is test-only and requires NODE_ENV=test with ALLOW_RELEASE_FIXTURE_PATHS=1`
    );
  }
  return override ?? defaultPath;
}

const releaseStatus = read(
  canonicalEvidencePath("RELEASE_STATUS_PATH", "RELEASE_STATUS.md")
);
const currentReleaseState = read(
  canonicalEvidencePath(
    "CURRENT_RELEASE_STATE_PATH",
    "docs/current-release-state.md"
  )
);
const releaseLedger = read(
  canonicalEvidencePath("RELEASE_LEDGER_PATH", "release-ledger.yaml")
);
const readiness = read("docs/app-store-readiness-90.md");
const audit = read("docs/goal-completion-audit-90.md");
const security = read("docs/security-gate-90.md");
const metadata = read("docs/store-submission-metadata.md");
const appleReview = read("docs/apple-review.md");
const inputPacket = read("docs/app-store-connect-input-packet-build42.md");
const nextBuildPacket = read("docs/app-store-connect-next-build-packet.md");
const build38Packet = read("docs/app-store-connect-build38-packet.md");
const build39Packet = read("docs/app-store-connect-build39-packet.md");
const build40Packet = read("docs/app-store-connect-build40-packet.md");
const executionChecklist = read("docs/app-store-connect-execution-checklist.md");
const supportPage = read("app/support/page.tsx");
const envExample = read(".env.example");
const easIgnore = read(".easignore");
const supportContact = read("lib/support-contact.ts");
const supportContactTest = read("lib/support-contact.test.ts");
const crashTriage = read("docs/testflight-crash-triage-2026-05-03.md");
const crashTriageBuild42 = read("docs/testflight-crash-triage-2026-05-06.md");
const crashTriageBuild42Failed = read("docs/testflight-crash-triage-2026-05-07.md");
const mobileEntry = read("apps/mobile/index.js");
const mobilePackage = read("apps/mobile/package.json");
const mobileAppConfig = read("apps/mobile/app.json");
const mobileEntryTest = read("apps/mobile/entry.test.ts");
const mobileMetroConfig = read("apps/mobile/metro.config.js");
const mobileBabelConfig = read("apps/mobile/babel.config.js");
const iosInfoPlist = read("apps/mobile/ios/InviteHub/Info.plist");
const iosProject = read("apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj");
const iosPodfileProperties = read("apps/mobile/ios/Podfile.properties.json");
const iosPodfileLock = read("apps/mobile/ios/Podfile.lock");
const nativeStartupSafetyTest = read("apps/mobile/lib/native-startup-safety.test.ts");
const collectDeviceEvidence = read("scripts/collect-testflight-device-evidence.sh");
const releaseGate = read("scripts/invitehub-release-gate.sh");
const awaitDevice = read("scripts/await-testflight-device.sh");
const diagnoseDeviceConnection = read("scripts/diagnose-ios-device-connection.sh");

for (const value of Object.values(expected)) {
  includes("docs/app-store-connect-build41-packet.md", packet, value);
}

for (const value of Object.values(expectedBuild42)) {
  includes("docs/app-store-connect-build42-packet.md", build42Packet, value);
}

for (const value of Object.values(expectedBuild43)) {
  includes("docs/app-store-connect-build43-packet.md", build43Packet, value);
}

for (const value of Object.values(expectedBuild45)) {
  includes("docs/app-store-connect-build45-packet.md", build45Packet, value);
}

for (const value of Object.values(expectedBuild46)) {
  includes("docs/app-store-connect-build46-packet.md", build46Packet, value);
}

for (const value of Object.values(expectedBuild47)) {
  includes("docs/app-store-connect-build47-packet.md", build47Packet, value);
}

for (const value of Object.values(expectedBuild48)) {
  includes("docs/app-store-connect-build48-packet.md", build48Packet, value);
}

for (const value of Object.values(expectedBuild49)) {
  includes("docs/app-store-connect-build49-packet.md", build49Packet, value);
}

for (const value of [
  expectedBuild46.appId,
  expectedBuild46.bundleId,
  expectedBuild46.displayName,
  expectedBuild46.appVersion,
  expectedBuild46.buildNumber,
  expectedBuild46.buildId,
  expectedBuild46.submissionId,
  expectedBuild46.artifact
]) {
  includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, value);
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
includes("docs/app-store-connect-build42-packet.md", build42Packet, "TestFlight state | Processed in App Store Connect; `Team (Expo)` assigned; real iPhone launch failed");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "docs/testflight-crash-triage-2026-05-07.md");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "React.framework");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "ReactNativeDependencies.framework");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "hermesvm.framework");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "node scripts/eas-build-submission-status.mjs 88c911f5-3c21-41e8-a6a2-a04939fa6179");
includes("docs/app-store-connect-build42-packet.md", build42Packet, "Do not count simulator launch as TestFlight proof");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "Uploaded to Apple; processing pending");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "currentTestFlightBuildProcessed");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "realIphoneTestFlightInstallLaunchPassed");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "node scripts/app-store-connect-build-status.mjs --build 43");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "APPLE_APP_STORE_PRIVATE_KEY");
includes("docs/app-store-connect-build43-packet.md", build43Packet, "Final Add for Review and Submit for Review still require separate explicit user");
includes("docs/app-store-connect-build45-packet.md", build45Packet, "Incremented buildNumber from 44 to 45");
includes("docs/app-store-connect-build45-packet.md", build45Packet, "Clean Install Test");
includes("docs/app-store-connect-build46-packet.md", build46Packet, "Incremented buildNumber from 45 to 46");
includes("docs/app-store-connect-build46-packet.md", build46Packet, "App Version :  1.0.1");
includes("docs/app-store-connect-build46-packet.md", build46Packet, "Build number:  46");
includes("docs/app-store-connect-build46-packet.md", build46Packet, "TestFlight build row: build 46 / 제출 준비 완료 / 90일 후 만료");
includes("docs/app-store-connect-build46-packet.md", build46Packet, "Required Real iPhone Test");
includes("docs/app-store-connect-build47-packet.md", build47Packet, "Build `1.0.1 (47)`");
includes("docs/app-store-connect-build47-packet.md", build47Packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build47-packet.md", build47Packet, "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID");
includes("docs/app-store-connect-build47-packet.md", build47Packet, "naverEnabled: false");
includes("docs/app-store-connect-build47-packet.md", build47Packet, "real iPhone smoke test");
includes("docs/app-store-connect-build48-packet.md", build48Packet, "Build `1.0.1 (48)`");
includes("docs/app-store-connect-build48-packet.md", build48Packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build48-packet.md", build48Packet, "apps/mobile/app/_layout.tsx: present");
includes("docs/app-store-connect-build48-packet.md", build48Packet, "route marker step1-basic: present");
includes("docs/app-store-connect-build48-packet.md", build48Packet, "Previously uploaded TestFlight builds cannot be fully deleted");
includes("docs/app-store-connect-build49-packet.md", build49Packet, "Build `1.0.1 (49)`");
includes("docs/app-store-connect-build49-packet.md", build49Packet, "EAS submission status | `FINISHED`, `error: null`");
includes("docs/app-store-connect-build49-packet.md", build49Packet, "/api/maps/config: present");
includes("docs/app-store-connect-build49-packet.md", build49Packet, "kakaomap://search: present");
includes("docs/app-store-connect-build49-packet.md", build49Packet, "naverEnabled: false");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "Source commit | Verify immediately before upload with `git rev-parse --short HEAD`");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "EAS remote auto-increment after build 42");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "git rev-parse --short HEAD");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "currentTestFlightBuildProcessed");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "currentReleaseBuildSelectedForVersion");
includes("docs/app-store-connect-next-build-packet.md", nextBuildPacket, "Final Add for Review and Submit for Review still require separate explicit user");

for (const [file, content] of [
  ["docs/app-store-connect-build41-packet.md", packet],
  ["docs/app-store-connect-build42-packet.md", build42Packet],
  ["docs/app-store-connect-build43-packet.md", build43Packet],
  ["docs/app-store-connect-build45-packet.md", build45Packet],
  ["docs/app-store-connect-build46-packet.md", build46Packet],
  ["docs/app-store-connect-build47-packet.md", build47Packet],
  ["docs/app-store-connect-build48-packet.md", build48Packet],
  ["docs/app-store-connect-build49-packet.md", build49Packet],
  ["docs/app-store-connect-input-packet-build46.md", build46InputPacket],
  ["docs/current-release-state.md", currentReleaseState],
  ["docs/app-store-connect-next-build-packet.md", nextBuildPacket],
  ["docs/app-store-connect-build40-packet.md", build40Packet],
  ["docs/app-store-connect-build39-packet.md", build39Packet],
  ["docs/app-store-connect-build38-packet.md", build38Packet],
  ["docs/app-store-connect-execution-checklist.md", executionChecklist],
  ["docs/app-store-readiness-90.md", readiness],
  ["docs/goal-completion-audit-90.md", audit],
  ["docs/security-gate-90.md", security],
  ["docs/testflight-crash-triage-2026-05-03.md", crashTriage],
  ["docs/testflight-crash-triage-2026-05-06.md", crashTriageBuild42],
  ["docs/testflight-crash-triage-2026-05-07.md", crashTriageBuild42Failed]
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
includes("docs/app-store-readiness-90.md", readiness, "Build 42 is no longer a valid");
includes("docs/app-store-readiness-90.md", readiness, "Real iPhone launch failed on 2026-05-07");
includes("docs/app-store-readiness-90.md", readiness, "NEXT_PUBLIC_SUPPORT_EMAIL");
includes("docs/app-store-readiness-90.md", readiness, "returned build 42 `FINISHED`, linked submission `FINISHED`, `error: null`");
includes("docs/goal-completion-audit-90.md", audit, "## Completion Verdict");
includes("docs/goal-completion-audit-90.md", audit, "Do not mark the goal complete until");
includes("docs/goal-completion-audit-90.md", audit, "build 41 is uploaded and submitted");
includes("docs/goal-completion-audit-90.md", audit, "Build 42 local crash-fix candidate");
includes("docs/goal-completion-audit-90.md", audit, "Failed on real iPhone");
includes("docs/goal-completion-audit-90.md", audit, "processed and assigned to `Team (Expo)`");
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
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "currentTestFlightBuildProcessed");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "currentReleaseBuildSelectedForVersion");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "do not select build 42");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "node scripts/verify-goal-completion.mjs");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "Do not use `support@invitehub.co.kr`");
includes("docs/app-store-connect-input-packet-build42.md", inputPacket, "Do not press final Add for Review or Submit for Review");
includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, "Build Number | `46`");
includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, "Do not press final Add for Review or Submit for Review");
includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, "사진 포함 유료 발행 및 인앱 결제 기능은 현재 제출 빌드에서 비활성화");
includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, "TestFlight에서 다음 빌드를 설치");
includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, "currentReleaseBuildSelectedForVersion");
includes("docs/current-release-state.md", currentReleaseState, `Local candidate | \`${expectedCurrentCandidate.appVersion} (${expectedCurrentCandidate.buildNumber})\``);
includes("docs/current-release-state.md", currentReleaseState, expectedCurrentCandidate.sourceCommit);
includes("docs/current-release-state.md", currentReleaseState, expectedCurrentCandidate.buildId);
includes("docs/current-release-state.md", currentReleaseState, expectedCurrentCandidate.artifactBytesFormatted);
includes("docs/current-release-state.md", currentReleaseState, expectedCurrentCandidate.artifactSha256);
includes("docs/current-release-state.md", currentReleaseState, expectedUploadedCandidate.submissionId);
includes("docs/current-release-state.md", currentReleaseState, "Build 67 `FINISHED`");
includes("docs/current-release-state.md", currentReleaseState, "Build 67은 아직 App Store Connect에 업로드하지 않음");
includes("docs/current-release-state.md", currentReleaseState, "Chrome authenticated live 확인");
includes("docs/current-release-state.md", currentReleaseState, "Build 66 `제출 준비 완료`");
includes("docs/current-release-state.md", currentReleaseState, "`Team (Expo)` 그룹 1개·테스터 1명");
includes("docs/current-release-state.md", currentReleaseState, "심사 메모는 아직 Build 64로 표기");
includes("docs/current-release-state.md", currentReleaseState, "`com.invitehub.app` `1.0.3 (66)` 개발자 설치본");
includes("docs/current-release-state.md", currentReleaseState, "`builtByDeveloper=true`라 TestFlight 설치 증거는 아니며");
includes("docs/current-release-state.md", currentReleaseState, "EAS IPA와 동일 바이너리라는 증거도 아님");
includes("docs/current-release-state.md", currentReleaseState, "잠금 해제와 CoreDevice 연결을 확인");
includes("docs/current-release-state.md", currentReleaseState, "`InviteHub.app/InviteHub` 프로세스가 유지되는 증거 수집 통과");
includes("docs/current-release-state.md", currentReleaseState, "Do not select Builds 62, 63, or 64");
includes("docs/current-release-state.md", currentReleaseState, "App Review state | Not submitted");
includes("docs/current-release-state.md", currentReleaseState, "Public release state | Still `1.0.2`; no 1.0.3 public rollout");
includes("RELEASE_STATUS.md", releaseStatus, `\`${expectedCurrentCandidate.appVersion} (${expectedCurrentCandidate.buildNumber})\``);
includes("RELEASE_STATUS.md", releaseStatus, expectedCurrentCandidate.sourceCommit.slice(0, 7));
includes("RELEASE_STATUS.md", releaseStatus, expectedCurrentCandidate.buildId);
includes("RELEASE_STATUS.md", releaseStatus, expectedCurrentCandidate.artifactBytesFormatted);
includes("RELEASE_STATUS.md", releaseStatus, expectedCurrentCandidate.artifactSha256);
includes("RELEASE_STATUS.md", releaseStatus, expectedUploadedCandidate.submissionId);
includes("RELEASE_STATUS.md", releaseStatus, "not proof of the EAS IPA binary");
includes("RELEASE_STATUS.md", releaseStatus, "App Review: not submitted");
includes("RELEASE_STATUS.md", releaseStatus, "Public App Store: still `1.0.2`");
includes("RELEASE_STATUS.md", releaseStatus, "`com.invitehub.app.dev` was moved to deleted apps");
includes("release-ledger.yaml", releaseLedger, `version: "${expectedCurrentCandidate.appVersion}"`);
includes("release-ledger.yaml", releaseLedger, `build_number: "${expectedCurrentCandidate.buildNumber}"`);
includes("release-ledger.yaml", releaseLedger, expectedCurrentCandidate.sourceCommit);
includes("release-ledger.yaml", releaseLedger, expectedCurrentCandidate.buildId);
includes("release-ledger.yaml", releaseLedger, `artifact_bytes: ${expectedCurrentCandidate.artifactBytes}`);
includes("release-ledger.yaml", releaseLedger, `artifact_sha256: "${expectedCurrentCandidate.artifactSha256}"`);
includes("release-ledger.yaml", releaseLedger, "eas_build_state: finished");
includes("release-ledger.yaml", releaseLedger, "eas_submit_state: not_started");
includes("release-ledger.yaml", releaseLedger, "app_store_connect_state: build_67_not_uploaded_build_66_ready_to_submit");
includes("release-ledger.yaml", releaseLedger, "testflight_state: build_67_not_uploaded_build_66_internal_group");
includes("release-ledger.yaml", releaseLedger, expectedUploadedCandidate.submissionId);
includes("release-ledger.yaml", releaseLedger, "eas_submission: not_started_for_build_67");
includes(
  "release-ledger.yaml",
  releaseLedger,
  "phase: blocked_external_user_action_required"
);
includesOneOf(
  "release-ledger.yaml",
  releaseLedger,
  [
    "goal_status: blocked_external_user_action_required",
    "goal_status: resumed_blocked_audit_turn_1"
  ]
);
includes(
  "release-ledger.yaml",
  releaseLedger,
  "real_device_result: developer_build_1_0_3_66_launch_running_artifact_unproven"
);
includes("release-ledger.yaml", releaseLedger, "real_iphone_install_provenance: developer_app_not_testflight");
includes("release-ledger.yaml", releaseLedger, "real_iphone_artifact_identity: unproven_developer_install");
includes("release-ledger.yaml", releaseLedger, "app_review_state: not_submitted");
includes("release-ledger.yaml", releaseLedger, "public_release: \"1.0.2\"");
notIncludes(
  "scripts/invitehub-release-gate.sh",
  releaseGate,
  "ROOT:-",
  "Release gate trust root must not accept an environment override"
);
includes("scripts/invitehub-release-gate.sh", releaseGate, 'typeset -r ROOT="${SCRIPT_DIR:h}"');
includes("scripts/invitehub-release-gate.sh", releaseGate, "git -C \"$ROOT\" rev-parse --show-toplevel");
includes("scripts/invitehub-release-gate.sh", releaseGate, "ALLOW_RELEASE_FIXTURE_PATHS");
includes(
  "scripts/invitehub-release-gate.sh",
  releaseGate,
  "ALLOW_ONLINE_AUDIT"
);
includes(
  "scripts/invitehub-release-gate.sh",
  releaseGate,
  "- Status: blocked"
);
includes("scripts/invitehub-release-gate.sh", releaseGate, "exit 2");
includes("docs/app-store-connect-build46-packet.md", build46Packet, "Build 46 is not a valid App Store candidate");
includes("docs/app-store-connect-input-packet-build46.md", build46InputPacket, "Do not use it to select build 46");

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
notIncludes(".easignore", easIgnore, "\napp/\n", "Root .easignore must not exclude nested apps/mobile/app routes");
notIncludes(".easignore", easIgnore, "\napp/**\n", "Root .easignore must not exclude nested apps/mobile/app routes");
notIncludes(".easignore", easIgnore, "\nlib/\n", "Root .easignore must not exclude nested apps/mobile/lib modules");
notIncludes(".easignore", easIgnore, "\nlib/**\n", "Root .easignore must not exclude nested apps/mobile/lib modules");
includes(".easignore", easIgnore, "\n/app/\n");
includes(".easignore", easIgnore, "\n/lib/\n");
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
includes("docs/testflight-crash-triage-2026-05-07.md", crashTriageBuild42Failed, "Build `1.0.0 (42)` is not a valid release candidate");
includes("docs/testflight-crash-triage-2026-05-07.md", crashTriageBuild42Failed, "build42-crash-prompt.png");
includes("docs/testflight-crash-triage-2026-05-07.md", crashTriageBuild42Failed, "embedded frameworks: `hermesvm.framework` only");
includes("docs/testflight-crash-triage-2026-05-07.md", crashTriageBuild42Failed, "TurboModule startup");
includes("apps/mobile/package.json", mobilePackage, "\"main\": \"expo-router/entry\"");
includes("apps/mobile/app.json", mobileAppConfig, `"name": "${expectedCurrentCandidate.displayName}"`);
includes("apps/mobile/app.json", mobileAppConfig, `"version": "${expectedCurrentCandidate.appVersion}"`);
includes("apps/mobile/app.json", mobileAppConfig, `"CFBundleName": "${expectedCurrentCandidate.displayName}"`);
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
  `CURRENT_PROJECT_VERSION = ${currentNativeBuildNumber}`
);
includes("apps/mobile/ios/InviteHub/Info.plist", iosInfoPlist, "<key>CFBundleName</key>");
includes("apps/mobile/ios/InviteHub/Info.plist", iosInfoPlist, `<string>${expectedCurrentCandidate.displayName}</string>`);
includes("apps/mobile/ios/InviteHub/Info.plist", iosInfoPlist, `<string>${expectedCurrentCandidate.appVersion}</string>`);
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
console.log(`- Latest Built Candidate: ${expectedCurrentCandidate.appVersion} (${expectedCurrentCandidate.buildNumber})`);
console.log(`- Latest EAS Build: ${expectedCurrentCandidate.buildId}`);
console.log("- External Verdict: EAS Build 67 is FINISHED and its IPA identity is verified; it has not been uploaded to App Store Connect. Build 66 remains the latest uploaded TestFlight build.");
console.log("- Device Verdict: the installed developer app is still 1.0.3 (66); Build 67 has not been installed or smoke-tested.");
console.log("- Required follow-up: submit Build 67 to App Store Connect only with explicit approval, then install it through TestFlight and collect exact-build on-screen smoke evidence. Do not submit for App Review.");
