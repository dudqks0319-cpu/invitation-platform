# 오삼오삼 iOS 릴리스 상태

Canonical status: [docs/current-release-state.md](docs/current-release-state.md)

- Candidate source: `1.0.3 (67)` at `0196fb4`; EAS Production build
  `616d9c95-7189-4a76-8751-9d8ed947c833` finished
- EAS artifact: 176,900,384 bytes; SHA-256
  `356de45d57c46bbf31f88a63cc743a193c5dd29490da310d3dce1409f8f0482e`
- Embedded identity: `오삼오삼`, `com.invitehub.app`, `1.0.3 (67)`,
  non-exempt encryption false
- App Store Connect: Build 67 has not been uploaded. Build 66 remains the
  latest uploaded/TestFlight candidate under completed submission
  `90000462-1a28-424d-a496-bef9ad8d7f41`
- Duplicate cleanup: development app `InviteHub (76e945)` /
  `com.invitehub.app.dev` was moved to deleted apps; its iPhone Build 52 was
  uninstalled
- Real device: iPhone 12 Pro has an app whose metadata matches `1.0.3 (66)`;
  it is marked as a developer app and TestFlight is not installed, so this is
  not proof of the EAS IPA binary or TestFlight-group installation
- Build 66 developer-install launch: passed; Build 67 exact-build launch is not tested
- App Review: not submitted
- Public App Store: still `1.0.2`
- Dependency audit: runtime and full-tree offline audits both report 0; a fresh
  online advisory lookup was not authorized, so registry-current CVE coverage
  remains open
- Local release controls: `105/105` test files and `485/485` tests pass;
  root/mobile lint and typecheck pass; current packet verifier passes 328 checks.
  The repository release gate now defaults to the active worktree and reports
  `blocked` when the online audit or iOS build is skipped instead of returning
  a false pass. It rejects alternate trust-root and canonical-evidence path
  environment overrides. Device metadata evidence fails closed on stale
  capture, capture/launch errors, unsuccessful launch JSON, and an empty
  post-launch process list

Do not select Builds 62, 63, 64, or 66 for App Review. Build 67 is built but
not uploaded or submitted. Upload Build 67 only with explicit approval, then
proceed to App Review only after TestFlight provenance, exact-build smoke,
registry-current dependency review, and separate explicit submission approval
are complete.
