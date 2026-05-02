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

Latest local evidence after the fixed-template preview update:

- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed web lint, web typecheck, 52-file web/API test suite, mobile lint,
  mobile typecheck, and focused 9-file mobile/API tests.
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
- App Store Connect TestFlight shows `1.0.0 (37)` upload status `완료` for app
  id `6763630299`, but the version build row is blocked by
  `수출 규정 관련 문서 누락`.
- Future builds declare `ITSAppUsesNonExemptEncryption=false` through Expo iOS
  config and the native `Info.plist`.

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
- TestFlight build 37 is uploaded; internal tester availability is blocked until
  the export-compliance prompt is saved in App Store Connect.
- App Privacy labels match collected data: account, invitations, RSVP, guestbook, photos, purchase records.
- IAP product for photo-included publishing is created, priced, and approved.
- Screenshots match the current simplified home and builder flow.
- Review notes explain no-login draft creation, login-required publish management, and IAP publish flow.
- Support, privacy, terms, and FAQ copy matches the actual pricing policy:
  free template/draft/preview/photo-less publish, paid photo-included publish
  through App Store billing.

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
| IAP product | `publish.credit.ios` |
| IAP type | Consumable |
| IAP display name | 사진 포함 발행권 |
| IAP price target | 3,300원 |
| Server allowlist env | `STORE_PUBLISH_PRODUCT_IDS_IOS=publish.credit.ios` |
| Mobile product env | `EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=publish.credit.ios` |

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
| Purchase history: product id/order or transaction reference | app functionality, fraud prevention | yes | no |
| Usage data: basic view/count events if enabled | analytics/app functionality | yes if tied to account | no |

If a production build excludes analytics/tracking SDKs, do not mark tracking. If analytics are added later, update this checklist and App Store Connect before submission.

## Residual Risk Policy

Do not claim final submission readiness if any of these are missing:

- Export-compliance blocker cleared for build 37.
- TestFlight install evidence.
- App Store Connect metadata save evidence.
- Privacy label save evidence.
- IAP product approval or a temporary feature flag that hides paid publishing.
