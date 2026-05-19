# InviteHub App Store Connect Build 47 Packet

Date: 2026-05-19

Build `1.0.1 (47)` is the map/share release candidate uploaded after the
Vercel map configuration endpoint and public invitation map/share UI were
deployed.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.1` |
| Build number | `47` |
| Source commit captured before upload | `4221622` |
| EAS build id | `52514ba4-4f26-4a35-bb21-a565b3a471a9` |
| EAS submission id | `37ac90b7-1af6-43ed-a92d-5c3135917a33` |
| EAS build status | `FINISHED` |
| EAS submission status | `FINISHED`, `error: null` |
| IPA artifact | `https://expo.dev/artifacts/eas/bayNvUjUads2HBqsoiZ3Rg.ipa` |
| App Store Connect upload result | Binary uploaded to App Store Connect; Apple processing pending |
| App Store Connect TestFlight state | Not verified in App Store Connect UI after processing |

## Included Changes

- Adds `/api/maps/config` on Vercel so the public invitation page can read
  public map SDK configuration from Production env.
- Adds embedded Kakao map rendering on public invitation location sections when
  `NEXT_PUBLIC_KAKAO_JS_KEY` is configured.
- Adds embedded Naver map rendering path when
  `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is configured.
- Keeps external Kakao/Naver map open buttons as fallbacks.
- Keeps KakaoTalk export through the Kakao JavaScript share SDK.

## Production Web Evidence

Vercel Production deployment:
`https://invitation-platform-nrw74l0qm-youngbeens-projects.vercel.app`,
aliased to `https://invitation-platform-plum.vercel.app`.

Production `/api/maps/config` check returned:

```txt
kakaoEnabled: true
kakaoKeyPresent: true
naverEnabled: false
naverClientIdPresent: false
```

Public invitation check:

```txt
https://invitation-platform-plum.vercel.app/invitations/kim-lee-demo
```

The server-rendered HTML includes Kakao/Naver map tabs, external map buttons,
and KakaoTalk share UI. Naver embedded rendering is configuration-blocked until
`NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is added to Vercel Production and redeployed.

## Pre-Upload Verification

Commands run from the repository root:

```bash
npm run test -- --exclude='**/.claude/**' --run components/invitations/invitation-view.test.tsx app/api/maps/config/route.test.ts apps/mobile/lib/map-links.test.ts apps/mobile/entry.test.ts
npm run typecheck
npm --prefix apps/mobile run typecheck
npm run lint
npm --prefix apps/mobile run lint
git diff --check
node scripts/verify-app-store-packet.mjs
```

Result:

```txt
targeted tests: 11 tests passed
root typecheck: passed
mobile typecheck: passed
root lint: passed
mobile lint: passed
git diff --check: passed
app store packet verify: passed before Build 47 packet update
```

## Upload Evidence

Command run from `apps/mobile`:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incrementing buildNumber from 46 to 47.
Build ID    :  52514ba4-4f26-4a35-bb21-a565b3a471a9
App Version :  1.0.1
Build number:  47
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/37ac90b7-1af6-43ed-a92d-5c3135917a33
Build finished
iOS app: https://expo.dev/artifacts/eas/bayNvUjUads2HBqsoiZ3Rg.ipa
Submitted your app to Apple App Store Connect.
Your binary has been successfully uploaded to App Store Connect.
It is now being processed by Apple.
```

EAS status recheck:

```txt
build status: FINISHED
submission status: FINISHED
submission error: null
```

## Required Real iPhone Test

1. Wait until App Store Connect finishes processing build `1.0.1 (47)`.
2. Assign build `47` to the internal TestFlight group.
3. Install build `47` from TestFlight on the real iPhone.
4. Prefer deleting the existing installed app first to clear stale container
   data.
5. Launch `초대장허브` and confirm no iOS crash dialog appears.
6. Smoke test:
   home -> template selection -> builder step 1 -> preview -> free publish ->
   public link -> RSVP/guestbook.

Do not select build 47 for App Store review until the real iPhone smoke test
passes.
