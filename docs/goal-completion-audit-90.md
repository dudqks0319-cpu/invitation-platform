# InviteHub Goal Completion Audit - 90점 Release Readiness

Date: 2026-05-01
Latest update: 2026-05-08 18:52 KST

## Objective

InviteHub 앱을 App Store 제출 기준으로 프론트엔드, 백엔드, UI/UX, API,
보안, 스토어 제출 영역 모두 90점 이상 상태까지 끌어올리고, 각 영역별
하네스와 검증 증거를 남긴다.

## Concrete Success Criteria

- Frontend: Expo mobile lint/typecheck/tests and iOS Release simulator build pass.
- UI/UX: Home is simple and template-first; template selection opens a prefilled
  builder; preview renders a fixed invitation template canvas with editable text
  overlaid.
- Backend/API: publish/payment/template APIs validate input, enforce ownership,
  and have negative-path tests.
- Security: no hardcoded secrets, no high/critical dependency audit findings,
  authz/validation/rate-limit controls are documented and tested.
- Store: production bundle id/scheme/EAS profile/native Release settings align,
  and App Store Connect/TestFlight evidence exists for the current build.
- Harness: product, marketing, image, UX, mobile frontend/backend, API, security,
  QA, and store-manager surfaces are represented with concrete verification
  commands.
- Evidence: command output, screenshots, and external console state are captured
  before marking the goal complete.

## Prompt-to-Artifact Checklist

