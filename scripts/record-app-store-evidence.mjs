#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  createEmptyEvidenceManifest,
  isKnownEvidenceKey,
  requiredExternalEvidence,
  validateEvidenceEntry
} from "./app-store-evidence-contract.mjs";

const root = process.cwd();
const evidencePath = "docs/app-store-external-evidence.json";
const templatePath = "docs/app-store-external-evidence.template.json";

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const name = token.slice(2);

    if (name === "list") {
      parsed.list = true;
      continue;
    }

    const value = argv[index + 1];

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for --${name}`);
    }

    parsed[name] = value;
    index += 1;
  }

  return parsed;
}

function loadManifest() {
  const fullEvidencePath = join(root, evidencePath);

  if (!existsSync(fullEvidencePath)) {
    mkdirSync(dirname(fullEvidencePath), { recursive: true });

    const fullTemplatePath = join(root, templatePath);
    if (existsSync(fullTemplatePath)) {
      copyFileSync(fullTemplatePath, fullEvidencePath);
    } else {
      writeFileSync(fullEvidencePath, JSON.stringify(createEmptyEvidenceManifest(), null, 2));
    }
  }

  return JSON.parse(readFileSync(fullEvidencePath, "utf8"));
}

function saveManifest(manifest) {
  writeFileSync(join(root, evidencePath), `${JSON.stringify(manifest, null, 2)}\n`);
}

function printList() {
  console.log("APP STORE EXTERNAL EVIDENCE KEYS");
  for (const { key, label } of requiredExternalEvidence) {
    console.log(`- ${key}: ${label}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list) {
    printList();
    return;
  }

  const key = args.key;

  if (!key || !isKnownEvidenceKey(key)) {
    throw new Error(`Unknown or missing --key. Run: node scripts/record-app-store-evidence.mjs --list`);
  }

  const entry = {
    status: args.status === undefined ? true : args.status === "true",
    capturedAt: args.capturedAt ?? new Date().toISOString(),
    evidence: args.evidence ?? "",
    artifact: args.artifact ?? ""
  };

  const { label } = requiredExternalEvidence.find((item) => item.key === key);
  const blockers = validateEvidenceEntry({ entry, evidencePath, key, label, root });

  if (blockers.length > 0) {
    console.error("APP STORE EVIDENCE RECORD RESULT");
    console.error("- Status: fail");
    for (const blocker of blockers) {
      console.error(`- ${blocker}`);
    }
    process.exit(1);
  }

  const manifest = loadManifest();
  manifest[key] = entry;
  saveManifest(manifest);

  console.log("APP STORE EVIDENCE RECORD RESULT");
  console.log("- Status: pass");
  console.log(`- Key: ${key}`);
  console.log(`- Evidence File: ${evidencePath}`);
}

try {
  main();
} catch (error) {
  console.error("APP STORE EVIDENCE RECORD RESULT");
  console.error("- Status: fail");
  console.error(`- ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
}
