# InviteHub App Store Connect Execution Checklist

Date: 2026-05-01
Latest official-doc recheck: 2026-05-03

This checklist is for the final external submission step after the local 90+
release gate has passed.

Official sources checked:

- Apple submitting overview: `https://developer.apple.com/app-store/submitting/`
- Apple privacy details: `https://developer.apple.com/app-store/app-privacy-details/`
- Apple upcoming requirements: `https://developer.apple.com/news/upcoming-requirements/`
- Apple App Review Guidelines:
  `https://developer.apple.com/app-store/review/guidelines/`
- Apple App Store Connect submit help:
  `https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app`
- Apple screenshot specifications:
  `https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/`

Current source-derived requirements:

- Uploaded iOS apps must be built with the iOS/iPadOS 26 SDK or later starting
  2026-04-28.
- App versions need required metadata and a selected build before review
  submission.
- App privacy answers are required for new apps and updates and must cover data
  collected by the app and integrated third-party partners.
- iPhone screenshot sets accept 1 to 10 `.png`, `.jpg`, or `.jpeg` files; the
  build 40 candidate `1206x2622` screenshots match Apple's 6.3" portrait size.

## Current External Status

Build 40 is uploaded to Apple through EAS Submit and supersedes builds 38 and
39 because both showed the same launch crash dialog on the user's iPhone. Build
40 contains source commit `9c83039`, which removes the optional Google/Kakao/IAP
native modules from the first-submission binary.

Current EAS evidence from 2026-05-03:

- Build upload: `1.0.0 (40)`, EAS build
  `86a14873-bdfd-4390-87d1-81ae0ddd06dc`, status `FINISHED`.
- EAS submission: `cf537e44-73dd-4a2d-8640-7d31e9facba8`, status `FINISHED`,
  `error: null`.
- A follow-up EAS submit attempt with `--groups "TE Team (Expo)"` created
  submission `949d446f-dea1-490f-8b52-2de359d899ee`, but it ended `ERRORED`.
  App Store Connect was checked directly after that failure.
- App Store Connect TestFlight now shows build `1.0.0 (40)` processed and
  assigned to internal group `Team (Expo)`.
- The group build tab shows `1.0.0 (40)` status `테스트 중`, expiring in 90
  days, with no crash/session data yet.
- The user's iPhone still needs to install and launch build 40 from TestFlight.

Build 38 is uploaded to Apple through EAS and contains the paid-publish fallback
commit `d8ed821`. Apple processing, export-compliance clearance, and internal
TestFlight group assignment were confirmed in App Store Connect on 2026-05-02
15:32 KST. The remaining TestFlight blocker is tester acceptance/install on the
target iPhone.

Current App Store Connect evidence from 2026-05-02:

- Build upload row: `1.0.0 (38)` status `완료`, created `May 2, 2026 1:58 PM`.
- Version build row: build 38 status `제출 준비 완료`, expiring in 90 days.
- Internal group page: `Team (Expo)` shows
  `내부 그룹 ∙ 1명의 테스터 ∙ 2개의 빌드`.
- Internal group tester tab: `dudqks2@gmail.com` / `정영빈` status `초대됨`,
  with no device/session evidence.
- Build upload row: `1.0.0 (37)` status `완료`, created `May 2, 2026 12:46 PM`.
- Version build row: build 37 status `제출 준비 완료`, expiring in 90 days.
- Internal group page: `Team (Expo)` shows `내부 그룹 ∙ 1명의 테스터 ∙ 1개의 빌드`.
- Internal group build tab: `1.0.0 (37)` status `테스트 중`, platform `iOS`.
- Internal group tester tab: `dudqks2@gmail.com` / `정영빈` status `초대됨`,
  dated `2026년 5월 2일`.

The export-compliance prompt for build 37 was saved after explicit user approval
using `위에 언급된 알고리즘에 모두 해당하지 않음`.

EAS build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) finished successfully
on 2026-05-02 and EAS Submit uploaded the binary to App Store Connect. App
version: `1.0.0`; build number: `38`; git commit:
`d8ed82188b3233bebe7be90c173d434f36690581`. Submission details:
`https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/77395141-a80b-48f9-8e43-c61114fafa25`.

Read-only final-submission audit from 2026-05-02 13:21 KST:

- App version `1.0 제출 준비 중` is not ready for review submission yet.
- iPhone screenshot set has `0` screenshots.
- Promotional text, description, keywords, support URL, copyright, contact
  fields, and review notes are still blank on the version page.