| Requirement | Artifact | Evidence | Status |
| --- | --- | --- | --- |
| Frontend 90+ | `apps/mobile/components/home/HeroSection.tsx`, `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/components/invitation/InvitationPreviewCard.tsx` | Latest iOS Release simulator build succeeded with 0 errors and 2 warnings; Release app opened on iPhone 17 as `com.invitehub.app`. | Pass locally |
| Simple first page | `apps/mobile/app/(tabs)/index.tsx`, bundled template previews | Release screenshot `/private/tmp/invitehub-release-home-current.png` shows a simple template-led first page with `청첩장`, `돌잔치`, `브라이덜샤워`, `환갑잔치`, and party sections in the accessibility tree. | Pass |
| Fixed template canvas preview | `InvitationPreviewCard.tsx`, `apps/mobile/lib/template-preview-source.ts`, `apps/mobile/lib/template-preview-manifest.ts`, `apps/mobile/assets/template-previews/custom/other/*.jpeg` | Screenshot `/private/tmp/invitehub-preview-fit-to-viewport.png` shows a fixed floral template canvas with name/date/venue/message overlaid, not a generated faux card. All 31 mobile templates now resolve to blank editable canvases rather than sample-text thumbnails. | Pass |
| Preview first-screen fit | `InvitationPreviewCard.tsx`, `apps/mobile/app/builder/preview.tsx` | Builder preview uses `fitToViewport`, and iPhone 17 Release screenshot `/private/tmp/invitehub-preview-fit-to-viewport.png` shows the whole invitation canvas before the map section starts. | Pass |
| Localized invitation date | `apps/mobile/lib/date-time.ts`, `apps/mobile/lib/date-time.test.ts` | Date display is formatted by a local Korean formatter, avoiding raw ISO strings such as `2026-05-01T16:00` in preview. | Pass |
| Template selection opens usable builder | `apps/mobile/lib/drafts.ts`, `apps/mobile/lib/invitation-shared.ts` | Simulator tap: `로즈 골드 보더 디자인 선택` opened Step 1 with title, date, venue, address, message, and names prefilled; continued through Step 5 to preview. | Pass |
| Map behavior without API key | `apps/mobile/lib/map-links.ts`, `InvitationPreviewCard.tsx` | Preview and Step 5 show Kakao/Naver buttons. Code generates search links from venue/address when explicit map URLs are blank, so embedded map API is not required for this release path. | Pass |
| Backend 90+ | Supabase ownership filters, publish/payment routes | `npm run test -- --exclude=**/.claude/**` passed 52 files / 152 tests, including guest publish, RSVP, guestbook, account deletion, public assets, and payment routes. | Pass locally |
| API 90+ | `app/api/payments/free-publish/route.ts`, `app/api/payments/store/verify/route.ts`, `app/api/templates/route.ts` | Focused mobile/API gate passed 9 files / 30 tests, including JSON validation, auth, ownership, store verification, and template API tests. | Pass locally |
| Security 90+ | `docs/security-gate-90.md`, `package-lock.json`, `lib/supabase/public-write.ts`, route tests | Local security gate documents no hardcoded production secrets, explicit authz, JSON/body validation, RLS, rate limits, negative tests, and a fresh `npm audit --audit-level=high` exit 0 with no high/critical findings. | Pass locally |
| Store config 90+ | `apps/mobile/app.config.ts`, `apps/mobile/eas.json`, native project | Production bundle id is `com.invitehub.app`; production scheme is `invitehub`; dev scheme is `invitehub-dev`; Xcode is 26.3. | Pass |
| Harness 90+ | `.claude/skills/invitehub-app-builder/skill.md`, `docs/invitehub-app-harness.md`, `scripts/invitehub-release-gate.sh` | Release gate covers lint, typecheck, tests, high audit, iOS Release simulator build. | Pass |
| Role harness coverage | `.claude/agents/*.md`, `.claude/skills/invitehub-app-builder/skill.md` | Verified agents exist: product-manager, marketing-copywriter, template-image-art-director, ux-designer, mobile-frontend-engineer, mobile-backend-engineer, api-integrator, security-engineer, qa-engineer, store-manager. | Pass |
| Verification evidence | Release gate output, simulator screenshots | `SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh` passed code gates on 2026-05-03 13:24 KST: web/mobile lint, web/mobile typecheck, 58-file web/API suite with 177 tests, and focused 9-file mobile/API suite with 34 tests. The App Store packet verifier is now pinned to build 42. Escalated iOS Release build also passed separately. Screenshots: `/private/tmp/invitehub-release-home-current.png`, `/private/tmp/invitehub-preview-fit-to-viewport.png`, `/tmp/invitehub-build40-candidate-release-home-20260503.png`. Screenshot size verifier passed for `output/store-screenshots-verified/05-preview-fit-to-viewport.png`. | Pass with audit caveat |
| App Store privacy/IAP map | `app/privacy/page.tsx`, `app/support/page.tsx`, `app/terms/page.tsx`, `app/faq/page.tsx`, `docs/app-store-readiness-90.md`, `docs/store-submission-metadata.md` | Bundle ID, production scheme, IAP product ID, privacy-label basis, support/privacy/terms URL content, map-link behavior, and env mapping are documented. | Pass |
| Current EAS/Submit evidence | `scripts/eas-build-submission-status.mjs`, EAS build/submission state | EAS iOS build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) was rechecked on 2026-05-02 14:47 KST: build status `FINISHED`, app version `1.0.0`, build number `38`, commit `d8ed82188b3233bebe7be90c173d434f36690581`, linked submission `77395141-a80b-48f9-8e43-c61114fafa25` status `FINISHED`, `error: null`. | Pass for EAS upload |
| App Store Connect execution checklist | `docs/app-store-connect-execution-checklist.md`, `docs/store-screenshot-plan.md` | Official Apple submission/privacy/upcoming-requirements pages checked on 2026-05-01; EAS, TestFlight, IAP, privacy labels, screenshots, and review notes are mapped to required evidence. | Pass |
| App Review metadata accuracy | `docs/apple-review.md`, `docs/store-submission-metadata.md`, `docs/store-screenshot-plan.md` | Review notes now avoid claiming unverified profanity filter/report/block features. They document the implemented path: rate-limited RSVP/guestbook, host-approved guestbook publishing, and dashboard hide/approve moderation. | Pass |
| Previous App Store Connect TestFlight evidence | ASC TestFlight page, ASC export-compliance modal, ASC internal group page | Build 37 export compliance was saved after user approval using `위에 언급된 알고리즘에 모두 해당하지 않음`. The version build row showed `제출 준비 완료`, and the internal group page showed `Team (Expo)` with 1 tester and 1 build. This is retained as historical console evidence, but it does not prove build 38 is assigned to testers. | Historical pass only |
| Current App Store Connect TestFlight evidence | ASC TestFlight page and internal group page | Read-only Safari DOM audit on 2026-05-03 15:40 KST confirmed build `1.0.0 (41)` upload status `완료`, version-row status `제출 준비 완료`, expiry `90일 후 만료`, internal group `Team (Expo)`, invite count `1`, and installs/sessions/crashes all `-`. The tester/device side still has no build 41 install/session evidence. | Pass for ASC, blocked on iPhone |
| TestFlight crash triage | `docs/testflight-crash-triage-2026-05-03.md`, ASC TestFlight iOS build table, native config tests, CoreDevice evidence | Read-only ASC audit shows build 41 has invite `1` but installs/sessions/crashes `-`; build 39 has install `1` and crash `1`; build 38 has install `1` and crashes `3`. CoreDevice evidence on 2026-05-03 14:39 KST confirmed the connected iPhone still has `com.invitehub.app` bundle version `39` installed. Production/dev bundle ids are separated, so the leading hypothesis is an old TestFlight build rather than two apps colliding or an app-name conflict. | Blocked on iPhone build 41 install proof |
| Mac TestFlight build 40 crash | `apps/mobile/index.js`, `apps/mobile/package.json`, `apps/mobile/babel.config.js`, `apps/mobile/metro.config.js`, `apps/mobile/entry.test.ts`, `docs/testflight-crash-triage-2026-05-03.md` | macOS TestFlight build 40 crash logs show `Unhandled JS Exception: Error: No routes found` in Expo Router `ContextNavigator`. The mobile entry now uses `expo-router/entry` instead of a custom `ExpoRoot` plus `require.context("./app")`; the mobile Babel config explicitly loads Expo Router's env transform in this monorepo; `npx expo export --platform ios --output-dir /tmp/invitehub-ios-export-entry-fix-20260503-1531` passed. Build 41 carries this fix and is now processed in App Store Connect. | Fixed and uploaded, needs iPhone proof |
| TestFlight device evidence harness | `scripts/collect-testflight-device-evidence.sh`, `scripts/await-testflight-device.sh`, `scripts/diagnose-ios-device-connection.sh` | Added focused real-device evidence collection and wait harnesses for device state, lock state, TestFlight app metadata, `com.invitehub.app` app metadata, InviteHub process state, optional TestFlight launch, optional user-observed InviteHub launch, and CoreDevice/USB connection diagnostics. Evidence bundle `output/testflight-device-watch/20260503-143921/evidence/20260503-143922` reached the paired iPhone, found installed build `39`, and launch was denied because the phone was locked. Later diagnostics in `output/ios-device-diagnostics/20260503-145413` show `xctrace` can see the iPhone but `devicectl` tunnel state is still `unavailable`. | Ready, blocked on unlocked iPhone with build 41 installed |
| App Store Connect final submission surface | ASC distribution/version, app info, app privacy, IAP, review-submission pages | Read-only Chrome audit on 2026-05-07 22:03 KST found the App Store version still incomplete: iPhone 6.5 screenshot set has 0 screenshots, promo text/description/keywords/support URL/copyright fields are blank, build is not selected on the version page, App Review contact fields are blank, privacy URL is blank, privacy labels still show `시작하기`, app subtitle/category/age rating are not set, and the app name still includes `InviteHub (40c8af)`. | Blocked externally |
| Paid publish fallback | `apps/mobile/lib/release-flags.ts`, `lib/release-flags.ts`, `.env.example`, `apps/mobile/.env.example` | Paid photo publishing now defaults off unless web and mobile public env flags are explicitly enabled. Targeted tests passed, web/mobile typecheck and lint passed, and iPhone 17 Release simulator screenshots show the photo step disabled without an IAP purchase UI. | Pass locally |
| Current paid-fallback EAS build | EAS build 38, EAS Submit | Build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) finished and was uploaded to App Store Connect. It contains commit `d8ed82188b3233bebe7be90c173d434f36690581`. Apple processing, export-compliance clearance, and internal group assignment were confirmed on 2026-05-02 15:32 KST. | Pass for upload and ASC |
| Current launch-crash recovery build | EAS build 40, EAS Submit, ASC TestFlight group | build 40 is uploaded and submitted through EAS Submit as `86a14873-bdfd-4390-87d1-81ae0ddd06dc`. Submission `cf537e44-73dd-4a2d-8640-7d31e9facba8` finished with `error: null`. A group-submit retry `949d446f-dea1-490f-8b52-2de359d899ee` ended `ERRORED`, but direct App Store Connect evidence confirms build 40 is now in `Team (Expo)` and `테스트 중`. It contains source commit `9c83039`, which removes optional Google/Kakao/IAP/Nitro native modules from the first-submission binary. | Pass for EAS and ASC, blocked on iPhone evidence |
| Build 41 EAS upload and submission evidence | EAS build 41, EAS Submit, ASC TestFlight group | build 41 is uploaded and submitted through EAS Submit as `61bc2e17-0c5a-45f3-94ee-bf3b63e09f03`. Submission `25518b07-b8de-4507-8a0e-20d85bfe9e14` finished with `error: null`. It contains local source commit `0655ced`, which restores the Expo Router release entry and fixes the build 40 `No routes found` crash path. App Store Connect now shows build 41 processed and assigned to `Team (Expo)`. | Pass for EAS and ASC, blocked on iPhone evidence |
| Build 42 local crash-fix candidate | `docs/app-store-connect-build42-packet.md`, `docs/testflight-crash-triage-2026-05-06.md`, `docs/testflight-crash-triage-2026-05-07.md`, native Pod/Xcode files | build 42 was prepared at source commit `73872e2` with crash-fix code from `0d21924`. It builds React Native iOS from source, removes the prebuilt `React.framework` / `ReactNativeDependencies.framework` embed path, lazy-loads optional browser/auth native modules, and passed the local Release simulator/source-build checks plus release gate. EAS Build and EAS Submit are finished for build `88c911f5-3c21-41e8-a6a2-a04939fa6179`; App Store Connect shows build 42 processed and assigned to `Team (Expo)`. The user-provided real iPhone recording from 2026-05-07 23:43 KST shows build `1.0.0 (42)` crashing on launch, so it is not a valid release candidate. The next local patch further removes auth/Supabase/draft imports from first home render, and the patched Release simulator build opened on iPhone 17 on 2026-05-08. | Failed on real iPhone; next patch passes local simulator |
| Build 42 EAS upload and submission evidence | EAS build 42, EAS Submit, App Store Connect processing, user iPhone recording | build 42 is uploaded and submitted through EAS Submit as `88c911f5-3c21-41e8-a6a2-a04939fa6179`. Submission `ba6727cf-2c1d-464f-a005-6ce9670d4f81` finished with `error: null`. IPA artifact is `https://expo.dev/artifacts/eas/hTEP9Gx8wMFmK6w9aKSmcc.ipa`. Chrome App Store Connect evidence on 2026-05-07 21:49 KST shows `1.0.0 (42)` upload status `완료`, version-row status `제출 준비 완료`, internal group `Team (Expo)`, and invite count `1`. Real iPhone recording on 2026-05-07 23:43 KST shows build 42 detail and then the iOS crash prompt, so this is pass for upload only and fail for device launch. | Pass for EAS/ASC, failed on iPhone |
| Build 43 EAS upload and submission evidence | `docs/app-store-connect-build43-packet.md`, EAS build 43, EAS Submit | build 43 uploaded and submitted through EAS Submit as `9a4a25a7-c362-4ba0-9c01-fdac8b0f942c`. Submission `595cd20f-6d0d-4c72-887f-ffcc7b614dd6` finished with `error: null`. IPA artifact is `https://expo.dev/artifacts/eas/k435zPEohnNNZiQAiAB9Wq.ipa`. Apple accepted the upload and App Store Connect processing is pending. | Pass for EAS upload, pending ASC/iPhone |

