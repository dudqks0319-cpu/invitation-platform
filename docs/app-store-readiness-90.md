# InviteHub 90점 App Store Readiness Plan

목표: 프론트엔드, 백엔드, UI/UX, API, 보안, 스토어 제출 영역을 모두 90점 이상으로 유지한다.

## Current 90+ Gate

| Area | Pass Criteria |
| --- | --- |
| Frontend | Expo mobile lint/typecheck, focused mobile tests, Release simulator build pass. |
| UI/UX | Home starts with template examples, category sections are visible, card tap enters builder. |
| Backend | Supabase ownership filters are explicit for invitation/payment writes. |
| API | Write endpoints reject non-JSON bodies, invalid payloads, missing auth, and wrong ownership. |
| Security | `npm audit --audit-level=high` passes, no hardcoded secrets, rate limits exist for public writes. |
| Store | Production bundle id is `com.invitehub.app`, production scheme is `invitehub`, dev scheme is separate. |
| QA | Simulator evidence exists for home and template-to-builder flow; TestFlight evidence required before external review. |

Latest local evidence after the build 40 TestFlight stabilization update:

- Build 40 App Store Connect entry values are consolidated in
  `docs/app-store-connect-build40-packet.md`.
- `node scripts/eas-build-submission-status.mjs 86a14873-bdfd-4390-87d1-81ae0ddd06dc`
  returned build 40 `FINISHED`, linked submission `FINISHED`, `error: null`.
- Build 40 supersedes builds 38 and 39 after the user's iPhone showed the same
  TestFlight launch crash dialog for both prior builds.
- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed code gates on 2026-05-03 12:37 KST through web/mobile lint,
  web/mobile typecheck, the 58-file web/API test suite with 175 tests, and the
  focused 9-file mobile/API test suite with 34 tests. The packet verifier is now
  pinned to build 40.
- Escalated local iOS Release simulator build passed with 0 errors and 2
  warnings and opened `com.invitehub.app` on iPhone 17.
- Release home screenshot:
  `/private/tmp/invitehub-release-home-current.png`.
- Fixed invitation preview screenshot from real Simulator taps:
  `/private/tmp/invitehub-preview-fit-to-viewport.png`.
- Latest post-canvas preview screenshot from real Simulator taps:
  `/private/tmp/invitehub-post-canvas-preview.png`, copied to
  `output/store-screenshots-verified/06-preview-fixed-canvas.png`.
- All 31 mobile templates now have editable blank canvas assets. Missing
  housewarming, baby shower, graduation, and business canvases were added under
  `apps/mobile/assets/template-previews/custom/other/`, and
  `apps/mobile/lib/template-preview-source.test.ts` enforces full coverage.
- Invitation preview date strings use a local Korean formatter, so raw ISO
  values are not shown in the preview.
- After the preview fit update, escalated iOS Release simulator build passed
  again with 0 errors and 2 warnings.
- `scripts/verify-store-screenshots.sh output/store-screenshots-verified`
  passed for the verified preview PNGs at `1206x2622`.
- Security gate evidence is documented in `docs/security-gate-90.md`.
- Fresh `npm audit --audit-level=high` exited 0 on 2026-05-01 18:06 KST with
  no high or critical findings. Audit output still has moderate-only transitive
  findings in Expo/Next tooling chains.
- EAS iOS build 37 (`4d995997-e952-4ada-83bf-bc6a929be412`) finished
  successfully after upgrading `expo-image-picker` to `55.0.19`.
- EAS submission `bb2999db-8820-42a7-9bdf-fb2bfd7f6d21` finished with no
  reported submission error.
- EAS iOS build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) finished
  successfully on 2026-05-02 and was uploaded to App Store Connect through EAS
  Submit. It contains commit `d8ed82188b3233bebe7be90c173d434f36690581`, the
  paid-publish fallback build.
- `node scripts/eas-build-submission-status.mjs d185dfc1-9110-4d81-b510-08e02f1ece7f`
  confirmed the linked EAS submission is `FINISHED` with no error.
- The same EAS status command was re-run on 2026-05-02 14:47 KST and again
  returned build 38 `FINISHED`, linked submission `FINISHED`, `error: null`.
- App Store Connect TestFlight shows `1.0.0 (37)` upload status `완료` for app
  id `6763630299`.
- Export compliance for build 37 was saved after explicit user approval. The
  version build row now shows `제출 준비 완료`.
- Internal group `TE Team (Expo)` shows `1명의 테스터`, `1개의 빌드`, and build
  `1.0.0 (37)` status `테스트 중`.
- Build 40 Apple processing and internal group assignment still need App Store
  Connect confirmation before real-device TestFlight QA.
- Future builds declare `ITSAppUsesNonExemptEncryption=false` through Expo iOS
  config and the native `Info.plist`.
- Read-only App Store Connect final-submission audit on 2026-05-02 13:21 KST
  confirmed the build 37 TestFlight path was usable, but the current App Store
  version surface was not ready: screenshots are 0, metadata/review fields are
  blank, no current build is selected for the App Store version, app privacy
  answers are not started, IAP product does not exist, app category/age rating
  are not set, and the app name still shows `InviteHub (40c8af)`.
- First-submission paid-publish fallback is now represented in code: paid photo
  publishing is disabled unless `NEXT_PUBLIC_ENABLE_PAID_PUBLISH=true` and
  `EXPO_PUBLIC_ENABLE_PAID_PUBLISH=true` are set. The app and web copy avoid
  exposing the IAP purchase flow while App Store Connect has no IAP product.
