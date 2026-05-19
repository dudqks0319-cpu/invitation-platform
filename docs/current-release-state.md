# InviteHub Current Release State

Last updated: 2026-05-19 22:58 KST

This ledger is the single current-state reference for the App Store release
track. Historical packets remain useful evidence, but this file decides what is
current.

| Field | Current State |
| --- | --- |
| Local repo | `/Users/jyb-m3max/Desktop/codex/invitation-platform` |
| Branch | `codex/testflight-launch-crash-fix` |
| Local/remote state | Map/share implementation is committed and pushed on `codex/testflight-launch-crash-fix` |
| Latest implementation commit uploaded | `0cd5297` |
| Current candidate | Build `1.0.1 (48)` uploaded to App Store Connect and awaiting Apple processing/TestFlight real-device proof. |
| Native local build number | `48` |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS build id | `6456cecd-d38d-40c9-a804-85189d1c9400` |
| EAS submission id | `2dfa0414-c11f-4899-a094-3fbf263c7c19` |
| App Store Connect / TestFlight state | Build 48 binary uploaded to App Store Connect; Apple processing/TestFlight group assignment are not yet verified |
| Simulator result | Release simulator build can install and render InviteHub home; built app `Info.plist` shows `CFBundleVersion=46` |
| Real-device result | Failed for installed `com.invitehub.app` `1.0.1 (46)`: connected iPhone launch produced iOS crash prompt and console launch terminated with `Unhandled JS Exception: Error: No routes found` / signal 6. Current local source can build and install a Release app to the iPhone, but post-install console launch is blocked by CoreDeviceService timeout. |
| App Store version selection | Not verified as selected; App Store Connect browser session redirects to login |
| App Store metadata/privacy/screenshots | Not verified as fully saved; App Store Connect browser session redirects to login |
| Live guest publish API | Passed on `https://invitation-platform-plum.vercel.app`: free guest publish `200`, public invitation `HEAD 200`, RSVP `200`, guestbook `200` |
| Maps/share deployment | Vercel Production now serves `/api/maps/config`; Kakao JS key is present and Naver map Client ID is not present. Public invitation HTML includes Kakao/Naver map tabs, map links, and KakaoTalk share UI. |

## Current Verdict

Do not mark the app as release-complete yet. Build `1.0.1 (48)` has been built
from the corrected EAS archive and the IPA inspection proves mobile routes are
embedded. However, Apple processing, TestFlight internal-group assignment, and a
real iPhone launch/free-publish smoke test for build 48 are still required.

Do not select build 42, 46, or 47 for the App Store version. Build 42 and 46
failed real iPhone launch evidence, and Build 47's IPA was built before the EAS
archive route-exclusion fix. Do not select build 48 until it passes real-device
launch and free-publish smoke QA.

The current Vercel production deployment has `SUPABASE_GUEST_PUBLISHER_USER_ID`
set and has been redeployed. Production smoke evidence from 2026-05-19:
`/api/public/guest-publish` returned `200`, `/i/codex-무료-발행-검증-민준-수아-k3gjb5`
returned `HEAD 200`, RSVP returned `200`, and guestbook returned `200`.

## Required P0 Evidence

1. Wait for App Store Connect to finish processing Build 48.
2. Assign build 48 to the internal TestFlight group.
3. Remove/expire builds 42, 46, and 47 from active testing if App Store Connect
   allows it.
4. Install build 48 on the real iPhone.
5. Prefer deleting the existing installed app before install to clear stale
   container data.
6. Confirm the app launches without an iOS crash prompt.
7. Smoke test:
   `home -> template selection -> builder Step 1 -> preview -> free publish -> public link -> RSVP/guestbook`.
8. Record evidence with generic current-build keys:
   `currentTestFlightBuildProcessed`,
   `currentBuildAssignedToInternalGroup`,
   `realIphoneTestFlightInstallLaunchPassed`,
  `currentReleaseBuildSelectedForVersion`.
9. Backend prerequisite is complete: Supabase project was resumed, the guest
   publisher UUID exists, Vercel Production has
   `SUPABASE_GUEST_PUBLISHER_USER_ID`, and the production API smoke test passed.
10. Re-authenticate App Store Connect in Chrome or provide the App Store Connect
   API private key so Codex can verify/save the remaining Apple-side surfaces.

## Required P1 App Store Connect Evidence

- App name, subtitle, description, keywords, category, age rating.
- Privacy policy URL and support URL using verified live URLs.
- App Review contact using a verified mailbox, not `support@invitehub.co.kr`
  until DNS/MX and mailbox receipt are confirmed.
