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
  it("accepts the canonical Build 66 release state", () => {
    const result = runVerifier();

    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("- Status: pass");
    expect(result.stdout).toContain("- Latest Built Candidate: 1.0.3 (66)");
    expect(result.stdout).toContain("current App Store Connect and TestFlight-group state is unverified");
    expect(result.stdout).toContain("metadata is installed");
  });

  it("rejects RELEASE_STATUS artifact identity drift", () => {
    const path = mutatedCopy(
      "RELEASE_STATUS.md",
      "b065a732e3c51963bad999c9acd248c34ec1c5b7f43b816d643e588dcace4854",
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
      'artifact_bytes: 176900378',
      'artifact_bytes: 176900379'
    );

    const result = runVerifier({ RELEASE_LEDGER_PATH: path });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "release-ledger.yaml: expected to include artifact_bytes: 176900378"
    );
  });

  it("rejects an exact-build-installed claim without artifact provenance", () => {
    const path = mutatedCopy(
      "release-ledger.yaml",
      "phase: blocked_external_user_action_required",
      "phase: exact_build_installed_device_smoke_blocked"
    );

    const result = runVerifier({ RELEASE_LEDGER_PATH: path });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "release-ledger.yaml: expected to include phase: blocked_external_user_action_required"
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
