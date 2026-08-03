import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const scriptPath = resolve(root, "scripts/invitehub-release-gate.sh");
const tempRoots: string[] = [];

function runGate(
  environment: Record<string, string> = {},
  failMatch = ""
) {
  const tempRoot = mkdtempSync(join(tmpdir(), "osamosam-release-gate-"));
  const binDir = join(tempRoot, "bin");
  const outsideDir = join(tempRoot, "outside");
  const commandLog = join(tempRoot, "commands.log");
  tempRoots.push(tempRoot);
  mkdirSync(binDir);
  mkdirSync(outsideDir);

  const stub = [
    "#!/bin/sh",
    'printf "%s|%s|%s\\n" "$PWD" "${0##*/}" "$*" >> "$COMMAND_LOG"',
    'if [ -n "${FAIL_MATCH:-}" ] && case "$*" in *"$FAIL_MATCH"*) true;; *) false;; esac; then',
    '  exit "${FAIL_CODE:-17}"',
    "fi",
    "exit 0",
    ""
  ].join("\n");

  for (const command of ["npm", "npx", "node"]) {
    const path = join(binDir, command);
    writeFileSync(path, stub);
    chmodSync(path, 0o755);
  }

  const result = spawnSync("/bin/zsh", [scriptPath], {
    cwd: outsideDir,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${binDir}:/usr/bin:/bin`,
      COMMAND_LOG: commandLog,
      FAIL_MATCH: failMatch,
      ...environment
    }
  });

  return {
    ...result,
    commands: existsSync(commandLog) ? readFileSync(commandLog, "utf8") : ""
  };
}

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    rmSync(tempRoot, { force: true, recursive: true });
  }
});

describe("invitehub release gate", () => {
  it("uses the active worktree, stays offline by default, and blocks", () => {
    const result = runGate({ SKIP_IOS_RELEASE_BUILD: "1" });

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("- Status: blocked");
    expect(result.commands.split("\n")[0]).toBe(
      `${root}|node|scripts/verify-release-candidate.mjs build`
    );
    expect(result.commands).toContain(
      `${root}|npm|audit --omit=dev --offline`
    );
    expect(result.commands).toContain(`${root}|npm|audit --offline`);
    expect(result.commands).not.toContain("audit --audit-level=high");
  });

  it("blocks when audit and iOS build are explicitly skipped", () => {
    const result = runGate({
      SKIP_AUDIT: "1",
      SKIP_IOS_RELEASE_BUILD: "1"
    });

    expect(result.status).toBe(2);
    expect(result.stdout).toContain("dependency audit skipped");
    expect(result.commands).not.toContain("|npm|audit ");
  });

  it("passes only when the online audit is authorized and all commands succeed", () => {
    const result = runGate({ ALLOW_ONLINE_AUDIT: "1" });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("- Status: pass");
    expect(result.commands).toContain(`${root}|npm|audit --audit-level=high`);
    expect(result.commands).toContain(
      `${root}|npm|--prefix apps/mobile run ios -- --device iPhone 17 --configuration Release --no-bundler`
    );
  });

  it("propagates a failed authorized audit without printing a pass", () => {
    const result = runGate(
      { ALLOW_ONLINE_AUDIT: "1" },
      "audit --audit-level=high"
    );

    expect(result.status).toBe(17);
    expect(result.stdout).not.toContain("- Status: pass");
  });

  it("stops at candidate preflight before lint, build, install, or upload commands", () => {
    const result = runGate(
      { ALLOW_ONLINE_AUDIT: "1" },
      "verify-release-candidate.mjs build"
    );

    expect(result.status).toBe(17);
    expect(result.stdout).not.toContain("- Status: pass");
    expect(result.commands.trim()).toBe(
      `${root}|node|scripts/verify-release-candidate.mjs build`
    );
  });

  it("rejects evidence-path environment overrides before running commands", () => {
    const result = runGate({
      RELEASE_STATUS_PATH: "/tmp/crafted-release-status.md"
    });

    expect(result.status).toBe(64);
    expect(result.stderr).toContain(
      "Release evidence path overrides are forbidden"
    );
    expect(result.commands).toBe("");
  });
});