- The version page still shows `빌드 추가`, so build 37 is not selected for the
  App Store version even though it is available in TestFlight.
- App review submission list is empty.
- App information still shows name `InviteHub (40c8af)`, blank subtitle, default
  category, and unconfigured age rating.
- App privacy page has blank privacy URL, blank optional user privacy URL, no
  started data collection answers, and disabled publish.
- In-app purchase page has no product yet; only the create action is visible.
- First-submission fallback: keep paid photo publishing disabled with
  `NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false` and
  `EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false` until the IAP product exists.
- `https://invitehub.co.kr` and its `/privacy` and `/terms` paths do not resolve
  by DNS from the release machine. The Vercel deployment URL from the current
  environment does return HTTP 200 for `/privacy`, `/terms`, and `/support`:
  `https://invitation-platform-youngbeens-projects.vercel.app`.
- DNS recheck on 2026-05-02 14:47 KST returned no A/NS/MX records for
  `invitehub.co.kr`; do not use `support@invitehub.co.kr` as the App Review
  contact until DNS/MX and mailbox receipt are confirmed.
- EAS production env contains
  `EXPO_PUBLIC_WEB_BASE_URL=https://invitation-platform-youngbeens-projects.vercel.app`.
- Live URL recheck on 2026-05-02 14:26 KST: the Vercel `/privacy`, `/terms`,
  and `/support` URLs returned HTTP 200; `https://invitehub.co.kr/privacy`
  still failed DNS resolution.
- Local fallback verification on 2026-05-02: paid photo publishing defaults
  disabled in web/mobile code until `*_ENABLE_PAID_PUBLISH=true`; targeted tests,
  web/mobile typecheck, web/mobile lint, and an iPhone 17 Release simulator build
  passed. Screenshot evidence:
  `output/store-screenshots-fallback/02-step3-paid-disabled.png`.

## 1. Build Requirement

Apple's 2026 upload requirement is Xcode 26 or later with the matching current
SDK family for iOS/iPadOS apps.

Current local evidence:

- `xcodebuild -version`: Xcode 26.3.
- `SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`:
  passed code gates on 2026-05-03 13:24 KST. It ran web lint, web typecheck,
  58-file web/API tests with 177 tests, mobile lint, mobile typecheck, and
  focused 9-file mobile/API tests with 34 tests. The 88-check App Store packet
  verifier is now pinned to build 40.
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
- Paid-disabled screenshot verifier:
  `scripts/verify-store-screenshots.sh output/store-screenshots-fallback`
  passed for `01-home-paid-disabled.png` and `02-step3-paid-disabled.png` at
  `1206x2622`.
- Fresh high-severity dependency audit:
  `npm audit --audit-level=high` exited 0 on 2026-05-03 13:24 KST with no high
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
- Build 38 (`d185dfc1-9110-4d81-b510-08e02f1ece7f`) finished successfully and
  was uploaded to Apple by EAS Submit. This is the first TestFlight build that
  contains the paid-publish fallback.
- `node scripts/eas-build-submission-status.mjs d185dfc1-9110-4d81-b510-08e02f1ece7f`
  confirmed build 38 status `FINISHED` and linked submission
  `77395141-a80b-48f9-8e43-c61114fafa25` status `FINISHED` with `error: null`.
- Build 39 (`d3b6a8c0-4a3e-4705-8790-b9d90c98370a`) finished and submitted,
  but the user reported the same iPhone launch crash dialog.
- Build 40 (`86a14873-bdfd-4390-87d1-81ae0ddd06dc`) finished and EAS Submit
  uploaded it with submission `cf537e44-73dd-4a2d-8640-7d31e9facba8`, status
  `FINISHED`, `error: null`.
- Group assignment via EAS submit retry did not complete:
  `949d446f-dea1-490f-8b52-2de359d899ee` status `ERRORED`.

Current external evidence:

- App Store Connect export compliance is saved for build 37.
- Build 37 is available to internal group `TE Team (Expo)`.
- One internal tester is invited.
- App Store Connect processing and internal-group assignment are confirmed for
  build 40 as of 2026-05-03 12:53 KST.

Required evidence before marking the store area complete:

- Real iPhone install/launch evidence from TestFlight.
- Final App Store Connect app info, version metadata, build selection, privacy
  labels, screenshots, review notes, and IAP product state are saved or verified.

