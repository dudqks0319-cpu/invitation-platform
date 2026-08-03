import { describe, expect, it } from "vitest";
import { validateReleaseCandidate } from "./verify-release-candidate.mjs";

const sha = "1111111111111111111111111111111111111111";

function makeLedger(overrides: Record<string, string | boolean> = {}) {
  const values = {
    version: "1.1.0",
    buildNumber: "73",
    bundleId: "com.invitehub.app",
    gitSha: sha,
    branch: "agent/release-candidate",
    sourceState: "clean_committed",
    selected: true,
    evidencePath: "docs/release-candidate-evidence.json",
    ...overrides
  };

  return `
bundle_id: "${values.bundleId}"
version: "${values.version}"
build_number: "${values.buildNumber}"
git_sha: "${values.gitSha}"
branch: "${values.branch}"
public:
  version: "1.0.2"
selected_candidate:
  selected: ${values.selected}
  version: "${values.version}"
  build_number: "${values.buildNumber}"
  bundle_id: "${values.bundleId}"
  git_sha: "${values.gitSha}"
  branch: "${values.branch}"
  source_state: ${values.sourceState}
  evidence_path: "${values.evidencePath}"
`;
}

function makeEvidence(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    capturedAt: "2026-08-03T18:00:00+09:00",
    approvalReference: "user-confirmation:release-candidate-approved-20260803",
    selectedCandidate: {
      version: "1.1.0",
      buildNumber: "73",
      bundleId: "com.invitehub.app",
      gitSha: sha,
      branch: "agent/release-candidate",
      sourceState: "clean_committed"
    },
    sourceEvidence: {
      headSha: sha,
      branch: "agent/release-candidate",
      statusPorcelain: "",
      nativeIdentity: {
        version: "1.1.0",
        buildNumber: "73",
        bundleId: "com.invitehub.app"
      }
    },
    artifact: {
      path: "artifacts/osamosam-1.1.0-73.ipa",
      sha256: "a".repeat(64),
      version: "1.1.0",
      buildNumber: "73",
      bundleId: "com.invitehub.app",
      gitSha: sha
    },
    ...overrides
  };
}

function makeRepository(overrides: Record<string, unknown> = {}) {
  return {
    headSha: sha,
    branch: "agent/release-candidate",
    statusPorcelain: "",
    appVersion: "1.1.0",
    nativeIdentity: {
      version: "1.1.0",
      buildNumber: "73",
      bundleId: "com.invitehub.app"
    },
    eas: {
      appVersionSource: "local",
      productionBundleId: "com.invitehub.app",
      distribution: "store",
      autoIncrement: false
    },
    ...overrides
  };
}

function validate({
  ledgerText = makeLedger(),
  evidence = makeEvidence(),
  repository = makeRepository(),
  operation = "build",
  artifact
}: {
  ledgerText?: string;
  evidence?: ReturnType<typeof makeEvidence> | null;
  repository?: ReturnType<typeof makeRepository>;
  operation?: "build" | "install" | "upload";
  artifact?: Record<string, unknown>;
} = {}) {
  return validateReleaseCandidate({
    ledgerText,
    evidence,
    repository,
    operation,
    artifact
  });
}

describe("release candidate identity preflight", () => {
  it("allows an arbitrary clean, explicitly selected, evidence-bound candidate", () => {
    expect(validate()).toEqual([]);
  });

  it("rejects stale native Build 52 even when the surrounding claims agree", () => {
    const nativeIdentity = {
      version: "1.1.0",
      buildNumber: "52",
      bundleId: "com.invitehub.app"
    };
    const evidence = makeEvidence({
      selectedCandidate: {
        ...makeEvidence().selectedCandidate,
        buildNumber: "52"
      },
      sourceEvidence: {
        ...makeEvidence().sourceEvidence,
        nativeIdentity
      }
    });

    expect(
      validate({
        ledgerText: makeLedger({ buildNumber: "52" }),
        evidence,
        repository: makeRepository({ nativeIdentity })
      })
    ).toContain("native Build 52 is a blocked stale build");
  });

  it("rejects a development bundle for a Store candidate", () => {
    const bundleId = "com.invitehub.app.dev";
    expect(
      validate({
        ledgerText: makeLedger({ bundleId }),
        evidence: makeEvidence({
          selectedCandidate: {
            ...makeEvidence().selectedCandidate,
            bundleId
          }
        })
      })
    ).toContain("selected bundle must equal the canonical Store bundle com.invitehub.app");
  });

  it("rejects live version/build identity drift", () => {
    expect(
      validate({
        repository: makeRepository({
          nativeIdentity: {
            version: "1.1.0",
            buildNumber: "74",
            bundleId: "com.invitehub.app"
          }
        })
      })
    ).toContain("native build number does not match the selected candidate");
  });

  it("rejects SHA drift and a dirty worktree", () => {
    const blockers = validate({
      repository: makeRepository({
        headSha: "2222222222222222222222222222222222222222",
        statusPorcelain: " M apps/mobile/app.json"
      })
    });

    expect(blockers).toContain("HEAD SHA does not match the selected candidate");
    expect(blockers).toContain("release worktree is dirty");
  });

  it("rejects identity-affecting environment overrides", () => {
    expect(
      validate({
        repository: makeRepository({
          identityEnvironmentOverrides: ["APP_BUNDLE_ID", "EAS_NO_VCS"]
        })
      })
    ).toContain(
      "release identity environment overrides are forbidden: APP_BUNDLE_ID, EAS_NO_VCS"
    );
  });

  it("rejects an unselected or missing ledger candidate", () => {
    expect(validate({ ledgerText: makeLedger({ selected: false }) })).toContain(
      "selected_candidate.selected must be true"
    );
    expect(validate({ ledgerText: makeLedger().replace(/selected_candidate:[\s\S]*/, "") })).toContain(
      "release-ledger.yaml is missing selected_candidate"
    );
  });

  it("rejects ledger-only claims without raw candidate evidence", () => {
    expect(validate({ evidence: null })).toContain(
      "selected candidate raw evidence is missing"
    );
  });

  it("rejects remote version allocation or auto-increment for an exact candidate", () => {
    const blockers = validate({
      repository: makeRepository({
        eas: {
          appVersionSource: "remote",
          productionBundleId: "com.invitehub.app",
          distribution: "store",
          autoIncrement: true
        }
      })
    });

    expect(blockers).toContain("EAS appVersionSource must be local for exact candidate binding");
    expect(blockers).toContain("EAS production autoIncrement must be false for exact candidate binding");
  });

  it("rejects install/upload when artifact identity or hash is not evidence-bound", () => {
    const blockers = validate({
      operation: "upload",
      artifact: {
        path: "artifacts/osamosam-1.1.0-73.ipa",
        sha256: "b".repeat(64),
        version: "1.1.0",
        buildNumber: "73",
        bundleId: "com.invitehub.app"
      }
    });

    expect(blockers).toContain("artifact SHA-256 does not match raw evidence");
  });
});