## Completion Verdict

The local codebase still meets the practical 90+ release bar for code, build,
UI/UX, backend/API, and security evidence. The latest UI complaint about the
invitation preview has been fixed and simulator-verified. Build 42 is no longer
the iPhone crash-fix candidate because the user's real-device TestFlight
recording shows it still crashes on launch.

Build 42 is uploaded through EAS Submit and App Store Connect shows it as
processed and assigned to internal group `Team (Expo)`. It is not treated as a
proven iPhone release candidate because real-device TestFlight launch evidence
is negative.

The full active goal is not complete yet because:

- App Store Connect final submission surfaces are verified incomplete:
  metadata, privacy labels, screenshots, review notes, build selection, app
  information, and IAP product state still need to be entered/saved before App
  Store submission.
- Real iPhone TestFlight launch evidence failed for build 42. A newer build is
  required before the App Store version build can be selected.

## Next Required Action

Prepare and upload a newer TestFlight build after the startup-surface reduction
patch, then perform a real iPhone launch smoke test. Separately, save App Store Connect
metadata, screenshots, privacy labels, review notes/contact, version build
selection, app information, and IAP/paid-feature state after explicit user
approval.

Do not mark the goal complete until:

- A newer crash-fix build is uploaded, processed, assigned to internal
  TestFlight, installed by the internal tester, and the user confirms successful
  launch on their iPhone.
