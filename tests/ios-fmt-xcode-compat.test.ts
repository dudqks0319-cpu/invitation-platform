import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const helperPath = join(
  repositoryRoot,
  "apps/mobile/ios/scripts/fmt_xcode_compat.rb"
);
const podfileSource = readFileSync(
  join(repositoryRoot, "apps/mobile/ios/Podfile"),
  "utf8"
);
const podfileLockSource = readFileSync(
  join(repositoryRoot, "apps/mobile/ios/Podfile.lock"),
  "utf8"
);

const originalGuard =
  "#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L";
const patchedGuard = "#elif defined(__apple_build_version__)";

function makeFmtPod(headerSource = `${originalGuard}\n#  define FMT_USE_CONSTEVAL 0\n`) {
  const root = mkdtempSync(join(tmpdir(), "invitehub-fmt-compat-"));
  const headerDirectory = join(root, "include/fmt");
  mkdirSync(headerDirectory, { recursive: true });
  const headerPath = join(headerDirectory, "base.h");
  writeFileSync(headerPath, headerSource);
  return { root, headerPath };
}

function runHelper(podDirectory: string, version: string, xcode: string) {
  return spawnSync(
    "ruby",
    [
      helperPath,
      "--pod-dir",
      podDirectory,
      "--pod-version",
      version,
      "--xcode-version",
      xcode
    ],
    { encoding: "utf8" }
  );
}

describe("iOS fmt compatibility hook", () => {
  it("is wired into the Podfile after the React Native post-install hook", () => {
    expect(podfileSource).toContain(
      "require_relative './scripts/fmt_xcode_compat'"
    );
    expect(podfileSource).toContain("InviteHubFmtXcodeCompat.apply!");
    expect(podfileSource.indexOf("InviteHubFmtXcodeCompat.apply!")).toBeGreaterThan(
      podfileSource.indexOf("react_native_post_install(")
    );
  });

  it("keeps the deployment lockfile bound to the current Podfile", () => {
    const podfileChecksum = createHash("sha1").update(podfileSource).digest("hex");

    expect(podfileLockSource).toContain(
      `PODFILE CHECKSUM: ${podfileChecksum}`
    );
  });

  it("patches fmt 11.0.2 exactly once for Xcode 26.4 or newer", () => {
    const fixture = makeFmtPod();

    const firstRun = runHelper(fixture.root, "11.0.2", "26.6");
    expect(firstRun.status).toBe(0);
    expect(firstRun.stdout.trim()).toBe("patched");
    expect(readFileSync(fixture.headerPath, "utf8")).toContain(patchedGuard);
    expect(readFileSync(fixture.headerPath, "utf8")).not.toContain(originalGuard);

    const secondRun = runHelper(fixture.root, "11.0.2", "26.6");
    expect(secondRun.status).toBe(0);
    expect(secondRun.stdout.trim()).toBe("already_patched");
    expect(
      readFileSync(fixture.headerPath, "utf8").split(patchedGuard).length - 1
    ).toBe(1);
  });

  it("does not patch older Xcode or a different fmt version", () => {
    const olderXcode = makeFmtPod();
    const newerFmt = makeFmtPod();

    expect(runHelper(olderXcode.root, "11.0.2", "26.3").stdout.trim()).toBe(
      "skipped_xcode_version"
    );
    expect(runHelper(newerFmt.root, "12.1.0", "26.6").stdout.trim()).toBe(
      "skipped_fmt_version"
    );
    expect(readFileSync(olderXcode.headerPath, "utf8")).toContain(originalGuard);
    expect(readFileSync(newerFmt.headerPath, "utf8")).toContain(originalGuard);
  });

  it("fails closed when the pinned fmt header no longer has the expected guard", () => {
    const fixture = makeFmtPod("// unexpected fmt header\n");
    const result = runHelper(fixture.root, "11.0.2", "26.6");

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("expected Apple Clang guard was not found");
    expect(readFileSync(fixture.headerPath, "utf8")).toBe(
      "// unexpected fmt header\n"
    );
  });
});
