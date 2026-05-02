# InviteHub App Store Connect Execution Checklist

Date: 2026-05-01

This checklist is for the final external submission step after the local 90+
release gate has passed.

Official sources checked:

- Apple submitting overview: `https://developer.apple.com/app-store/submitting/`
- Apple privacy details: `https://developer.apple.com/app-store/app-privacy-details/`
- Apple upcoming requirements: `https://developer.apple.com/news/upcoming-requirements/`

## Current External Blocker

Build 37 is uploaded and processed in App Store Connect, but it is not yet
available to testers because the TestFlight row shows
`수출 규정 관련 문서 누락`.

The App Store Connect modal for build 37 asks:

> 앱에서 구현하는 암호화 알고리즘의 유형은 무엇입니까?

Saving this answer is a legal/export compliance action. Do not save it without
explicit user confirmation.

## 1. Build Requirement

Apple's 2026 upload requirement is Xcode 26 or later with the matching current
SDK family for iOS/iPadOS apps.

Current local evidence:

- `xcodebuild -version`: Xcode 26.3.
- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`:
  web lint, web typecheck, 52-file web/API tests, mobile lint, mobile typecheck,
  and focused 9-file mobile/API tests passed.
- Escalated iOS Release simulator build: 0 errors, 2 warnings.
- Bundle opened on iPhone 17 as `com.invitehub.app`.
- Release home screenshot: `/private/tmp/invitehub-release-home-current.png`.
- Fixed template preview screenshot from real Simulator taps:
  `/private/tmp/invitehub-preview-fit-to-viewport.png`.
- Latest post-canvas Release screenshot:
  `/private/tmp/invitehub-post-canvas-preview.png`, copied to
  `output/store-screenshots-verified/06-preview-fixed-canvas.png`.
- Editable canvas coverage: all 31 mobile templates resolve to blank canvas
  assets, including newly generated housewarming, baby shower, graduation, and
  business canvases under `apps/mobile/assets/template-previews/custom/other/`.
- Date display uses a local Korean formatter, avoiding raw ISO datetime strings
  in final preview screenshots.
- Store screenshot size verifier:
  `scripts/verify-store-screenshots.sh output/store-screenshots-verified`
  passed for the verified preview PNGs at `1206x2622`.
- Fresh high-severity dependency audit:
  `npm audit --audit-level=high` exited 0 on 2026-05-01 18:06 KST with no high
  or critical findings.
- Local generic iOS device archive compile passed after the `expo-image-picker`
  fix:
  `xcodebuild -workspace InviteHub.xcworkspace -scheme InviteHub -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build`.

## 2. EAS Build

Current evidence:

- Build 36 (`232b8941-5ec8-42fd-ba87-f225b4f460f1`) failed with
  `XCODE_BUILD_ERROR` from stale `expo-image-picker` Swift references.
- `expo-image-picker` was upgraded to `55.0.19`.
- Build 37 (`4d995997-e952-4ada-83bf-bc6a929be412`) finished successfully.
- Submission `bb2999db-8820-42a7-9bdf-fb2bfd7f6d21` finished with no reported
  EAS submission error.
- Artifact is associated with App Store Connect app id `6763630299`.

Required evidence before marking the store area complete:

- App Store Connect export compliance is saved for build 37.
- Build 37 is available to internal testers.

## 3. TestFlight

Required evidence:

- The new build is visible in App Store Connect TestFlight.
- The build no longer shows `수출 규정 관련 문서 누락`.
- The build can be installed by an internal tester.
- Launch smoke test passes.
- Home template gallery opens.
- Selecting a template opens builder Step 1.
- Preview path opens without crash.

## 4. App Information

Use `docs/store-submission-metadata.md`.

Required fields:

- App name: InviteHub.
- Subtitle: 모바일 초대장 제작과 공유.
- Promotional text and description match the current simplified template-first product.
- Keywords are Korean and do not claim unavailable features.
- Support URL, privacy URL, and terms URL open successfully.
- FAQ/support copy explains that maps open through Kakao/Naver search links
  without an embedded map tile API requirement.
- Age rating is completed in App Store Connect.
- Accessibility information is filled if App Store Connect requests it.

## 5. In-App Purchase

Required product:

- Product ID: `publish.credit.ios`.
- Type: Consumable.
- Display name: 사진 포함 발행권.
- Price target: 3,300원.

Environment mapping:

```env
STORE_PUBLISH_PRODUCT_IDS_IOS=publish.credit.ios
EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=publish.credit.ios
APPLE_BUNDLE_ID=com.invitehub.app
```

Required evidence:

- Product exists in App Store Connect.
- Product is approved or submitted with the app version.
- Review notes mention the paid publish path.
- If the product is not ready, paid claims must be hidden or removed before
  submission.

## 6. App Privacy

Apple requires App Store Connect privacy answers for data collected by the app
and third-party partners. The native `PrivacyInfo.xcprivacy` is present, but it
does not replace App Store Connect privacy labels.

Use this basis and verify against production settings:

| Data | Purpose | Linked to user | Tracking |
| --- | --- | --- | --- |
| Contact info: email/name | account, owner display, RSVP contact | yes | no |
| User content: invitation text/photos/guestbook | app functionality | yes | no |
| Identifiers: user id, invitation id, transaction id | app functionality, purchase verification | yes | no |
| Purchases: product id/order or transaction reference | purchase verification, fraud prevention | yes | no |
| Usage data: view/count events if enabled | analytics/app functionality | yes if account-linked | no |

Required evidence:

- App Privacy answers are saved in App Store Connect.
- Tracking is set to no unless a tracking SDK or cross-app tracking use is added.
- Privacy URL points to `https://invitehub.co.kr/privacy`.

## 7. Screenshots

Use `docs/store-screenshot-plan.md` and
`scripts/capture-store-screenshots.sh`.

Required evidence:

- iPhone screenshot set includes current simplified home.
- Template gallery and builder screenshots match the current UI.
- Preview/publish screenshots do not show unavailable pricing or external
  payment claims.
- Privacy/terms/account deletion path is visible in My Page if included.
- `simctl openurl` route captures are checked for the iOS `InviteHub에서
  열겠습니까?` prompt before upload; any image containing the prompt is rejected.
- Screenshot files pass `scripts/verify-store-screenshots.sh` before upload.

## 8. Review Notes

Include:

- No-login draft and preview path.
- Login-required remote save, publish, RSVP, and guestbook management path.
- IAP product ID `publish.credit.ios`.
- Paid path uses Apple In-App Purchase on iOS.
- Support contact: `support@invitehub.co.kr`.
- Privacy URL and terms URL.

## Completion Rule

Do not mark the active goal complete until EAS/TestFlight evidence and App Store
Connect save evidence exist for every section above.
