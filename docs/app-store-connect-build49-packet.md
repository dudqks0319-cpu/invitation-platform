# InviteHub App Store Connect Build 49 Packet

Date: 2026-05-20

Build `1.0.1 (49)` adds the mobile-side map API integration status and native
map-app launch improvements after Build 48 fixed the EAS route archive issue.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.1` |
| Build number | `49` |
| Source commit captured before upload | `dbe4ef7` |
| EAS build id | `441a4e1a-662b-404b-8143-1c016cbc4a77` |
| EAS submission id | `fe4a28ea-1467-44ed-a498-d7ace915dd6f` |
| EAS build status | `FINISHED` |
| EAS submission status | `FINISHED`, `error: null` |
| IPA artifact | `https://expo.dev/artifacts/eas/9pKXtn9zy9nJVfFhEtFcKD.ipa` |
| App Store Connect upload result | Binary uploaded to App Store Connect; Apple processing pending |
| App Store Connect TestFlight state | Not verified in App Store Connect UI |

## Included Fixes

- Mobile app now fetches public map provider status from
  `/api/maps/config` through `EXPO_PUBLIC_WEB_BASE_URL`.
- Mobile builder step 5 and invitation detail show Kakao/Naver API connection
  status.
- Kakao map opens through `kakaomap://search` first, with Kakao web map
  fallback.
- Naver map keeps `nmap://search` first, with Naver web map fallback.
- iOS `LSApplicationQueriesSchemes` includes `kakaomap` and `nmap`.
- Local mobile env fallback supports `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` and
  `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID` provider status.

## Production Map API State

Checked against:

```txt
https://invitation-platform-plum.vercel.app/api/maps/config
```

Result at 2026-05-20 18:34 KST:

```txt
kakaoEnabled: true
kakaoKeyPresent: true
naverEnabled: false
naverClientIdPresent: false
```

This means Build 49 can show Kakao API as connected now. Naver embedded/API
status will remain pending until `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is added to
Vercel Production or `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID` is added to the mobile
EAS Production environment and a new build is shipped.

## Pre-Upload Verification

Commands run from the repository root:

```bash
npm run test -- --exclude='**/.claude/**' --run apps/mobile/lib/map-api-config.test.ts apps/mobile/lib/map-links.test.ts apps/mobile/entry.test.ts apps/mobile/app.config.test.ts
npm --prefix apps/mobile run typecheck
npm --prefix apps/mobile run lint
git diff --check
node scripts/verify-app-store-packet.mjs
```

Result:

```txt
targeted tests: 19 tests passed
mobile typecheck: passed
mobile lint: passed
git diff --check: passed
app store packet verify: passed before Build 49 packet update
```

## Build 49 IPA Inspection

Downloaded artifact:

```txt
https://expo.dev/artifacts/eas/9pKXtn9zy9nJVfFhEtFcKD.ipa
```

Inspected values:

```txt
CFBundleDisplayName: 초대장허브
CFBundleIdentifier: com.invitehub.app
CFBundleName: 초대장허브
CFBundleShortVersionString: 1.0.1
CFBundleVersion: 49
LSApplicationQueriesSchemes: kakaokompassauth, kakaolink, kakaomap, nmap
```

Embedded bundle checks:

```txt
/api/maps/config: present
kakaomap://search: present
```

## Upload Evidence

Command run from `apps/mobile`:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incremented buildNumber from 48 to 49.
Build ID    :  441a4e1a-662b-404b-8143-1c016cbc4a77
App Version :  1.0.1
Build number:  49
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/fe4a28ea-1467-44ed-a498-d7ace915dd6f
Build finished
iOS app: https://expo.dev/artifacts/eas/9pKXtn9zy9nJVfFhEtFcKD.ipa
Submitted your app to Apple App Store Connect.
Your binary has been successfully uploaded to App Store Connect.
```

EAS status recheck at 2026-05-20 18:34 KST:

```txt
build status: FINISHED
submission status: FINISHED
submission error: null
```

## Required Real iPhone Test

1. Wait until App Store Connect finishes processing Build 49.
2. Assign Build 49 to the internal TestFlight group.
3. Delete the installed app from the iPhone, reinstall Build 49 from
   TestFlight, and launch.
4. Smoke test:
   home -> template selection -> builder step 5 -> confirm Kakao API connected
   and Naver API pending -> open Kakao map -> open Naver map fallback -> preview
   -> free publish -> public link -> RSVP/guestbook.

Do not select Build 49 for App Store review until the real iPhone smoke test
passes.
