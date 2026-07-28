import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const scriptPath = join(
  process.cwd(),
  "scripts/verify-testflight-build66-evidence.mjs"
);
const tempRoots: string[] = [];

function makeEvidence() {
  const root = mkdtempSync(join(tmpdir(), "invitehub-build66-evidence-"));
  const evidenceDir = join(root, "evidence");
  tempRoots.push(root);
  mkdirSync(evidenceDir);

  const deviceIdentifier = "fixture-physical-iphone";
  const captures = {
    devices: {
      info: { outcome: "success" },
      result: {
        devices: [
          {
            identifier: deviceIdentifier,
            connectionProperties: { tunnelState: "connected" },
            hardwareProperties: {
              marketingName: "iPhone 12 Pro",
              reality: "physical"
            }
          }
        ]
      }
    },
    "lock-state": {
      info: { outcome: "success" },
      result: { deviceIdentifier }
    },
    "testflight-app": {
      info: { outcome: "success" },
      result: { apps: [], deviceIdentifier }
    },
    "invitehub-app": {
      info: { outcome: "success" },
      result: {
        apps: [
          {
            bundleIdentifier: "com.invitehub.app",
            bundleVersion: "66",
            version: "1.0.3"
          }
        ],
        deviceIdentifier
      }
    },
    "invitehub-processes": {
      info: { outcome: "success" },
      result: { deviceIdentifier, runningProcesses: [] }
    }
  };

  for (const [name, capture] of Object.entries(captures)) {
    writeFileSync(join(evidenceDir, `${name}.exit-code.txt`), "0\n");
    writeFileSync(
      join(evidenceDir, `${name}.json`),
      `${JSON.stringify(capture, null, 2)}\n`
    );
  }

  return evidenceDir;
}

function runVerifier(evidenceDir: string, ...args: string[]) {
  return spawnSync(process.execPath, [scriptPath, evidenceDir, ...args], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("verify-testflight-build66-evidence", () => {
  it("accepts exact Build 66 evidence from a connected physical iPhone", () => {
    const result = runVerifier(makeEvidence());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("- Status: pass");
    expect(result.stdout).toContain("- Model: iPhone 12 Pro");
    expect(result.stdout).toContain("- Version: 1.0.3");
    expect(result.stdout).toContain("- Build: 66");
    expect(result.stdout).toContain("- Device: redacted");
    expect(result.stdout).not.toContain("fixture-physical-iphone");
  });

  it("fails closed when a capture command did not succeed", () => {
    const evidenceDir = makeEvidence();
    writeFileSync(join(evidenceDir, "invitehub-app.exit-code.txt"), "1\n");

    const result = runVerifier(evidenceDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("invitehub-app command exited with 1");
  });

  it("rejects a stale installed build", () => {
    const evidenceDir = makeEvidence();
    const appPath = join(evidenceDir, "invitehub-app.json");
    const appCapture = JSON.parse(readFileSync(appPath, "utf8"));
    appCapture.result.apps[0].bundleVersion = "65";
    writeFileSync(appPath, `${JSON.stringify(appCapture, null, 2)}\n`);

    const result = runVerifier(evidenceDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("expected app build 66, found 65");
  });

  it("rejects evidence from a disconnected or non-physical device", () => {
    const evidenceDir = makeEvidence();
    const devicesPath = join(evidenceDir, "devices.json");
    const devicesCapture = JSON.parse(readFileSync(devicesPath, "utf8"));
    devicesCapture.result.devices[0].connectionProperties.tunnelState =
      "unavailable";
    writeFileSync(devicesPath, `${JSON.stringify(devicesCapture, null, 2)}\n`);

    const result = runVerifier(evidenceDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("was not connected when captured");
  });

  it("rejects stale evidence", () => {
    const evidenceDir = makeEvidence();
    const staleTime = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    utimesSync(
      join(evidenceDir, "invitehub-app.json"),
      staleTime,
      staleTime
    );

    const result = runVerifier(evidenceDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("invitehub-app capture is stale");
  });

  it("rejects a launch JSON failure even when the command exit code is zero", () => {
    const evidenceDir = makeEvidence();
    writeFileSync(join(evidenceDir, "launch.exit-code.txt"), "0\n");
    writeFileSync(
      join(evidenceDir, "launch.json"),
      `${JSON.stringify({ info: { outcome: "failure" } })}\n`
    );
    writeFileSync(
      join(evidenceDir, "invitehub-processes-after-launch.exit-code.txt"),
      "0\n"
    );
    writeFileSync(
      join(evidenceDir, "invitehub-processes-after-launch.json"),
      `${JSON.stringify({
        info: { outcome: "success" },
        result: { runningProcesses: [{ name: "InviteHub" }] }
      })}\n`
    );

    const result = runVerifier(evidenceDir, "--require-launch");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("launch JSON outcome is not success");
  });

  it("rejects an empty post-launch process list", () => {
    const evidenceDir = makeEvidence();
    writeFileSync(join(evidenceDir, "launch.exit-code.txt"), "0\n");
    writeFileSync(
      join(evidenceDir, "launch.json"),
      `${JSON.stringify({ info: { outcome: "success" } })}\n`
    );
    writeFileSync(
      join(evidenceDir, "invitehub-processes-after-launch.exit-code.txt"),
      "0\n"
    );
    writeFileSync(
      join(evidenceDir, "invitehub-processes-after-launch.json"),
      `${JSON.stringify({
        info: { outcome: "success" },
        result: { runningProcesses: [] }
      })}\n`
    );

    const result = runVerifier(evidenceDir, "--require-launch");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "no InviteHub process was running after launch"
    );
  });
});
