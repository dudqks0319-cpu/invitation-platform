# InviteHub App Store Connect Build 46 Packet

Date: 2026-05-08

Build `1.0.1 (46)` supersedes the `1.0.0` TestFlight candidates. It carries
the same crash-recovery patch as build 45, but moves the App Store version to
`1.0.1` so the stabilization candidate is separated from the earlier `1.0.0`
build train.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.1` |
| Build number | `46` |
| Source commit captured before upload | `737884b` |
| EAS build id | `4aefa47b-ca9e-4d90-8029-a8ab6f45a528` |
| EAS submission id | `023a9129-d68b-406a-a5b5-58e03c98a13a` |
| EAS build status | `FINISHED` |
| IPA artifact | `https://expo.dev/artifacts/eas/afGx9mRBMme34vyPZ7Jyu1.ipa` |
| App Store Connect state | Uploaded to Apple; processing pending |

## Why Build 46

- Separates the crash-recovery candidate as version `1.0.1` instead of another
  `1.0.0` build.
- Keeps build 45's stale local draft storage recovery.
- Keeps build 45's defensive Supabase auth storage wrapper.
- Keeps build 45's visible app name `초대장허브`.

## Pre-Upload Verification

Commands run from the repository root:

```bash
npm --workspace @invitehub/mobile run lint
npm --workspace @invitehub/mobile run typecheck
./node_modules/.bin/vitest run --exclude '.claude/**' 'apps/mobile/app.config.test.ts' 'apps/mobile/react-native.config.test.ts' 'apps/mobile/lib/drafts.test.ts' 'apps/mobile/lib/native-startup-safety.test.ts'
git diff --check
```

Result:

```txt
mobile lint: passed
mobile typecheck: passed
mobile config/draft/startup tests: 13 tests passed
git diff --check: passed
```

## Upload Evidence

Command run from `apps/mobile`:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incremented buildNumber from 45 to 46.
Build ID    :  4aefa47b-ca9e-4d90-8029-a8ab6f45a528
App Version :  1.0.1
Build number:  46
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/023a9129-d68b-406a-a5b5-58e03c98a13a
Build finished
iOS app: https://expo.dev/artifacts/eas/afGx9mRBMme34vyPZ7Jyu1.ipa
Submitted your app to Apple App Store Connect.
Your binary has been successfully uploaded to App Store Connect.
It is now being processed by Apple.
```

## Required Real iPhone Test

1. Wait for App Store Connect processing to finish.
2. In TestFlight, install `1.0.1 (46)`.
3. Prefer deleting the existing installed app first to clear old container data.
4. Launch `초대장허브` from TestFlight.
5. Confirm no iOS crash dialog appears.
6. Smoke test: home -> template selection -> builder step 1 -> preview.

If this clean `1.0.1` build still crashes, the next blocker is a build 46 crash
report or device crash log.
