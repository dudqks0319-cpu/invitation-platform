# InviteHub App Store Connect Next Build Packet

Date: 2026-05-08

This packet is for the next TestFlight candidate after build `1.0.0 (42)`
failed real iPhone launch on 2026-05-07 23:43 KST.

Do not treat build 42 as the App Store version candidate. The next candidate
must be uploaded, processed in App Store Connect, assigned to internal group
`Team (Expo)`, installed from TestFlight on the user's iPhone, and smoke-tested
before it can be selected for the App Store version.

## Source State

| Field | Value |
| --- | --- |
| Branch | `codex/testflight-launch-crash-fix` |
| Source commit | `5908ad0` |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| App version | `1.0.0` |
| Expected next build number | EAS remote auto-increment after build 42 |
| EAS profile | `production` |
| EAS submit profile | `production` |

## Candidate Changes Since Build 42

- Home screen no longer imports auth, Supabase, or draft storage at module load.
- Template draft creation is lazy-loaded only after a user taps a template.
- Startup-safety tests assert the home first render does not import
  `@/hooks/useAuth`, `@/lib/drafts`, or `@/lib/auth-access`.
- Goal-completion evidence keys now refer to the current passing build instead
  of the failed build 42.

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

Run only after the user explicitly approves a new externally visible upload:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
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
