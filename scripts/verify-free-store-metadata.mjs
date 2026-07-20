#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredSnippets = [
  {
    file: "docs/store-submission-metadata.md",
    snippets: [
      "Use this version only for a free-only submission",
      "현재 제출 빌드에서는 사진 없는 무료 발행만 노출합니다.",
      "아직 노출하지 않는 유료 기능 세부 정보는 Review Notes에 쓰지 않습니다.",
      "Free-only App Privacy labels",
      "현재 무료-only 제출에서는 구매 데이터 수집 없음.",
      "Paid IAP submission version",
      "Paid IAP activation values"
    ]
  },
  {
    file: "docs/apple-review.md",
    snippets: [
      "무료-only 제출",
      "첫 제출 빌드는 사진 없는 무료 발행만 제공",
      "아직 노출하지 않는 유료 기능 세부 정보는 Review Notes에 쓰지 않음",
      "유료 IAP 발행권 제출"
    ]
  }
];

const freeOnlySections = [
  {
    file: "docs/store-submission-metadata.md",
    sectionStart: "### Description",
    sectionEnd: "Paid IAP submission version"
  },
  {
    file: "docs/apple-review.md",
    sectionStart: "### 무료-only 제출",
    sectionEnd: "### 유료 IAP 발행권 제출"
  }
];

const forbiddenFreeOnlyPatterns = [
  { pattern: /com\.invitehub\.publish\.credit/g, reason: "free-only metadata must not expose IAP product id" },
  { pattern: /publish_credit_1/g, reason: "free-only metadata must not expose RevenueCat package id" },
  { pattern: /인앱결제|In-App Purchase|IAP 상품/g, reason: "free-only metadata must not describe active or future IAP" },
  { pattern: /발행권\s*구매|구매\s*복원|결제\s*성공|3,300원/g, reason: "free-only metadata must not describe paid purchase UX" },
  { pattern: /사진\s*포함\s*발행권|유료\s*사진\s*발행/g, reason: "free-only metadata must not advertise hidden paid features" },
  { pattern: /Purchases\s*:/g, reason: "free-only privacy labels must not declare purchases" },
  { pattern: /결제\s*트랜잭션|결제\s*검증|인앱상품/g, reason: "free-only privacy labels must not describe purchase identifiers" }
];

const paidSectionRequirements = [
  {
    file: "docs/store-submission-metadata.md",
    sectionStart: "Paid IAP submission version",
    snippets: [
      "com.invitehub.publish.credit",
      "publish_credit_1",
      "구매 복원",
      "RevenueCat webhook"
    ]
  },
  {
    file: "docs/apple-review.md",
    sectionStart: "### 유료 IAP 발행권 제출",
    snippets: [
      "com.invitehub.publish.credit",
      "구매 복원",
      "RevenueCat webhook"
    ]
  }
];

const failures = [];

function read(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    failures.push(`${relativePath}: missing file`);
    return "";
  }

  return readFileSync(path, "utf8");
}

function sectionOf(content, start, end) {
  const startIndex = content.indexOf(start);
  if (startIndex < 0) {
    return "";
  }

  const endIndex = end ? content.indexOf(end, startIndex) : -1;
  return content.slice(startIndex, endIndex > startIndex ? endIndex : content.length);
}

for (const { file, snippets } of requiredSnippets) {
  const content = read(file);
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      failures.push(`${file}: missing free store metadata snippet: ${snippet}`);
    }
  }
}

for (const { file, sectionEnd, sectionStart } of freeOnlySections) {
  const content = read(file);
  const section = sectionOf(content, sectionStart, sectionEnd);
  if (!section) {
    failures.push(`${file}: missing free-only metadata section ${sectionStart}`);
    continue;
  }

  const linesBeforeSection = content.slice(0, content.indexOf(section)).split(/\r?\n/).length - 1;
  const lines = section.split(/\r?\n/);
  for (const { pattern, reason } of forbiddenFreeOnlyPatterns) {
    for (const match of section.matchAll(pattern)) {
      const line = section.slice(0, match.index ?? 0).split(/\r?\n/).length;
      failures.push(`${file}:${linesBeforeSection + line}: ${reason}: ${lines[line - 1] ?? match[0]}`);
    }
  }
}

for (const { file, sectionStart, snippets } of paidSectionRequirements) {
  const content = read(file);
  const section = sectionOf(content, sectionStart);
  if (!section) {
    failures.push(`${file}: missing paid metadata section ${sectionStart}`);
    continue;
  }

  for (const snippet of snippets) {
    if (!section.includes(snippet)) {
      failures.push(`${file}: paid metadata section must retain snippet: ${snippet}`);
    }
  }
}

if (failures.length > 0) {
  console.error("FREE STORE METADATA RESULT");
  console.error("- Status: fail");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("FREE STORE METADATA RESULT");
console.log("- Status: pass");
console.log("- Free-only public metadata does not expose hidden paid/IAP details");
console.log("- Free-only privacy labels exclude purchases");
console.log("- Paid IAP metadata remains available in its own section for later activation");
