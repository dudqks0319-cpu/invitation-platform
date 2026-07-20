#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredSnippets = [
  {
    file: ".env.example",
    snippets: ["NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false"]
  },
  {
    file: "apps/mobile/.env.example",
    snippets: ["EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false"]
  },
  {
    file: "lib/release-flags.ts",
    snippets: ["process.env.NEXT_PUBLIC_ENABLE_PAID_PUBLISH", "false"]
  },
  {
    file: "apps/mobile/lib/release-flags.ts",
    snippets: ["process.env.EXPO_PUBLIC_ENABLE_PAID_PUBLISH", "false"]
  },
  {
    file: "apps/mobile/react-native.config.js",
    snippets: [
      "if (!paidPublishingEnabled)",
      "\"react-native-purchases\"",
      "ios: null",
      "android: null"
    ]
  },
  {
    file: "apps/mobile/app/builder/preview.tsx",
    snippets: [
      "if (!paidPublishingEnabled)",
      "setStorePurchaseCard(null)",
      "PAID_PUBLISH_DISABLED_MESSAGE",
      "사진 발행 미지원",
      "이번 무료 베타에서는 사진 없는 공개 링크 발행만 제공합니다."
    ]
  },
  {
    file: "docs/store-submission-metadata.md",
    snippets: [
      "Use this version only for a free-only submission",
      "현재 App Store 무료-only 제출에서는 유료 사진 발행을 비활성화합니다.",
      "Free-only App Privacy labels",
      "현재 무료-only 제출에서는 구매 데이터 수집 없음.",
      "Paid IAP App Privacy additions"
    ]
  },
  {
    file: "docs/apple-review.md",
    snippets: [
      "무료-only 제출",
      "첫 제출 빌드는 사진 없는 무료 발행만 제공"
    ]
  }
];

const forbiddenActivePaidCopy = [
  {
    file: "docs/store-submission-metadata.md",
    sectionStart: "Use this version only for a free-only submission",
    sectionEnd: "Paid IAP submission version",
    patterns: [
      { pattern: /현재\s*제출\s*버전은[^.\n]*(유료|결제|발행권)/g, reason: "free submission copy must not claim active paid publishing" }
    ]
  },
  {
    file: "docs/apple-review.md",
    sectionStart: "### 무료-only 제출",
    sectionEnd: "### 유료 IAP 발행권 제출",
    patterns: [
      { pattern: /발행권은 Apple 인앱결제/g, reason: "free-only review notes must not describe active IAP purchase flow" }
    ]
  },
  {
    file: "docs/store-submission-metadata.md",
    sectionStart: "Free-only App Privacy labels",
    sectionEnd: "Paid IAP App Privacy additions",
    patterns: [
      { pattern: /Purchases\s*:/g, reason: "free-only App Privacy labels must not declare purchase data collection" },
      { pattern: /결제\s*트랜잭션|결제\s*검증|인앱상품/g, reason: "free-only App Privacy labels must not describe paid purchase identifiers" }
    ]
  }
];

const forbiddenNativePaidArtifacts = [
  {
    file: "apps/mobile/ios/Podfile.lock",
    patterns: [
      { pattern: /RNPurchases|RevenueCat|PurchasesHybridCommon/g, reason: "free-only iOS Pods must not include RevenueCat native purchases" }
    ]
  },
  {
    file: "apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj",
    patterns: [
      { pattern: /RNPurchases|RevenueCat|PurchasesHybridCommon/g, reason: "free-only iOS project must not copy RevenueCat native bundles" }
    ]
  }
];

const forbiddenFreeBetaUserCopy = [
  {
    file: "apps/mobile/app/builder/preview.tsx",
    patterns: [
      { pattern: /App Store 상품 준비 후 다시 활성화합니다\./g, reason: "free beta UI must not advertise future paid App Store activation" },
      { pattern: /현재 제출 버전에서는 사진 없는 무료 발행만 제공합니다\. 사진 포함 발행권/g, reason: "free beta UI must not present disabled photos as a paid pass" }
    ]
  },
  {
    file: "apps/mobile/lib/release-flags.ts",
    patterns: [
      { pattern: /준비 중입니다/g, reason: "free beta disabled-photo copy must be explicit unsupported-free-beta copy" }
    ]
  }
];

const failures = [];

function read(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    failures.push(`${relativePath}: file missing`);
    return "";
  }

  return readFileSync(path, "utf8");
}

for (const { file, snippets } of requiredSnippets) {
  const content = read(file);
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      failures.push(`${file}: missing free-only release snippet: ${snippet}`);
    }
  }
}

for (const { file, patterns, sectionEnd, sectionStart } of forbiddenActivePaidCopy) {
  const content = read(file);
  const sectionStartIndex = sectionStart ? content.indexOf(sectionStart) : 0;
  const sectionEndIndex = sectionEnd && sectionStartIndex >= 0 ? content.indexOf(sectionEnd, sectionStartIndex) : -1;
  const scanStart = sectionStartIndex >= 0 ? sectionStartIndex : 0;
  const scanEnd = sectionEndIndex > scanStart ? sectionEndIndex : content.length;
  const scanContent = content.slice(scanStart, scanEnd);
  const lines = content.split(/\r?\n/);
  for (const { pattern, reason } of patterns) {
    for (const match of scanContent.matchAll(pattern)) {
      const absoluteIndex = scanStart + (match.index ?? 0);
      const before = content.slice(0, absoluteIndex);
      const line = before.split(/\r?\n/).length;
      failures.push(`${file}:${line}: ${reason}: ${lines[line - 1] ?? match[0]}`);
    }
  }
}

for (const { file, patterns } of forbiddenNativePaidArtifacts) {
  const content = read(file);
  const lines = content.split(/\r?\n/);
  for (const { pattern, reason } of patterns) {
    for (const match of content.matchAll(pattern)) {
      const before = content.slice(0, match.index ?? 0);
      const line = before.split(/\r?\n/).length;
      failures.push(`${file}:${line}: ${reason}: ${lines[line - 1] ?? match[0]}`);
    }
  }
}

for (const { file, patterns } of forbiddenFreeBetaUserCopy) {
  const content = read(file);
  const lines = content.split(/\r?\n/);
  for (const { pattern, reason } of patterns) {
    for (const match of content.matchAll(pattern)) {
      const before = content.slice(0, match.index ?? 0);
      const line = before.split(/\r?\n/).length;
      failures.push(`${file}:${line}: ${reason}: ${lines[line - 1] ?? match[0]}`);
    }
  }
}

if (failures.length > 0) {
  console.error("FREE-ONLY RELEASE RESULT");
  console.error("- Status: fail");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("FREE-ONLY RELEASE RESULT");
console.log("- Status: pass");
console.log("- Paid publish flags default disabled");
console.log("- RevenueCat native module is excluded unless paid publishing is explicitly enabled");
console.log("- iOS free-only native project excludes RevenueCat purchase pods and bundles");
console.log("- Free-only App Review copy is present");