- App Store Connect metadata, privacy labels, screenshots, review notes, version
  build selection, app information, and IAP product state are entered, saved, and
  verified.
- App Store Connect metadata/privacy/screenshot/review/contact state is saved
  and verified.

Manual Apple-side confirmation path:

1. App Store Connect TestFlight URL:
   `https://appstoreconnect.apple.com/apps/6763630299/testflight/ios`.
2. Confirm the newer build remains visible in App Store Connect TestFlight.
3. Confirm the newer build remains in internal group `Team (Expo)`.
4. Install/update InviteHub from TestFlight on the user's iPhone and smoke test
   home -> template selection -> builder Step 1 -> preview.
5. Record the newer passing build with generic evidence keys:
   `currentTestFlightBuildProcessed`, `currentBuildExportComplianceSaved`,
   `currentBuildAssignedToInternalGroup`, and
   `currentReleaseBuildSelectedForVersion`. Do not record build 42 as the
   selected App Store version.

## Latest Local Evidence

- `SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`:
  passed code gates on 2026-05-03 13:24 KST. It ran web lint, web typecheck,
  58-file web/API test suite with 177 tests, mobile lint, mobile typecheck, and
  focused 9-file mobile/API test suite with 34 tests. The 88-check App Store
  packet verifier is now pinned to build 42.
