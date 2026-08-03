import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("release operation entrypoints", () => {
  it("runs candidate preflight before the local native build/install command", () => {
    const gate = read("scripts/invitehub-release-gate.sh");
    const preflight = gate.indexOf("verify-release-candidate.mjs build");
    const nativeBuild = gate.indexOf("--prefix apps/mobile run ios");

    expect(preflight).toBeGreaterThan(-1);
    expect(nativeBuild).toBeGreaterThan(preflight);
  });

  it("runs artifact preflight before simulator installation", () => {
    const capture = read("scripts/capture-store-screenshots.sh");
    const preflight = capture.indexOf("verify-release-candidate.mjs install --artifact");
    const install = capture.indexOf("simctl install");

    expect(preflight).toBeGreaterThan(-1);
    expect(install).toBeGreaterThan(preflight);
  });

  it("separates EAS build from upload and gates each operation", () => {
    const wrapper = read("scripts/invitehub-eas-release.sh");
    const buildPreflight = wrapper.indexOf("verify-release-candidate.mjs build");
    const build = wrapper.indexOf("eas build");
    const uploadPreflight = wrapper.indexOf("verify-release-candidate.mjs upload --artifact");
    const upload = wrapper.indexOf("eas submit");

    expect(build).toBeGreaterThan(buildPreflight);
    expect(upload).toBeGreaterThan(uploadPreflight);
    expect(wrapper).not.toContain("--auto-submit");
  });

  it("pins EAS to local exact versions without auto-increment", () => {
    const eas = JSON.parse(read("apps/mobile/eas.json"));

    expect(eas.cli.appVersionSource).toBe("local");
    expect(eas.build.production.autoIncrement).toBe(false);
    expect(eas.build.production.env.APP_BUNDLE_ID).toBe("com.invitehub.app");
  });
});