- iPhone screenshots for the current UI.
- App Privacy answers for account, invitation, RSVP, guestbook, photo, purchase,
  and usage data.
- Next valid build selected on the App Store version page only after the real
  iPhone smoke test passes. Build `1.0.1 (46)` is not eligible after the
  2026-05-19 crash evidence.
- No paid/IAP/photo-included publish claims while paid publish flags and IAP are
  disabled.

## Next Action

Use `docs/app-store-connect-build48-packet.md` as the current build evidence.
Do not use `docs/app-store-connect-input-packet-build46.md` for final build
selection. Latest local simulator evidence screenshot:
`/private/tmp/invitehub-build46-release-home.png`.

## 2026-05-19 Real iPhone Evidence

- Device access recovered: `xcrun devicectl` found the paired iPhone 16 Pro
  `8CCEF0FF-05C7-5A6F-BF68-38DF12FA83C4` as available after unlock/trust.
- Installed app evidence showed `com.invitehub.app`, version `1.0.1`, bundle
  version `46`, display name `초대장허브`.
- User-visible crash prompt appeared: `'InviteHub (40c8af)' 앱이 충돌함`.
- Console launch terminated with signal 6 and JS exception
  `Unhandled JS Exception: Error: No routes found`.
- Local current source export from `apps/mobile` completed and bundled
  `apps/mobile/node_modules/expo-router/entry.js` with 1267 modules.
- Local current source Release build installed to the real iPhone successfully.
  Follow-up console launch could not be completed because CoreDeviceService
  timed out after process restart, so this is install evidence only, not a
  launch pass.
- App Store Connect browser/API checks remain blocked by account auth:
  Chrome redirects to login and the CLI status script requires
  `APPLE_APP_STORE_PRIVATE_KEY`.

## 2026-05-19 Map And Share Deployment

- Added `/api/maps/config` so the web client reads public map SDK configuration
  from the deployed Vercel environment.
- Vercel Production deployment:
  `https://invitation-platform-nrw74l0qm-youngbeens-projects.vercel.app`,
  aliased to `https://invitation-platform-plum.vercel.app`.
- Production `/api/maps/config` check returned Kakao enabled and Naver disabled
  without printing secret/public key values.
- Public invitation `https://invitation-platform-plum.vercel.app/invitations/kim-lee-demo`
  returns `200` and includes Kakao/Naver map tabs, external map buttons, and the
  KakaoTalk share action in server-rendered HTML.
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is still missing in local env and Vercel, so
  Naver embedded map rendering remains configuration-blocked. The Naver map open
  button remains active as a fallback.

## 2026-05-19 Build 47 Upload

- Source commit uploaded: `4221622`.
- Native build number: `47`.
- EAS build id: `52514ba4-4f26-4a35-bb21-a565b3a471a9`.
- EAS submission id: `37ac90b7-1af6-43ed-a92d-5c3135917a33`.
- IPA artifact: `https://expo.dev/artifacts/eas/bayNvUjUads2HBqsoiZ3Rg.ipa`.
- EAS status recheck returned build `FINISHED`, submission `FINISHED`, and
  submission `error: null`.
- EAS CLI reported the binary was uploaded to App Store Connect and is being
  processed by Apple. TestFlight processing/internal-group assignment remains
  unverified.

## 2026-05-19 Build 48 Route Archive Fix

- Source commit uploaded: `0cd5297`.
- Native build number: `48`.
- EAS build id: `6456cecd-d38d-40c9-a804-85189d1c9400`.
- EAS submission id: `2dfa0414-c11f-4899-a094-3fbf263c7c19`.
- IPA artifact: `https://expo.dev/artifacts/eas/doCY1SirwjM6oM9C2ZkDmu.ipa`.
- Root cause found: root `.easignore` unanchored `app/**` and `lib/**`
  patterns excluded nested `apps/mobile/app/**` and `apps/mobile/lib/**` from
  EAS cloud archives.
- Fixed by anchoring root web-app exclusions with leading `/`.
- EAS archive inspection now includes `apps/mobile/app/_layout.tsx`,
  `apps/mobile/app/(tabs)/index.tsx`, and `apps/mobile/lib/drafts.ts`.
- Build 48 IPA inspection shows `CFBundleName=초대장허브`,
  `CFBundleVersion=48`, and embedded route markers `step1-basic` and
  `my-invitations` present in `main.jsbundle`.
- EAS status recheck returned build `FINISHED`, submission `FINISHED`, and
  submission `error: null`.