- Escalated iOS Release simulator build:
  `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`;
  passed with 0 errors and 2 warnings; installed and opened `com.invitehub.app`
  on iPhone 17.
- Post-build-42 startup-surface reduction Release simulator build:
  `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`;
  passed with 0 errors and 4 warnings on 2026-05-08 17:25 KST, installed and
  opened `com.invitehub.app` on iPhone 17. Screenshot:
  `output/testflight-device-watch/20260508-codex-update/evidence/release-simulator-home.png`.
- App Store external evidence contract now uses generic current-build keys
  instead of requiring failed build 42 to be selected for the App Store version.
  The historical build 42 evidence remains in the manifest, but goal completion
  requires a newer passing TestFlight build and `currentReleaseBuildSelectedForVersion`.
- Next-build upload packet is prepared at
  `docs/app-store-connect-next-build-packet.md` for the post-build-42 candidate
  on the current branch head; upload still requires explicit user approval and
  the source commit must be captured with `git rev-parse --short HEAD`
  immediately before running EAS.
- Build 43 EAS upload and EAS Submit are finished:
  `9a4a25a7-c362-4ba0-9c01-fdac8b0f942c`,
  submission `595cd20f-6d0d-4c72-887f-ffcc7b614dd6`, artifact
  `https://expo.dev/artifacts/eas/k435zPEohnNNZiQAiAB9Wq.ipa`. Apple processing
  is pending, so current-build external evidence is not complete yet.
- `npm run test -- --exclude=**/.claude/**`: 58 test files / 177 tests passed
  in the latest release gate.
- Focused mobile/API tests: 9 test files / 34 tests passed in the latest
  release gate.
- Latest Release home screenshot:
  `/private/tmp/invitehub-release-home-current.png`.
- Latest fixed template preview screenshot from real Simulator taps:
  `/private/tmp/invitehub-preview-fit-to-viewport.png`.
- Latest post-canvas Release screenshot from real Simulator taps:
  `/private/tmp/invitehub-post-canvas-preview.png`; copied to
  `output/store-screenshots-verified/06-preview-fixed-canvas.png`.
