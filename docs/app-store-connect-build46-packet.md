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
| App Store Connect build upload state | `완료` |
| App Store Connect TestFlight state | `제출 준비 완료`, expires in 90 days |
| Internal TestFlight group | `Team (Expo)` |
| Internal invites | `1` |
| App Store Connect created time | `May 8, 2026 10:21 PM` |

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

## App Store Connect Browser Evidence

Checked in Chrome after EAS Submit completed:

```txt
Build upload row: 1.0.1 (46) / status 완료 / May 8, 2026 10:21 PM
TestFlight build row: build 46 / 제출 준비 완료 / 90일 후 만료
Group: Team (Expo)
Invites: 1
Install/session/crash/feedback: –
```

## Required Real iPhone Test

1. In TestFlight, install `1.0.1 (46)`.
2. Prefer deleting the existing installed app first to clear old container data.
3. Launch `초대장허브` from TestFlight.
4. Confirm no iOS crash dialog appears.
5. Smoke test: home -> template selection -> builder step 1 -> preview.

If this clean `1.0.1` build still crashes, the next blocker is a build 46 crash
report or device crash log.

## 2026-05-19 Real iPhone Result

Build 46 is not a valid App Store candidate after the connected-device check:

- `devicectl` found `com.invitehub.app` installed as version `1.0.1`, bundle
  version `46`, display name `초대장허브`.
- User-visible iOS prompt appeared: `'InviteHub (40c8af)' 앱이 충돌함`.
- Console launch terminated with signal 6 and
  `Unhandled JS Exception: Error: No routes found`.
- Current local source can still export, build, and install a Release app to the
  iPhone, but CoreDeviceService timed out before post-install launch evidence
  could be captured.

Do not select build 46 on the App Store version page. Prepare a newer build and
repeat real-device launch plus the free-publish smoke path.
