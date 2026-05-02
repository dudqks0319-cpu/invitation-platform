# InviteHub Goal Completion Audit - 90점 Release Readiness

Date: 2026-05-01
Latest update: 2026-05-02 14:57 KST

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
| Verification evidence | Release gate output, simulator screenshots | `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh` passed again on 2026-05-02 14:56 KST: web/mobile lint, web/mobile typecheck, 55-file web/API suite with 160 tests, focused 9-file mobile/API suite with 30 tests, and 36-check App Store packet verification. Escalated iOS Release build also passed separately. Screenshots: `/private/tmp/invitehub-release-home-current.png`, `/private/tmp/invitehub-preview-fit-to-viewport.png`. Screenshot size verifier passed for `output/store-screenshots-verified/05-preview-fit-to-viewport.png`. | Pass with audit caveat |
| App Store privacy/IAP map | `app/privacy/page.tsx`, `app/support/page.tsx`, `app/terms/page.tsx`, `app/faq/page.tsx`, `docs/app-store-readiness-90.md`, `docs/store-submission-metadata.md` | Bundle ID, production scheme, IAP product ID, privacy-label basis, support/privacy/terms URL content, map-link behavior, and env mapping are documented. | Pass |
| Current EAS/Submit evidence | `scripts/eas-build-submission-status.mjs`, EAS build/submission state | EAS iOS build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) was rechecked on 2026-05-02 14:47 KST: build status `FINISHED`, app version `1.0.0`, build number `38`, commit `d8ed82188b3233bebe7be90c173d434f36690581`, linked submission `77395141-a80b-48f9-8e43-c61114fafa25` status `FINISHED`, `error: null`. | Pass for EAS upload |
| App Store Connect execution checklist | `docs/app-store-connect-execution-checklist.md`, `docs/store-screenshot-plan.md` | Official Apple submission/privacy/upcoming-requirements pages checked on 2026-05-01; EAS, TestFlight, IAP, privacy labels, screenshots, and review notes are mapped to required evidence. | Pass |
| App Review metadata accuracy | `docs/apple-review.md`, `docs/store-submission-metadata.md`, `docs/store-screenshot-plan.md` | Review notes now avoid claiming unverified profanity filter/report/block features. They document the implemented path: rate-limited RSVP/guestbook, host-approved guestbook publishing, and dashboard hide/approve moderation. | Pass |
| Previous App Store Connect TestFlight evidence | ASC TestFlight page, ASC export-compliance modal, ASC internal group page | Build 37 export compliance was saved after user approval using `위에 언급된 알고리즘에 모두 해당하지 않음`. The version build row showed `제출 준비 완료`, and the internal group page showed `Team (Expo)` with 1 tester and 1 build. This is retained as historical console evidence, but it does not prove build 38 is assigned to testers. | Historical pass only |
| Current App Store Connect TestFlight evidence | ASC TestFlight page and internal group page | Read-only Safari DOM audit on 2026-05-02 15:32 KST confirmed iOS build `1.0.0 (38)` status `완료`, version build 38 status `제출 준비 완료`, and internal group `TE Team (Expo)` assigned with 1 tester and 2 builds. The tester row is still `dudqks2@gmail.com` / `정영빈` status `초대됨` with no device/session evidence. | Pass for ASC, blocked on iPhone |
| App Store Connect final submission surface | ASC distribution/version, app info, app privacy, IAP, review-submission pages | Read-only audit on 2026-05-02 13:21 KST found the App Store version still incomplete: iPhone screenshot set has 0 screenshots, version metadata fields are blank, build is not selected on the version page, app review submission list is empty, app privacy URL is blank and labels are not started, IAP list has no product, app subtitle/category/age rating are not set, and the app name still includes `InviteHub (40c8af)`. | Blocked externally |
| Paid publish fallback | `apps/mobile/lib/release-flags.ts`, `lib/release-flags.ts`, `.env.example`, `apps/mobile/.env.example` | Paid photo publishing now defaults off unless web and mobile public env flags are explicitly enabled. Targeted tests passed, web/mobile typecheck and lint passed, and iPhone 17 Release simulator screenshots show the photo step disabled without an IAP purchase UI. | Pass locally |
| Current paid-fallback EAS build | EAS build 38, EAS Submit | Build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) finished and was uploaded to App Store Connect. It contains commit `d8ed82188b3233bebe7be90c173d434f36690581`. Apple processing, export-compliance clearance, and internal group assignment were confirmed on 2026-05-02 15:32 KST. | Pass for upload and ASC |

## Completion Verdict

The local codebase and EAS upload path now meet the practical 90+ release bar
for code, build, and binary submission evidence. The latest UI complaint about
the invitation preview has been fixed and simulator-verified. App Store Connect
now confirms build 38 is processed, export-compliance-cleared, and assigned to
the internal group, but the tester has not accepted/installed it on the target
iPhone yet.

