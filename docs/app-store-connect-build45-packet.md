# InviteHub App Store Connect Build 45 Packet

Date: 2026-05-08

Build `1.0.0 (45)` supersedes build 44 for the real-iPhone crash investigation.
It keeps the same App Store bundle id, but changes the visible app name to
`초대장허브` so the user can clearly distinguish the new candidate on the iPhone.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.0` |
| Build number | `45` |
| Source commit captured before upload | `8f21618` |
| EAS build id | `3b625bcc-4a25-49c3-90d8-f844979cb189` |
| EAS submission id | `dae1101a-afe1-48bf-9dd1-7b8599891181` |
| EAS build status | `FINISHED` |
| IPA artifact | `https://expo.dev/artifacts/eas/8kjgoaMSvQMvxcL6WPnxnT.ipa` |
| App Store Connect state | Uploaded to Apple; processing pending |

## Why Build 45

- The app now tolerates corrupted local draft storage by backing it up and
  clearing the active draft cache instead of throwing during app flows.
- Supabase auth storage access is wrapped so stale device storage cannot crash
  the app while restoring a previous session.
- `useAuth` treats session-restore failures as anonymous state instead of
  leaving the startup flow in an unhandled rejection path.
- The visible app name is changed from `InviteHub` to `초대장허브` to reduce
  confusion with older installed candidates while testing.

## Pre-Upload Verification

Commands run from the repository root:

```bash
npm --workspace @invitehub/mobile run lint
npm --workspace @invitehub/mobile run typecheck
./node_modules/.bin/vitest run --exclude '.claude/**' 'apps/mobile/lib/drafts.test.ts' 'app/invitations/[slug]/page.test.ts'
./node_modules/.bin/vitest run --exclude '.claude/**' 'apps/mobile/app.config.test.ts' 'apps/mobile/react-native.config.test.ts'
./node_modules/.bin/vitest run --exclude '.claude/**' 'apps/mobile/lib/native-startup-safety.test.ts'
git diff --check
```

Result:

```txt
mobile lint: passed
mobile typecheck: passed
draft recovery + public invitation tests: 9 tests passed
mobile config tests: 10 tests passed
native startup safety tests: 2 tests passed
git diff --check: passed
```

## Upload Evidence

Command run from `apps/mobile`:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incremented buildNumber from 44 to 45.
Build ID    :  3b625bcc-4a25-49c3-90d8-f844979cb189
App Version :  1.0.0
Build number:  45
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/dae1101a-afe1-48bf-9dd1-7b8599891181
Build finished
iOS app: https://expo.dev/artifacts/eas/8kjgoaMSvQMvxcL6WPnxnT.ipa
Submitted your app to Apple App Store Connect.
Your binary has been successfully uploaded to App Store Connect.
It is now being processed by Apple.
```

## Clean Install Test

Recommended real-iPhone sequence:

1. Delete the existing installed `InviteHub` / `초대장허브` app from the iPhone.
2. Open TestFlight.
3. Install build `1.0.0 (45)` after it appears.
4. Launch the app from TestFlight.
5. Confirm the app name on the home screen is `초대장허브`.
6. Confirm no iOS crash dialog appears.
7. Enter home, select a template, open builder step 1, and open preview.

If build 45 still crashes after a clean install, the next required evidence is
the TestFlight crash row or a device crash log for build 45.