- Verification for that fallback passed on 2026-05-02: targeted 5-file test
  suite, web/mobile typecheck, web/mobile lint, iPhone 17 Release simulator
  build, and screenshot size check for
  `output/store-screenshots-fallback/01-home-paid-disabled.png` and
  `02-step3-paid-disabled.png`.
- Fast release gate recheck passed on 2026-05-02 14:56 KST with web/mobile
  lint, web/mobile typecheck, 55-file web/API tests with 160 tests, focused
  9-file mobile/API tests with 30 tests, and the 36-check App Store packet
  verifier.
- Live URL recheck on 2026-05-02 14:26 KST: the Vercel `/privacy`, `/terms`,
  and `/support` URLs returned HTTP 200. `https://invitehub.co.kr/privacy` still
  failed DNS resolution.
- DNS recheck on 2026-05-02 14:47 KST returned no A/NS/MX records for
  `invitehub.co.kr`; do not use `support@invitehub.co.kr` as an App Review
  contact until DNS/MX and mailbox receipt are confirmed.
- The public support page now reads `NEXT_PUBLIC_SUPPORT_EMAIL` instead of
  hardcoding the unverified mailbox. `lib/support-contact.test.ts`, web lint,
  and web typecheck passed on 2026-05-02 14:52 KST.

## Required Command

Run before marking a release candidate:

```bash
zsh scripts/invitehub-release-gate.sh
```

For a faster local rerun after the iOS build was already verified:

```bash
SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh
```

## External App Store Console Checklist

These cannot be fully completed from code alone:

- App Store Connect app record points to bundle id `com.invitehub.app`.
- TestFlight build 38 is uploaded through EAS Submit and contains the latest
  release fallback. App Store Connect processing/group assignment and real
  iPhone install/launch evidence are still needed.
- App Privacy labels match collected data: account, invitations, RSVP, guestbook, photos, purchase records.
- IAP product for photo-included publishing is created, priced, and approved, or
  the paid publish flag remains disabled and paid claims stay hidden.
- Screenshots match the current simplified home and builder flow.
- Review notes explain no-login draft creation, login-required publish
  management, and the current photo-less free publish path. Mention the IAP
  publish flow only after the App Store Connect product exists.
- Support, privacy, terms, and FAQ copy matches the actual pricing policy:
  free template/draft/preview/photo-less publish now, paid photo-included
  publish only after store products are ready.
- Public support/privacy/terms URLs are live. `invitehub.co.kr` currently does
  not resolve by DNS; the verified live fallback is
  `https://invitation-platform-youngbeens-projects.vercel.app`.
- Build 38 App Store Connect entry values are consolidated in
  `docs/app-store-connect-build38-packet.md`.
- App Review contact email must be a currently verified mailbox. The
  `support@invitehub.co.kr` address is not verified while the domain has no
  DNS/MX records. Mirror the verified mailbox in `NEXT_PUBLIC_SUPPORT_EMAIL`
  before relying on email text in the public support page.

Simulator screenshot caveat:

- `scripts/capture-store-screenshots.sh` now removes dev bundles before capture,
  but route changes still use `simctl openurl`. iOS can display an
  "Open in InviteHub" confirmation prompt, so final App Store screenshots should
  be captured from a manually confirmed Simulator flow or a TestFlight build
  rather than relying blindly on the automated route screenshots.

## App Store Connect Field Map

Use this map when entering the submission in App Store Connect:

| Area | Value |
| --- | --- |
| Bundle ID | `com.invitehub.app` |
| URL scheme | `invitehub` |
| Current live web base | `https://invitation-platform-youngbeens-projects.vercel.app` |
| Custom domain target | `https://invitehub.co.kr` after DNS is connected |
| IAP product | `publish.credit.ios` |
| IAP type | Consumable |
| IAP display name | 사진 포함 발행권 |
| IAP price target | 3,300원 |
| Server allowlist env | `STORE_PUBLISH_PRODUCT_IDS_IOS=publish.credit.ios` |
| Mobile product env | `EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=publish.credit.ios` |
| Web paid publish flag | `NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false` until IAP is ready |
| Mobile paid publish flag | `EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false` until IAP is ready |

Native privacy manifest status:

- `apps/mobile/ios/InviteHub/PrivacyInfo.xcprivacy` is present and declares required accessed API categories.
- The native manifest currently declares no tracking and no SDK-collected data types.
- This does not replace App Store Connect App Privacy labels. App Store Connect must still describe service data collected through Supabase, RSVP, guestbook, photos, and purchase verification.

Suggested App Privacy label basis:

| Data | Purpose | Linked to user | Tracking |
| --- | --- | --- | --- |
| Contact info: email/name | account, invitation owner, RSVP contact | yes | no |
| User content: invitation text/photos/guestbook | app functionality | yes | no |
| Identifiers: user id, invitation id, transaction id | app functionality, purchase verification | yes | no |
| Purchase history: product id/order or transaction reference, if paid publishing is enabled | app functionality, fraud prevention | yes | no |
| Usage data: basic view/count events if enabled | analytics/app functionality | yes if tied to account | no |

If a production build excludes analytics/tracking SDKs, do not mark tracking. If analytics are added later, update this checklist and App Store Connect before submission.

## Residual Risk Policy

Do not claim final submission readiness if any of these are missing:

- TestFlight install evidence.
- App Store Connect app information, version metadata, build selection, and
  review-note save evidence.
- Privacy label save evidence.
- IAP product approval, or a verified temporary feature flag state that hides
  paid publishing from the submitted build.