The full active goal is not complete yet because:

- App Store Connect final submission surfaces are verified incomplete:
  metadata, privacy labels, screenshots, review notes, build selection, app
  information, and IAP product state still need to be entered/saved before App
  Store submission.
- Real iPhone install/launch evidence from TestFlight is still not captured.
  App Store Connect shows tester `dudqks2@gmail.com` / `정영빈` remains
  `초대됨`, with no device/session evidence.

## Next Required Action

Open TestFlight on the target iPhone, accept the invitation for
`dudqks2@gmail.com` if needed, install build `1.0.0 (38)`, and perform a launch
smoke test.

Do not mark the goal complete until:

- The build is installed in TestFlight by an internal tester, or the user
  confirms successful installation on their iPhone.
- App Store Connect metadata, privacy labels, screenshots, review notes, version
  build selection, app information, and IAP product state are entered, saved, and
  verified.
- App Store Connect metadata/privacy/screenshot/review/contact state is saved
  and verified.

Manual Apple-side confirmation path:

1. App Store Connect TestFlight URL:
   `https://appstoreconnect.apple.com/apps/6763630299/testflight/ios`.
2. Confirm `1.0.0 (38)` appears after Apple processing.
3. Save export compliance for build 38 if prompted.
4. Assign build 38 to internal group `TE Team (Expo)`.
5. Install/update InviteHub from TestFlight on the user's iPhone and smoke test
   home -> template selection -> builder Step 1 -> preview.

## Latest Local Evidence

- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`:
  passed again on 2026-05-02 14:56 KST. It ran web lint, web typecheck, 55-file
  web/API test suite with 160 tests, mobile lint, mobile typecheck, focused
  9-file mobile/API test suite with 30 tests, and the 36-check App Store packet
  verifier.
- Escalated iOS Release simulator build:
  `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`;
  passed with 0 errors and 2 warnings; installed and opened `com.invitehub.app`
  on iPhone 17.
- `npm run test -- --exclude=**/.claude/**`: 52 test files / 152 tests passed.
- Focused mobile/API tests: 9 test files / 30 tests passed.
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
- Fresh dependency audit:
  `npm audit --audit-level=high` exited 0 on 2026-05-01 18:06 KST. Current
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
  list and `테스트 중` inside internal group `TE Team (Expo)`.
- `TE Team (Expo)` shows `내부 그룹 ∙ 1명의 테스터 ∙ 1개의 빌드`; the tester row
  lists `dudqks2@gmail.com` / `정영빈` with status `초대됨`, dated
  `2026년 5월 2일`.
- Read-only App Store Connect final submission audit on 2026-05-02 13:21 KST:
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
- Fast release gate recheck on 2026-05-02 14:56 KST:
  `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed web lint, web typecheck, 55-file web/API test suite with 160 tests,
  mobile lint, mobile typecheck, focused 9-file mobile/API suite with 30 tests,
  and the new 36-check App Store packet verifier.
- Goal completion verifier:
  `node scripts/verify-goal-completion.mjs` returns `blocked` until
  `docs/app-store-external-evidence.json` exists and every Apple-side evidence
  item has `status: true`, a `capturedAt` date, `evidence`, and an `artifact`
  that is an `https://` URL, existing local file path, or `user-confirmation:`
  reference. The filled evidence file is gitignored; only the template is
  tracked.
- Goal completion verifier tests:
  `npm run test -- scripts/verify-goal-completion.test.ts --exclude='**/.claude/**'`
  passed on 2026-05-02 15:13 KST. It covers missing manifest, legacy boolean
  evidence, invalid artifacts, and the fully structured pass path.
- App Store evidence recorder:
  `node scripts/record-app-store-evidence.mjs --list` lists the allowed
  Apple-side evidence keys, and the recorder writes only the gitignored
  `docs/app-store-external-evidence.json` manifest.
- App Store evidence recorder tests:
  `npm run test -- scripts/record-app-store-evidence.test.ts --exclude='**/.claude/**'`
  passed on 2026-05-02 15:18 KST. It covers key listing, valid structured
  evidence recording, unknown-key rejection, and invalid-artifact rejection.
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

The current blocker is no longer EAS build/upload or build 38 TestFlight
assignment. Build 38 has been uploaded through EAS Submit, contains the
paid-publish fallback, is processed in App Store Connect, is
export-compliance-cleared, and is assigned to `TE Team (Expo)`.

The remaining blocker for marking the broader App Store readiness goal complete
is direct iPhone TestFlight install/launch evidence for build 38. App Store
Connect still shows `dudqks2@gmail.com` / `정영빈` as `초대됨`, with no
device/session evidence. The broader store-submission surfaces also remain:
app name/subtitle/category/age rating, version metadata, version build
selection, privacy URL and privacy labels, screenshots, review notes, verified
App Review contact email, and IAP product state or verified paid-feature
fallback.