## 3. TestFlight

Required evidence:

- The new build is visible in App Store Connect TestFlight.
- The build no longer shows `수출 규정 관련 문서 누락`.
- The build is assigned to internal group `TE Team (Expo)`.
- The build can be installed by an internal tester.
- Launch smoke test passes.
- Home template gallery opens.
- Selecting a template opens builder Step 1.
- Preview path opens without crash.

Build 40 confirmation steps:

1. Open `https://appstoreconnect.apple.com/apps/6763630299/testflight/ios`.
2. Confirm `1.0.0 (40)` is visible after Apple processing.
3. If export compliance appears, answer consistently with
   `ITSAppUsesNonExemptEncryption=false`.
4. Add build `1.0.0 (40)` to internal group `TE Team (Expo)`.
5. On the user's iPhone, open TestFlight, install/update InviteHub to build 40,
   launch once, and record whether the home/template-first screen opens.

## 4. App Information

Use `docs/store-submission-metadata.md`.

Required fields:

- App name should be changed from the current `InviteHub (40c8af)` placeholder
  to the final public name, subject to App Store name availability.
- Subtitle: 모바일 초대장 제작과 공유.
- Promotional text and description match the current simplified template-first product.
- Keywords are Korean and do not claim unavailable features.
- Support URL, privacy URL, and terms URL open successfully. Use the Vercel URL
  unless `invitehub.co.kr` DNS is connected before submission.
- App Review contact email must be a verified mailbox. Mirror it to
  `NEXT_PUBLIC_SUPPORT_EMAIL`; do not use `support@invitehub.co.kr` until
  DNS/MX and mailbox receipt are confirmed.
- FAQ/support copy explains that maps open through Kakao/Naver search links
  without an embedded map tile API requirement.
- Age rating is completed in App Store Connect.
- Accessibility information is filled if App Store Connect requests it.

## 5. In-App Purchase

First-submission fallback:

- Do not claim active paid publishing in App Store metadata, screenshots, or
  review notes until the product below exists in App Store Connect.
- Keep `NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false` and
  `EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false`.
- The app can be submitted with photo-less free publishing first.

Future required product:

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

Required evidence before enabling paid publishing:

- Product exists in App Store Connect.
- Product is approved or submitted with the app version.
- Review notes mention the paid publish path only after the product exists.
- If the product is not ready, paid claims must be hidden or removed before
  submission. Current first-submission fallback is to keep paid publishing
  disabled in web and mobile env.

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
- Privacy URL points to a live page. Current verified option:
  `https://invitation-platform-youngbeens-projects.vercel.app/privacy`.

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
- Local build 40 candidate folder:
  `output/store-screenshots-submission-build40`; 6 PNGs passed size validation
  at `1206x2622` and manual visual prompt/overlay checks on 2026-05-03.

## 8. Review Notes

Include:

- No-login draft and preview path.
- Login-required remote save, publish, RSVP, and guestbook management path.
- Current first-submission build provides photo-less free publishing.
- Photo-included paid publishing is hidden until the App Store Connect IAP
  product is ready.
- Support contact: use the verified App Review contact mailbox. Do not use
  `support@invitehub.co.kr` until DNS/MX and mailbox receipt are confirmed.
- Privacy URL and terms URL.

## Completion Rule

Do not mark the active goal complete until EAS/TestFlight evidence and App Store
Connect save evidence exist for every section above.

Before calling the active goal complete, copy
`docs/app-store-external-evidence.template.json` to
`docs/app-store-external-evidence.json`, set each `status` to `true` only after
the corresponding Apple-side evidence exists, and fill `capturedAt`,
`evidence`, and `artifact` with the screenshot path, App Store Connect URL, or
user-confirmed device evidence. `artifact` must be one of: an `https://` URL, an
existing local file path, or a `user-confirmation:` reference that names the
thread/user confirmation. The filled evidence file is gitignored because it may
contain App Review contact details, phone numbers, or private screenshots. Then
run:

```bash
node scripts/verify-goal-completion.mjs
```

To record one evidence item without hand-editing JSON:

```bash
node scripts/record-app-store-evidence.mjs --list
node scripts/record-app-store-evidence.mjs \
  --key appStoreConnectBuild38Processed \
  --capturedAt 2026-05-02T15:30:00+09:00 \
  --evidence "App Store Connect TestFlight shows 1.0.0 (38) processed." \
  --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
```
