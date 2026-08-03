import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tempRoots: string[] = [];

function runVerifier(env: Record<string, string> = {}) {
  const usesFixturePath = Object.keys(env).some((name) =>
    name.endsWith("_PATH")
  );
  return spawnSync(
    process.execPath,
    ["scripts/verify-app-store-packet.mjs"],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        ...(usesFixturePath
          ? {
              NODE_ENV: "test",
              ALLOW_RELEASE_FIXTURE_PATHS: "1"
            }
          : {}),
        ...env
      }
    }
  );
}

function mutatedCopy(
  relativePath: string,
  from: string,
  to: string
) {
  const tempRoot = mkdtempSync(join(tmpdir(), "osamosam-packet-verifier-"));
  tempRoots.push(tempRoot);
  const outputPath = join(tempRoot, relativePath.replaceAll("/", "-"));
  const source = readFileSync(resolve(root, relativePath), "utf8");
  expect(source).toContain(from);
  writeFileSync(outputPath, source.replace(from, to));
  return outputPath;
}

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    rmSync(tempRoot, { force: true, recursive: true });
  }
});

describe("App Store packet verifier", () => {
  it("accepts source-bound Build 69 while keeping its SHA and upload unbound", () => {
    const result = runVerifier();

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("- Status: pass");
    expect(result.stdout).toContain("- Latest Source Identity: 1.0.3 (69) / com.invitehub.app / Git SHA UNBOUND/PENDING");
    expect(result.stdout).toContain("highest production Build 68 and Build 69 count 0");
    expect(result.stdout).toContain("Build 69 is source-bound only");
  });

  it("rejects RELEASE_STATUS artifact identity drift", () => {
    const path = mutatedCopy(
      "RELEASE_STATUS.md",
      "3ba0f27c4250be1ae794287b951508e0b82ea8efb76fd98d8cf7454619a86324",
      "0".repeat(64)
    );

    const result = runVerifier({ RELEASE_STATUS_PATH: path });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("RELEASE_STATUS.md: expected to include");
  });

  it("rejects canonical App Review state drift", () => {
    const path = mutatedCopy(
      "docs/current-release-state.md",
      "App Review state | Not submitted",
      "App Review state | Submitted"
    );

    const result = runVerifier({ CURRENT_RELEASE_STATE_PATH: path });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "docs/current-release-state.md: expected to include App Review state | Not submitted"
    );
  });

  it("rejects release-ledger artifact identity drift", () => {
    const path = mutatedCopy(
      "release-ledger.yaml",
      'artifact_bytes: 176918411',
      'artifact_bytes: 176918412'
    );

    const result = runVerifier({ RELEASE_LEDGER_PATH: path });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "release-ledger.yaml: expected to include artifact_bytes: 176918411"
    );
  });

  it("rejects an exact-build-installed claim without artifact provenance", () => {
    const path = mutatedCopy(
      "release-ledger.yaml",
      "phase: blocked_pending_clean_candidate_sha",
      "phase: exact_build_installed_device_smoke_blocked"
    );

    const result = runVerifier({ RELEASE_LEDGER_PATH: path });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "release-ledger.yaml: expected to include phase: blocked_pending_clean_candidate_sha"
    );
  });

  it("rejects canonical evidence path overrides outside the explicit test fixture lane", () => {
    const result = runVerifier({
      NODE_ENV: "production",
      RELEASE_STATUS_PATH: resolve(root, "RELEASE_STATUS.md"),
      ALLOW_RELEASE_FIXTURE_PATHS: "0"
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "RELEASE_STATUS_PATH is test-only and requires NODE_ENV=test with ALLOW_RELEASE_FIXTURE_PATHS=1"
    );
  });
});
