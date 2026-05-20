# InviteHub Current Release State

Last updated: 2026-05-20 21:59 KST

This ledger is the single current-state reference for the App Store release
track. Historical packets remain useful evidence, but this file decides what is
current.

| Field | Current State |
| --- | --- |
| Local repo | `/Users/jyb-m3max/Desktop/codex/invitation-platform` |
| Branch | `codex/testflight-launch-crash-fix` |
| Local/remote state | iOS map/share implementation and Android release preparation are committed and pushed on `codex/testflight-launch-crash-fix` |
| Latest implementation commit uploaded | `c5714cc` |
| Current candidate | iOS Build `1.0.1 (49)` is processed in App Store Connect and assigned to the internal TestFlight group. Android Build `1.0.1 (51)` has a finished Play Store AAB. Both stores are now blocked by external release steps, not by local code. |
| Native local build number | `49` |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| Android package | `com.invitehub.app` |
| Display name | `초대장허브` |
| EAS iOS build id | `441a4e1a-662b-404b-8143-1c016cbc4a77` |
| EAS Android build id | `b09d5796-44c7-4004-8068-541163bc0729` |
| EAS submission id | `fe4a28ea-1467-44ed-a498-d7ace915dd6f` |
| Google Play submission state | Android AAB build finished. Google Play Console currently shows the developer account creation flow for `dudqks0319@gmail.com`; submission cannot proceed until the user creates/pays for the Play developer account, creates the app/package, and then links a service account. |
| Android AAB artifact | `https://expo.dev/artifacts/eas/nNVUbw1EtVUo4tw1ES1EnP.aab` |
| App Store Connect / TestFlight state | Build 49 is processed/available in TestFlight, export-compliance blocking is not visible, and the build is assigned to internal group `Team (Expo)` with invitation count `1`. |
| Simulator result | Release simulator build can install and render InviteHub home; built app `Info.plist` shows `CFBundleVersion=46` |
| Real-device result | Failed for installed `com.invitehub.app` `1.0.1 (46)`: connected iPhone launch produced iOS crash prompt and console launch terminated with `Unhandled JS Exception: Error: No routes found` / signal 6. Build 49 still needs TestFlight real-device launch/free-publish proof. Current physical iPhone `영빈` is visible to CoreDevice only as `unavailable`, and mobile automation currently sees only simulators. |
| App Store version selection | Not verified as selected; App Store Connect browser session redirects to login |
| App Store metadata/privacy/screenshots | Not verified as fully saved; App Store Connect browser session redirects to login |
| Live guest publish API | Passed on `https://invitation-platform-plum.vercel.app`: free guest publish `200`, public invitation `HEAD 200`, RSVP `200`, guestbook `200` |
| Maps/share deployment | Vercel Production now serves `/api/maps/config`; Kakao JS key is present and Naver map Client ID is not present. Public invitation HTML includes Kakao/Naver map tabs, map links, and KakaoTalk share UI. |

## Current Verdict

Do not mark the app as release-complete yet. Build `1.0.1 (49)` has been built,
uploaded, processed by App Store Connect, and assigned to internal TestFlight
group `Team (Expo)`. IPA inspection proves `/api/maps/config`,
`kakaomap://search`, and `CFBundleVersion=49` are embedded. The remaining iOS
P0 blocker is real iPhone TestFlight launch/free-publish smoke evidence for
build 49.

Do not select build 42, 46, or 47 for the App Store version. Build 42 and 46
failed real iPhone launch evidence, and Build 47's IPA was built before the EAS
archive route-exclusion fix. Do not select build 49 for App Store review until
it passes real-device launch and free-publish smoke QA.

The current Vercel production deployment has `SUPABASE_GUEST_PUBLISHER_USER_ID`
set and has been redeployed. Production smoke evidence from 2026-05-19:
`/api/public/guest-publish` returned `200`, `/i/codex-무료-발행-검증-민준-수아-k3gjb5`
returned `HEAD 200`, RSVP returned `200`, and guestbook returned `200`.

## Required P0 Evidence

1. Build 49 App Store Connect processing: complete, recorded locally in
   `docs/app-store-external-evidence.json`.
2. Build 49 internal TestFlight group assignment: complete, recorded locally in
   `docs/app-store-external-evidence.json`.
3. Remove/expire builds 42, 46, and 47 from active testing if App Store Connect
   allows it.
4. Install build 49 on the real iPhone.
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
   API private key only if the session expires before saving the remaining
   Apple-side surfaces.

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

For iOS, connect/unlock/trust the real iPhone, install Build 49 from TestFlight,
and run the launch/free-publish smoke test before selecting it for App Store
review.

