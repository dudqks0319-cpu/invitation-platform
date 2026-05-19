# InviteHub Current Release State

Last updated: 2026-05-19 21:25 KST

This ledger is the single current-state reference for the App Store release
track. Historical packets remain useful evidence, but this file decides what is
current.

| Field | Current State |
| --- | --- |
| Local repo | `/Users/jyb-m3max/Desktop/codex/invitation-platform` |
| Branch | `codex/testflight-launch-crash-fix` |
| Local/remote state | Local release-blocker fixes are pending commit/push after the 2026-05-19 external-access pass |
| Latest local commit at inspection | `44ccac4` |
| Current candidate | No valid TestFlight release candidate. `1.0.1 (46)` is uploaded but failed real-device launch evidence. |
| Native local build number | `46` |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS build id | `4aefa47b-ca9e-4d90-8029-a8ab6f45a528` |
| EAS submission id | `023a9129-d68b-406a-a5b5-58e03c98a13a` |
| App Store Connect / TestFlight state | Build 46 uploaded, row shows `제출 준비 완료`, internal group `Team (Expo)`, invite count `1` per `docs/app-store-connect-build46-packet.md` |
| Simulator result | Release simulator build can install and render InviteHub home; built app `Info.plist` shows `CFBundleVersion=46` |
| Real-device result | Failed for installed `com.invitehub.app` `1.0.1 (46)`: connected iPhone launch produced iOS crash prompt and console launch terminated with `Unhandled JS Exception: Error: No routes found` / signal 6. Current local source can build and install a Release app to the iPhone, but post-install console launch is blocked by CoreDeviceService timeout. |
| App Store version selection | Not verified as selected; App Store Connect browser session redirects to login |
| App Store metadata/privacy/screenshots | Not verified as fully saved; App Store Connect browser session redirects to login |
| Live guest publish API | Passed on `https://invitation-platform-plum.vercel.app`: free guest publish `200`, public invitation `HEAD 200`, RSVP `200`, guestbook `200` |

## Current Verdict

Do not mark the app as release-complete yet. The local/native Build 42 drift has
been corrected by setting the native iOS project build number to `46`, and the
production free-publish backend now passes. However, the connected iPhone launch
check for the installed `1.0.1 (46)` app failed with `No routes found`, so build
46 must not be selected for App Store review.

Do not select build 42 for the App Store version. Build `1.0.0 (42)` failed the
real iPhone launch check. Do not select build 46 either until a new build
passes real-device launch and free-publish smoke QA.

The current Vercel production deployment has `SUPABASE_GUEST_PUBLISHER_USER_ID`
set and has been redeployed. Production smoke evidence from 2026-05-19:
`/api/public/guest-publish` returned `200`, `/i/codex-무료-발행-검증-민준-수아-k3gjb5`
returned `HEAD 200`, RSVP returned `200`, and guestbook returned `200`.

## Required P0 Evidence

1. Prepare a next TestFlight build after the current local fixes are committed.
2. Install the next TestFlight build on the real iPhone.
3. Prefer deleting the existing installed app before install to clear stale
   container data.
4. Confirm the app launches without an iOS crash prompt.
5. Smoke test:
   `home -> template selection -> builder Step 1 -> preview -> free publish -> public link -> RSVP/guestbook`.
6. Record evidence with generic current-build keys:
   `currentTestFlightBuildProcessed`,
   `currentBuildAssignedToInternalGroup`,
   `realIphoneTestFlightInstallLaunchPassed`,
  `currentReleaseBuildSelectedForVersion`.
7. Backend prerequisite is complete: Supabase project was resumed, the guest
   publisher UUID exists, Vercel Production has
   `SUPABASE_GUEST_PUBLISHER_USER_ID`, and the production API smoke test passed.
8. Re-authenticate App Store Connect in Chrome or provide the App Store Connect
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

Do not use `docs/app-store-connect-input-packet-build46.md` for final build
selection unless a later real-device run disproves the 2026-05-19 crash
evidence. Prepare the next build packet after the code branch is pushed and the
new TestFlight build exists. Latest local simulator evidence screenshot:
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
