# InviteHub App Store Connect Build 44 Packet

Date: 2026-05-08

Build `1.0.0 (44)` supersedes build 43. Build 43 was uploaded after the
startup-surface reduction patch, but additional P0 release hardening was applied
afterward. Build 44 is the first TestFlight candidate that includes that P0
patch.

EAS Build and EAS Submit are finished. Apple accepted the upload, App Store
Connect processing is complete, and build 44 is visible in the internal
TestFlight group.

Do not select build 44 for App Store release until the user's real iPhone
passes the smoke test from TestFlight without the crash dialog.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.0` |
| Build number | `44` |
| Source commit captured before upload | `ad65984` |
| EAS build id | `9c0568d0-1036-49e1-8ceb-af0ece415d96` |
| EAS submission id | `fae33a90-d89f-4d2c-92e1-b057cd28700a` |
| EAS build status | `FINISHED` |
| EAS submission status | Uploaded to App Store Connect by EAS Submit |
| IPA artifact | `https://expo.dev/artifacts/eas/kgrkUGUKw83kez1dTixVfN.ipa` |
| App Store Connect build upload state | `완료` |
| App Store Connect TestFlight state | `제출 준비 완료`, expires in 90 days |
| Internal TestFlight group | `Team (Expo)` |
| Internal invites | `1` |
| App Store Connect created time | `May 8, 2026 8:59 PM` |

## Why Build 44

- Public invitation guestbook rendering now tolerates a missing admin client.
- Public invitation guestbook query failures render an empty list instead of
  breaking the public page.
- Mobile login no longer exposes Google/Kakao buttons unless native social auth
  is configured.
- Paid photo publishing disabled state no longer exposes photo upload/add
  actions.
- Existing selected photos can still be removed while paid photo publishing is
  disabled.
- Invitation deletion and local draft deletion now require destructive
  confirmation.

## Pre-Upload Verification

Commands run from the repository root:

```bash
npm run lint
npm run typecheck
npm --workspace @invitehub/mobile run lint
npm --workspace @invitehub/mobile run typecheck
./node_modules/.bin/vitest run --exclude '.claude/**' 'app/invitations/[slug]/page.test.ts'
```

Result:

```txt
npm run lint: passed
npm run typecheck: passed
npm --workspace @invitehub/mobile run lint: passed
npm --workspace @invitehub/mobile run typecheck: passed
app/invitations/[slug]/page.test.ts: 8 tests passed
```

## Upload Evidence

Command run from `apps/mobile` after approval:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incremented buildNumber from 43 to 44.
Build ID    :  9c0568d0-1036-49e1-8ceb-af0ece415d96
App Version :  1.0.0
Build number:  44
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/fae33a90-d89f-4d2c-92e1-b057cd28700a
Build finished
iOS app: https://expo.dev/artifacts/eas/kgrkUGUKw83kez1dTixVfN.ipa
Submitted your app to Apple App Store Connect.
Your binary has been successfully uploaded to App Store Connect.
It is now being processed by Apple.
```

## App Store Connect Browser Evidence

Checked in Chrome after EAS Submit completed:

```txt
Build upload row: 1.0.0 (44) / status 완료 / May 8, 2026 8:59 PM
TestFlight build row: build 44 / 제출 준비 완료 / 90일 후 만료
Group: Team (Expo)
Invites: 1
Install/session/crash/feedback: –
```

## Required Real iPhone Smoke Test

Do not mark this build as release-ready until the user's iPhone installs build
44 from TestFlight and these checks pass:

1. Launch InviteHub.
2. Enter the home screen.
3. Enter the login screen.
4. Confirm Apple login remains visible.
5. Confirm Google/Kakao are hidden in the default release build.
6. Select a template.
7. Complete builder step 1 basic information.
8. Complete builder step 2 people information.
9. Confirm step 3 shows paid-photo disabled guidance.
10. Confirm photo add/upload actions are not visible while disabled.
11. If an older draft has photos, confirm existing photos can be deleted.
12. Enter preview.
13. Confirm free publish flow is available.
14. Open My Invitations.
15. Confirm local draft deletion shows destructive confirmation.
16. Confirm operation-screen deletion shows destructive confirmation.
17. Relaunch the app three times.
18. Confirm no iOS crash dialog appears.

## Remaining Blockers

- Real iPhone TestFlight smoke test evidence is still required.
- App Store final submission still requires explicit user confirmation.