For Android, finish Play Console developer account creation for
`dudqks0319@gmail.com`, create/link the Google Play Console app for package
`com.invitehub.app`, connect a Play Console service account with internal-track
release permission, then rerun:
`eas submit -p android --id b09d5796-44c7-4004-8068-541163bc0729 --profile production`.

Do not use `docs/app-store-connect-input-packet-build46.md` for final build
selection. Latest local simulator evidence screenshot:
`/private/tmp/invitehub-build46-release-home.png`.

## 2026-05-20 Android Build 51 Google Play Candidate

- Source commit uploaded: `c5714cc`.
- Android package: `com.invitehub.app`.
- App version: `1.0.1`.
- Android versionCode: `51`.
- EAS Android build id: `b09d5796-44c7-4004-8068-541163bc0729`.
- AAB artifact: `https://expo.dev/artifacts/eas/nNVUbw1EtVUo4tw1ES1EnP.aab`.
- Build status recheck returned `FINISHED`.
- AAB artifact was downloaded to
  `/tmp/invitehub-android-build51/invitehub-1.0.1-51.aab`; it is a 65.8 MB Zip
  App Bundle containing `BundleConfig.pb`, `base/manifest/AndroidManifest.xml`,
  `base/dex/classes.dex`, and `base/assets/index.android.bundle`.
- Local verification passed:
  `npm run test -- --exclude='**/.claude/**' --run apps/mobile/entry.test.ts apps/mobile/app.config.test.ts apps/mobile/lib/map-api-config.test.ts apps/mobile/lib/map-links.test.ts`,
  `npm --prefix apps/mobile run typecheck`,
  `npm --prefix apps/mobile run lint`,
  `git diff --check`, and JDK 21
  `./gradlew :app:compileReleaseKotlin --no-daemon`.
- Fixed Android release blockers before Build 51:
  `android/app/build.gradle` now imports EAS signing config when
  `eas-build.gradle` exists, native package is static `com.invitehub.app`, and
  `MainActivity.kt` / `MainApplication.kt` are in package `com.invitehub.app`.
- Previous Android Build 50 failed at `:app:compileReleaseKotlin` because native
  Kotlin sources were still in `com.invitehub.app.dev` after the release package
  switch.
- Google Play submit remains blocked by account setup, not by code:
  EAS reported `Google Service Account Keys cannot be set up in --non-interactive
  mode` for package `com.invitehub.app`.
- Chrome Play Console check later showed the developer account creation page for
  `dudqks0319@gmail.com`, with required account type selection and ownership
  notice. This confirms Google Play submission is blocked before service-account
  setup; account type, legal identity, payment, and terms must be completed by
  the account owner.

## 2026-05-20 Build 49 TestFlight Processing Evidence

- Chrome App Store Connect TestFlight iOS page showed uploaded build
  `1.0.1 (49)` with status `완료`, created May 20, 2026 1:03 AM.
- The version `1.0.1` TestFlight table showed row `빌드 49`, status
  `제출 준비 완료`, expiry `90일 후 만료`, group `Team (Expo)`, and invitation
  count `1`.
- No export-compliance blocking prompt was visible on the Build 49 TestFlight
  row.
- Evidence was recorded in the local, gitignored
  `docs/app-store-external-evidence.json` for:
  `currentTestFlightBuildProcessed`, `currentBuildExportComplianceSaved`, and
  `currentBuildAssignedToInternalGroup`.
- Real iPhone smoke remains unverified because the paired iPhone `영빈`
  `8CCEF0FF-05C7-5A6F-BF68-38DF12FA83C4` is currently unavailable to
  `xcrun devicectl`; mobile automation sees only simulators.

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

## 2026-05-20 Build 49 Mobile Map API Integration

- Source commit uploaded: `dbe4ef7`.
- Native build number: `49`.
- EAS build id: `441a4e1a-662b-404b-8143-1c016cbc4a77`.
- EAS submission id: `fe4a28ea-1467-44ed-a498-d7ace915dd6f`.
- IPA artifact: `https://expo.dev/artifacts/eas/9pKXtn9zy9nJVfFhEtFcKD.ipa`.
- Mobile app now reads public map provider status from
  `EXPO_PUBLIC_WEB_BASE_URL/api/maps/config`.
- Build 49 IPA inspection shows `CFBundleVersion=49`,
  `LSApplicationQueriesSchemes` includes `kakaomap` and `nmap`, and embedded
  bundle markers `/api/maps/config` and `kakaomap://search` are present.
- Production map config currently returns Kakao enabled and Naver disabled
  because `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is still missing in Vercel
  Production.
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
