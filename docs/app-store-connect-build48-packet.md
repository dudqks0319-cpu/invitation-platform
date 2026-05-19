# InviteHub App Store Connect Build 48 Packet

Date: 2026-05-19

Build `1.0.1 (48)` is the clean TestFlight rebuild after the root EAS archive
ignore rule was found to exclude the mobile Expo Router routes from cloud
builds.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.1` |
| Build number | `48` |
| Source commit captured before upload | `0cd5297` |
| EAS build id | `6456cecd-d38d-40c9-a804-85189d1c9400` |
| EAS submission id | `2dfa0414-c11f-4899-a094-3fbf263c7c19` |
| EAS build status | `FINISHED` |
| EAS submission status | `IN_QUEUE`, `error: null` at 2026-05-19 22:54 KST |
| IPA artifact | `https://expo.dev/artifacts/eas/doCY1SirwjM6oM9C2ZkDmu.ipa` |
| App Store Connect upload result | Submission queued in EAS; Apple upload completion not yet verified |
| App Store Connect TestFlight state | Not verified in App Store Connect UI |

## Root Cause

The prior TestFlight crashes with `No routes found` were caused by the root
`.easignore` using unanchored monorepo patterns such as `app/**` and `lib/**`.
During the EAS archive stage those patterns also matched nested mobile paths
like `apps/mobile/app/**` and `apps/mobile/lib/**`, so the cloud-built
TestFlight bundle had no Expo Router app routes even though local simulator and
local export checks passed.

Evidence:

```txt
Before fix:
/tmp/invitehub-eas-inspect-archive/apps/mobile/app/_layout.tsx: missing
/tmp/invitehub-eas-inspect-archive/apps/mobile/lib/drafts.ts: missing

After fix:
/tmp/invitehub-eas-inspect-archive-fixed/apps/mobile/app/_layout.tsx: present
/tmp/invitehub-eas-inspect-archive-fixed/apps/mobile/app/(tabs)/index.tsx: present
/tmp/invitehub-eas-inspect-archive-fixed/apps/mobile/lib/drafts.ts: present
```

## Included Fixes

- Anchored root `.easignore` web-app exclusions to repository root paths, for
  example `/app/**` instead of `app/**`.
- Added regression tests so the root `.easignore` cannot silently exclude
  `apps/mobile/app` or `apps/mobile/lib` again.
- Set iOS `CFBundleName` to `초대장허브` in both native `Info.plist` and Expo
  config so crash dialogs no longer fall back to `InviteHub`.
- Bumped the native local build number to `48`.

## Pre-Upload Verification

Commands run from the repository root:

```bash
npm run test -- --exclude='**/.claude/**' --run apps/mobile/entry.test.ts apps/mobile/app.config.test.ts
npm --prefix apps/mobile run typecheck
npm --prefix apps/mobile run lint
git diff --check
node scripts/verify-app-store-packet.mjs
```

Result:

```txt
targeted tests: 11 tests passed
mobile typecheck: passed
mobile lint: passed
git diff --check: passed
app store packet verify: passed before Build 48 packet update
```

EAS archive inspection:

```bash
eas build:inspect -p ios -s archive -e production -o /tmp/invitehub-eas-inspect-archive-fixed --force
```

Result:

```txt
apps/mobile/app/_layout.tsx: present
apps/mobile/app/(tabs)/index.tsx: present
apps/mobile/lib/drafts.ts: present
apps/mobile/components/ui/Button.tsx: present
```

## Build 48 IPA Inspection

Downloaded artifact:

```txt
https://expo.dev/artifacts/eas/doCY1SirwjM6oM9C2ZkDmu.ipa
```

Inspected values:

```txt
CFBundleDisplayName: 초대장허브
CFBundleIdentifier: com.invitehub.app
CFBundleName: 초대장허브
CFBundleShortVersionString: 1.0.1
CFBundleVersion: 48
```

Embedded bundle checks:

```txt
main.jsbundle size: 3,708,109 bytes
route marker step1-basic: present
route marker my-invitations: present
```

This differs from Build 47, where the IPA bundle was about 2.4 MB and route
markers such as `step1-basic` were absent.

## Upload Evidence

Command run from `apps/mobile`:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incremented buildNumber from 47 to 48.
Build ID    :  6456cecd-d38d-40c9-a804-85189d1c9400
App Version :  1.0.1
Build number:  48
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/2dfa0414-c11f-4899-a094-3fbf263c7c19
Build finished
iOS app: https://expo.dev/artifacts/eas/doCY1SirwjM6oM9C2ZkDmu.ipa
```

EAS status recheck at 2026-05-19 22:54 KST:

```txt
build status: FINISHED
submission status: IN_QUEUE
submission error: null
```

## TestFlight Cleanup Note

Previously uploaded TestFlight builds cannot be fully deleted from App Store
Connect like local files. Clean-up should be done by expiring/removing old
builds from testing and assigning only Build 48 to the internal group after
Apple processing completes.

## Required Real iPhone Test

1. Wait until Build 48 submission finishes and Apple processing completes.
2. Assign build 48 to the internal TestFlight group.
3. Remove/expire builds 42, 46, and 47 from active testing if App Store Connect
   allows it.
4. Delete the installed app from the iPhone, reinstall Build 48 from
   TestFlight, and launch.
5. Smoke test:
   home -> template selection -> builder step 1 -> preview -> free publish ->
   public link -> RSVP/guestbook.

Do not select build 48 for App Store review until the real iPhone smoke test
passes.