- Blank editable canvas coverage:
  `apps/mobile/lib/template-preview-source.test.ts` now requires every mobile
  template to have a blank canvas asset; missing housewarming, baby, graduation,
  and business canvases were generated under
  `apps/mobile/assets/template-previews/custom/other/`.
- Latest escalated iOS Release simulator build after the preview fit update:
  `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`;
  passed with 0 errors and 2 warnings.
- Verified screenshot size command:
  `scripts/verify-store-screenshots.sh output/store-screenshots-verified`;
  passed for `05-preview-fit-to-viewport.png` and
  `06-preview-fixed-canvas.png` at `1206x2622`.
- Build 40 local submission screenshot candidate:
  `zsh scripts/capture-store-screenshots.sh output/store-screenshots-submission-build40`
  generated six images on 2026-05-03 after the capture script was adjusted to
  wait for the Release home screen. `scripts/verify-store-screenshots.sh
  output/store-screenshots-submission-build40` passed all six at `1206x2622`.
  Manual visual review found no iOS open-confirmation prompt, dev overlay, or
  simulator window chrome.
- Fresh dependency audit:
  `npm audit --audit-level=high` exited 0 on 2026-05-03 13:24 KST. Current
  audit output has moderate-only transitive findings for PostCSS and uuid in
  Expo/Next tooling chains.
- `zsh scripts/capture-store-screenshots.sh output/store-screenshots-current`
  generated six images, but `simctl openurl` can trigger an iOS "Open in
  InviteHub" confirmation prompt. Treat that script as a capture helper, not
  final App Store screenshot evidence unless the prompt is manually cleared
  before each route capture.
- External execution checklist: `docs/app-store-connect-execution-checklist.md`.
- Security gate: `docs/security-gate-90.md`.
- EAS build 36 (`232b8941-5ec8-42fd-ba87-f225b4f460f1`) failed with
  `XCODE_BUILD_ERROR` from `expo-image-picker` Swift references to `RCTFatal`
  and `RCTErrorWithMessage`.
- EAS archive size was reduced by running release builds with `EAS_NO_VCS=1`
  after `.git/objects` dominated the default upload archive.
- `expo-image-picker` was upgraded to `55.0.19`; local generic iOS device
  archive compile passed with `xcodebuild ... -sdk iphoneos ... CODE_SIGNING_ALLOWED=NO build`.
- EAS build 37 (`4d995997-e952-4ada-83bf-bc6a929be412`) finished successfully
  and EAS submission `bb2999db-8820-42a7-9bdf-fb2bfd7f6d21` finished with no
  reported submission error.
- EAS build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) finished successfully
  and produced an IPA at
  `https://expo.dev/artifacts/eas/rSC48xVHdYJGyV4nTs3ZdT.ipa`. EAS Submit
  uploaded it to App Store Connect and Apple processing started. Submission
  details:
  `https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/77395141-a80b-48f9-8e43-c61114fafa25`.
- `node scripts/eas-build-submission-status.mjs d185dfc1-9110-4d81-b510-08e02f1ece7f`
  confirmed build 38 status `FINISHED`, app version `1.0.0`, build number `38`,
  git commit `d8ed82188b3233bebe7be90c173d434f36690581`, and linked submission
  `77395141-a80b-48f9-8e43-c61114fafa25` status `FINISHED` with `error: null`.
- Fresh EAS status recheck on 2026-05-02 14:47 KST returned the same build 38
  and linked submission status: `FINISHED`, `error: null`.
- App Store Connect TestFlight shows `1.0.0 (37)` upload status `완료`, created
  `May 2, 2026 12:46 PM`, and version build row status
  `수출 규정 관련 문서 누락`.
- Future builds now declare exempt/non-non-exempt encryption usage through
  `apps/mobile/app.config.ts` and `apps/mobile/ios/InviteHub/Info.plist`
  (`ITSAppUsesNonExemptEncryption=false`).
- App Store Connect export compliance for build 37 was saved after explicit user
  approval on 2026-05-02. The selected answer was
  `위에 언급된 알고리즘에 모두 해당하지 않음`.
- App Store Connect now shows build 37 status `제출 준비 완료` in the iOS build
  list and `테스트 중` inside internal group `Team (Expo)`.
