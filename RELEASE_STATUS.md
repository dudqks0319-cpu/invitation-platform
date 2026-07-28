# 오삼오삼 iOS 릴리스 상태

Canonical status: [docs/current-release-state.md](docs/current-release-state.md)

- Candidate source: `1.0.3 (66)` at `533aec3`; EAS Production build
  `b1a187d7-0776-4dd0-b648-9685edbb7760` finished
- EAS live check (2026-07-28): Build 66 and submission
  `90000462-1a28-424d-a496-bef9ad8d7f41` are `FINISHED`; version, build
  number, source SHA, build ID, and submission ID match the ledger
- EAS artifact: 176,900,378 bytes; SHA-256
  `b065a732e3c51963bad999c9acd248c34ec1c5b7f43b816d643e588dcace4854`
- App Store Connect: Build 66 upload is confirmed, but current Apple processing
  and TestFlight-group state could not be refreshed because API credentials are
  absent and both available browser sessions are signed out
- Real device: iPhone 12 Pro has an app whose metadata matches `1.0.3 (66)`;
  it is marked as a developer app and TestFlight is not installed, so this is
  not proof of the EAS IPA binary or TestFlight-group installation
- Exact-build launch: blocked because the connected iPhone was locked
- App Review: not submitted
- Public App Store: still `1.0.2`
- Dependency audit: runtime and full-tree offline audits both report 0; a fresh
  online advisory lookup was not authorized, so registry-current CVE coverage
  remains open
- Local release controls: `105/105` test files and `485/485` tests pass;
  root/mobile lint and typecheck pass; Build 66 packet verifier passes 324 checks.
  The repository release gate now defaults to the active worktree and reports
  `blocked` when the online audit or iOS build is skipped instead of returning
  a false pass. It rejects alternate trust-root and canonical-evidence path
  environment overrides. Device metadata evidence fails closed on stale
  capture, capture/launch errors, unsuccessful launch JSON, and an empty
  post-launch process list

Do not select Builds 62, 63, or 64 for App Review. Build 66 is uploaded but not
submitted for review. Unlock the connected iPhone and sign in to App Store
Connect before continuing read-only state checks. Proceed to App Review only
after TestFlight provenance, exact-build smoke, registry-current dependency
review, and separate explicit submission approval are complete.
