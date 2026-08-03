# InviteHub App Store Connect Next Build Packet

Date: 2026-08-04

This packet is for the next production candidate, `1.0.3 (69)`. Build 68 is
processed in App Store Connect but superseded by the confirmed process-screen
UI mismatch. Read-only EAS and ASC checks show Build 68 as the highest
production build and Build 69 count zero.

Build 69 is currently a source identity only. The candidate Git SHA is
`UNBOUND/PENDING`; no EAS build, IPA/archive, ASC upload, TestFlight install, or
production-device evidence exists for it. Do not build or upload from the dirty
worktree. After one approved clean commit passes preflight, build, upload,
TestFlight installation, and App Review selection remain separate approvals.

## Source State

| Field | Value |
| --- | --- |
| Branch | `agent/osamosam-uiux-plan-v1` |
| Candidate Git SHA | `UNBOUND/PENDING`; current dirty base HEAD `0538c5d4dfe56b7a3dd9aa41bbbee484f4a536e7` |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| App version | `1.0.3` |
| Expected next build number | `69`; EAS/ASC read-only highest `68`, Build 69 count `0` |
| Native Release identity | `com.invitehub.app` / `1.0.3 (69)` |
| Native Debug identity | `com.invitehub.app.dev` / `1.0.3 (52)`; unchanged and excluded |
| EAS profile | `production` |
| EAS submit profile | `production` |
| Version allocation | local; `autoIncrement: false`; no remote auto-increment |

## Candidate Changes Since Build 68

- Home and process-entry routes share the same event-selection component.
- Release preflight fails closed on dirty/unselected source, missing raw
  evidence, SHA drift, dev bundle identity, remote auto-increment, and artifact
  identity/hash drift.
- Public writes, view logging, account deletion, and signed-asset delivery have
  local security regression coverage; their migrations and operational gates
  remain unapplied outside the repository.
- Production Release source now uses Build 69 without modifying the Debug/dev
  bundle identity.

## Local Preflight Already Verified

```txt
npm run test -- apps/mobile/lib/native-startup-safety.test.ts apps/mobile/entry.test.ts apps/mobile/app.config.test.ts
npm --prefix apps/mobile run typecheck
npm --prefix apps/mobile run lint
node scripts/verify-app-store-packet.mjs
npm run test -- scripts/record-app-store-evidence.test.ts scripts/verify-goal-completion.test.ts
node scripts/record-app-store-evidence.mjs --list
```

Latest Release simulator verification:

```txt
npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler
```

Result: build succeeded with 0 errors and 4 warnings, installed and opened
`com.invitehub.app` on iPhone 17.

Screenshot:

```txt
output/testflight-device-watch/20260508-codex-update/evidence/release-simulator-home.png
```

## Upload Command After User Approval

Run only after the user explicitly selects the candidate in
`release-ledger.yaml`, records matching raw evidence in the ignored
`docs/release-candidate-evidence.json`, and approves the external operation.
Build and upload are deliberately separate so the resulting IPA can be
identity/hash checked before submission:

```bash
npm run release:ios:build
npm run release:ios:upload -- /absolute/path/to/candidate.ipa
```

After EAS returns a build id, record:

- EAS build id
- EAS submission id
- IPA artifact URL
- App Store Connect processing status
- final build number assigned by EAS/App Store Connect

## Required Post-Upload Evidence

Use the current-build evidence keys, not build-42-specific keys:

```bash
node scripts/record-app-store-evidence.mjs --key currentTestFlightBuildProcessed --evidence "<App Store Connect TestFlight shows the newer passing build processed/available>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key currentBuildExportComplianceSaved --evidence "<newer passing build export compliance saved or not requested>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key currentBuildAssignedToInternalGroup --evidence "<newer passing build assigned to Team (Expo)>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key realIphoneTestFlightInstallLaunchPassed --evidence "<real iPhone installed the newer TestFlight build and launched home/template/builder/preview without the crash dialog>" --artifact "output/testflight-device-watch/<timestamp>/evidence/<timestamp>"
```

Only after the newer build passes real iPhone TestFlight launch should the App
Store version build be selected and recorded:

```bash
node scripts/record-app-store-evidence.mjs --key currentReleaseBuildSelectedForVersion --evidence "<newer passing build selected for the App Store version>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
```

Final Add for Review and Submit for Review still require separate explicit user
confirmation.