- `Team (Expo)` shows `내부 그룹 ∙ 1명의 테스터 ∙ 1개의 빌드`; the tester row
  lists `dudqks2@gmail.com` / `정영빈` with status `초대됨`, dated
  `2026년 5월 2일`.
- Read-only App Store Connect final submission audit on 2026-05-03 13:37 KST:
  - Version page `1.0 제출 준비 중`: 0 iPhone screenshots, promo/description/
    keywords/support/copyright/review-note fields blank, build selector still
    showing `빌드 추가`, and no submitted review items.
  - App information page: name is still `InviteHub (40c8af)`, subtitle is blank,
    category is still default/unset, and age rating is not configured.
  - App privacy page: privacy URL is blank, optional user privacy URL is blank,
    data collection answers are not started, and publish is disabled.
  - IAP page: no in-app purchase product exists yet; only the create button is
    shown.
  - URL check: `https://invitehub.co.kr` and `/privacy`/`/terms` do not resolve
    by DNS, while `https://invitation-platform-youngbeens-projects.vercel.app`
    `/privacy`, `/terms`, and `/support` return HTTP 200. EAS production env has
    `EXPO_PUBLIC_WEB_BASE_URL` set to that Vercel URL.
- Live URL recheck on 2026-05-02 14:26 KST:
  `https://invitation-platform-youngbeens-projects.vercel.app/privacy`,
  `/terms`, and `/support` all returned HTTP 200. `https://invitehub.co.kr/privacy`
  still failed DNS resolution, so App Store Connect metadata must use the
  verified Vercel URLs until DNS is connected.
- DNS recheck on 2026-05-02 14:47 KST returned no A/NS/MX records for
  `invitehub.co.kr`; `support@invitehub.co.kr` must not be used as the App
  Review contact until DNS/MX and mailbox receipt are confirmed. The public
  support page now reads `NEXT_PUBLIC_SUPPORT_EMAIL` and avoids hardcoding the
  unverified address.
- Support contact fallback verification on 2026-05-02 14:52 KST:
  `npm run test -- lib/support-contact.test.ts --exclude='**/.claude/**'`
  passed 1 file / 2 tests, `npm run lint` passed, and `npm run typecheck`
  passed.
- Fast release gate recheck on 2026-05-03 13:24 KST:
  `SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed web lint, web typecheck, 58-file web/API test suite with 177 tests,
  mobile lint, mobile typecheck, and focused 9-file mobile/API suite with 34
  tests. The App Store packet verifier is pinned to build 42.
- App Store Connect TestFlight group check on 2026-05-03 12:53 KST:
  internal group `Team (Expo)` shows `내부 그룹 ∙ 1명의 테스터 ∙ 4개의 빌드`.
  The group build tab lists `1.0.0 (40)` with status `테스트 중`, platform
  `iOS`, no sessions, and no crashes.
- App Store Connect build 41 check on 2026-05-03 15:40 KST:
  iOS build upload list shows `1.0.0 (41)` status `완료`; the version `1.0.0`
  TestFlight table shows build 41 status `제출 준비 완료`, expiry `90일 후 만료`,
  group `Team (Expo)`, invite count `1`, and installs/sessions/crashes all `-`.
- App Store Connect read-only recheck on 2026-05-03 15:49 KST:
  build 41 still shows invite `1`, installs `-`, sessions `-`, crashes `-`, and
  feedback `-`. This confirms App Store Connect has no real iPhone build 41
  install/session evidence yet.
- Real-device capture attempt on 2026-05-03 16:02 KST:
  `bash scripts/await-testflight-device.sh --timeout 120 --interval 5 --launch`
  timed out with `devicectl-error`. Evidence:
  `output/testflight-device-watch/20260503-160203`.
- Escalated iOS device diagnostics on 2026-05-03 16:05 KST:
  `devicectl` found device `영빈` as paired with developer mode enabled, but
  `tunnelState` was `unavailable`; `xctrace` listed the iPhone under
  `Devices Offline`; lock-state still failed with CoreDevice error `1011`.
  Evidence: `output/ios-device-diagnostics/20260503-160544`.
- App Store Connect read-only recheck on 2026-05-03 16:06 KST:
  build 41 still shows installs `-`, sessions `-`, crashes `-`, and feedback
  `-`. This confirms neither local CoreDevice nor ASC currently proves build 41
  real-device launch.
- Real-device install evidence on 2026-05-06 19:02 KST:
  `bash scripts/collect-testflight-device-evidence.sh` reached the paired
  iPhone, confirmed the device was unlocked, and found `InviteHub`
  `com.invitehub.app` installed as version `1.0.0`, bundle version `41`.
  Evidence: `output/testflight-device-evidence/20260506-190249`.
- Real-device launch evidence on 2026-05-06 19:03 KST:
  `bash scripts/collect-testflight-device-evidence.sh --launch` launched
  `com.invitehub.app` successfully with exit code `0`. Evidence:
  `output/testflight-device-evidence/20260506-190312`. This proves build 41 can
  be launched by CoreDevice, but the full user-facing smoke path
  home -> template -> builder -> preview still needs visual/user confirmation
  before the `realIphoneTestFlightInstallLaunchPassed` evidence key can be
  marked complete.
- Goal completion verifier:
  `node scripts/verify-goal-completion.mjs` returns `blocked` until
  `docs/app-store-external-evidence.json` exists and every Apple-side evidence
  item has `status: true`, a `capturedAt` date, `evidence`, and an `artifact`
  that is an `https://` URL, existing local file path, or `user-confirmation:`
  reference. The filled evidence file is gitignored; only the template is
  tracked.
