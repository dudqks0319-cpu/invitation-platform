#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const defaultFiles = [
  "apps/mobile/app/builder/preview.tsx",
  "apps/mobile/components/payments/StorePurchaseCard.tsx",
  "apps/mobile/hooks/useStorePurchase.ts"
];

const files = (process.env.MOBILE_IAP_COPY_FILES ?? defaultFiles.join(","))
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const forbiddenPatterns = [
  { pattern: /웹에서\s*더\s*저렴/g, reason: "web discount inducement" },
  { pattern: /웹\s*결제|웹결제/g, reason: "web payment inducement" },
  { pattern: /외부\s*결제/g, reason: "external payment inducement" },
  { pattern: /카카오페이로\s*결제/g, reason: "KakaoPay app-feature payment CTA" },
  { pattern: /토스(?:페이)?로\s*결제/g, reason: "Toss app-feature payment CTA" },
  { pattern: /계좌이체\s*문의/g, reason: "bank-transfer payment CTA" },
  { pattern: /PortOne|포트원|PG\s*결제/g, reason: "third-party payment provider CTA" }
];

const failures = [];

for (const file of files) {
  const path = join(root, file);
  if (!existsSync(path)) {
    failures.push(`${file}: file missing`);
    continue;
  }

  const content = readFileSync(path, "utf8");
  for (const { pattern, reason } of forbiddenPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const before = content.slice(0, match.index ?? 0);
      const line = before.split(/\r?\n/).length;
      failures.push(`${file}:${line}: ${reason}: ${match[0]}`);
    }
  }
}

if (failures.length > 0) {
  console.error("MOBILE IAP COPY RESULT");
  console.error("- Status: fail");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("MOBILE IAP COPY RESULT");
console.log("- Status: pass");
console.log("- Checked Files:");
for (const file of files) {
  console.log(`  - ${file}`);
}
