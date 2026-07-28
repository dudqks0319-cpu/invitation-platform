import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const collectorPath = join(
  process.cwd(),
  "scripts/collect-testflight-device-evidence.sh"
);
const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("collect-testflight-device-evidence", () => {
  it("filters the running app by executable URL path", () => {
    const collector = readFileSync(collectorPath, "utf8");

    expect(collector).toContain(
      "executable.path ENDSWITH 'InviteHub.app/InviteHub'"
    );
    expect(collector).not.toContain("Name CONTAINS 'InviteHub'");
  });

  it("returns failure when a device capture command fails", () => {
    const root = mkdtempSync(join(tmpdir(), "invitehub-device-collector-"));
    const binDir = join(root, "bin");
    const outDir = join(root, "evidence");
    tempRoots.push(root);
    mkdirSync(binDir);

    const fakeXcrun = join(binDir, "xcrun");
    writeFileSync(
      fakeXcrun,
      [
        "#!/usr/bin/env bash",
        'json_path=""',
        "while [[ $# -gt 0 ]]; do",
        '  if [[ "$1" == "--json-output" ]]; then json_path="$2"; shift 2; else shift; fi',
        "done",
        'if [[ -n "$json_path" ]]; then printf \'%s\\n\' \'{\"info\":{\"outcome\":\"failure\"}}\' > \"$json_path\"; fi',
        "exit 23",
        ""
      ].join("\n")
    );
    chmodSync(fakeXcrun, 0o755);

    const result = spawnSync("bash", [collectorPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        OUT_DIR: outDir,
        PATH: `${binDir}:${process.env.PATH ?? ""}`
      }
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("ERROR: devices exited with 23");
    expect(result.stderr).toContain(
      "Status: fail (one or more device commands failed)"
    );
  });
});