- Goal completion verifier tests:
  `npm run test -- scripts/record-app-store-evidence.test.ts scripts/verify-goal-completion.test.ts --exclude='**/.claude/**'`
  passed 2 files / 10 tests on 2026-05-03 13:31 KST. It covers missing
  manifest, legacy boolean evidence, invalid artifacts, App Store Connect
  local-file artifact rejection, existing manifest key backfill, and the fully
  structured pass path.
- App Store evidence recorder:
  `node scripts/record-app-store-evidence.mjs --list` lists the allowed
  Apple-side evidence keys, and the recorder writes only the gitignored
  `docs/app-store-external-evidence.json` manifest.
- App Store evidence recorder tests are included in the same 2026-05-03
  2-file / 10-test run and cover key listing, valid structured evidence
  recording, existing manifest key backfill, unknown-key rejection,
  invalid-artifact rejection, and rejection of local file paths for App Store
  Connect upload evidence.
- Paid-publish fallback verification on 2026-05-02 13:38 KST:
  - `npm run test -- apps/mobile/lib/release-flags.test.ts apps/mobile/lib/preview-flow.test.ts apps/mobile/lib/payments/pricing.test.ts apps/mobile/lib/invitations.test.ts lib/release-flags.test.ts --exclude='**/.claude/**'`: 5 files / 14 tests passed.
  - `npm --prefix apps/mobile run typecheck`: passed.
  - `npm run typecheck`: passed.
  - `npm --prefix apps/mobile run lint`: passed.
  - `npm run lint`: passed.
  - `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`: build succeeded with 0 errors and 5 warnings, installed and opened `com.invitehub.app`.
  - New simulator evidence:
    `output/store-screenshots-fallback/01-home-paid-disabled.png` and
    `output/store-screenshots-fallback/02-step3-paid-disabled.png`, both
    verified at `1206x2622`. The Step 3 screenshot shows "사진 포함 발행 준비 중"
    and disabled photo buttons, with no store purchase button.

## Current Blocker

The current blocker is no longer EAS build/upload, Apple processing, export
compliance, or internal group assignment. Build 41 has been uploaded through
EAS Submit after the build 40 Expo Router launch-crash diagnosis, and App Store
Connect now shows it processed and assigned to internal group `Team (Expo)`.

The remaining blocker for marking the broader App Store readiness goal complete
is direct iPhone TestFlight install/launch evidence for build 41. App Store
Connect still shows the target tester's current installed version as `1.0.0
(39)` with crash evidence, so build 41 has not yet been proven on the real
iPhone. The broader store-submission surfaces also remain:
app name/subtitle/category/age rating, version metadata, version build
selection, privacy URL and privacy labels, screenshots, review notes, verified
App Review contact email, and IAP product state or verified paid-feature
fallback.
