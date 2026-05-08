# InviteHub App Store Connect Input Packet - Build 42

Date: 2026-05-07

This packet was prepared for build `1.0.0 (42)`, but build 42 failed the real
iPhone TestFlight launch check on 2026-05-07 23:43 KST. Keep the metadata text
for reuse, but do not select build 42 for App Store review.

Do not press final Add for Review or Submit for Review until the user
explicitly confirms that action.

## Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle ID | `com.invitehub.app` |
| App Version | `1.0.0` |
| Build Number | `42` |
| EAS Build ID | `88c911f5-3c21-41e8-a6a2-a04939fa6179` |
| EAS Submission ID | `ba6727cf-2c1d-464f-a005-6ce9670d4f81` |
| IPA Artifact | `https://expo.dev/artifacts/eas/hTEP9Gx8wMFmK6w9aKSmcc.ipa` |

Do not select build `1.0.0 (42)` for the App Store version. Use a newer build
only after the iPhone TestFlight launch check passes.

## App Information

| App Store Connect Field | Value |
| --- | --- |
| Name | `InviteHub` |
| Name fallback | `InviteHub 모바일 초대장` |
| Subtitle | `모바일 초대장 제작과 공유` |
| Primary Category | Lifestyle |
| Secondary Category | Productivity, if App Store Connect allows it |
| Age Rating | Complete and save the App Store Connect age-rating questionnaire before submission. Do not force a target rating; use Apple's calculated result. |
| Privacy Policy URL | `https://invitation-platform-youngbeens-projects.vercel.app/privacy` |
| Support URL | `https://invitation-platform-youngbeens-projects.vercel.app/support` |

Do not use `invitehub.co.kr` yet. DNS/MX is not verified in this release run.
Do not use `support@invitehub.co.kr` as the App Review contact until DNS/MX and
mailbox receipt are confirmed.

Age-rating questionnaire basis:

- No gambling, contests, alcohol/tobacco/drug references, medical treatment, or
  mature entertainment content is intentionally provided by the app.
- Invitation text, RSVP, and guestbook content are user-provided.
- Guestbook entries are not intended to be public immediately; host moderation
  controls exist before public display.
- Map behavior opens Kakao/Naver search links; the app does not embed an open
  web browser for arbitrary browsing.

## Version Metadata

Promotional Text:

```txt
디자인을 고르고 이름, 날짜, 장소만 채우면 무료 모바일 초대장을 바로 만들 수 있습니다.
```

Description:

```txt
InviteHub는 결혼식과 각종 행사 초대장을 모바일에서 손쉽게 만들고 공유할 수 있는 앱입니다.

청첩장, 돌잔치, 브라이덜샤워, 환갑잔치 등 행사별 템플릿을 고를 수 있습니다.
날짜, 장소, 문구, 계좌 안내, RSVP, 방명록까지 한 번에 준비할 수 있습니다.
링크 하나로 하객에게 초대장을 공유하고 참석 여부와 축하 메시지를 받을 수 있습니다.
방명록은 호스트 확인 후 공개되도록 운영할 수 있습니다.
현재 제출 버전은 사진 없는 공개 링크 발행을 무료로 제공합니다.

기본 디자인, 초안 작성, 미리보기, 사진 없는 공개 링크 발행은 무료입니다.
사진 포함 발행권은 App Store 상품 준비 후 활성화 예정입니다.

InviteHub는 디자인을 먼저 고르고, 필요한 정보만 채워 공유하는 모바일 초대장 경험을 제공합니다.
```

Keywords:

```txt
청첩장,모바일초대장,결혼식초대장,돌잔치초대장,초대장제작,웨딩초대장,모바일청첩장,RSVP,방명록,초대링크
```

Copyright:

```txt
2026 Youngbeen Jung
```

## Review Notes

```txt
로그인 없이도 앱 내에서 초대장 초안을 만들고 미리보기할 수 있습니다.
계정이 있는 경우 원격 저장, 공개 링크 발행, RSVP/방명록 관리가 가능합니다.
방명록은 작성 직후 공개되지 않고 호스트가 대시보드에서 승인하거나 숨길 수 있습니다.
지도는 앱 내부 지도 타일을 직접 표시하지 않고, 장소명/주소를 기준으로 카카오맵과 네이버지도 검색 링크를 엽니다.
현재 제출 빌드에서는 사진 없는 무료 발행만 노출합니다.
사진 포함 발행은 App Store Connect 인앱결제 상품 준비 후 EXPO_PUBLIC_ENABLE_PAID_PUBLISH=true로 다시 활성화합니다.
문의는 App Review 연락처 필드에 입력한 이메일로 부탁드립니다.
```

Do not claim automatic profanity filtering, user blocking, external payment, or
active photo-included paid publishing in Review Notes.

## Screenshots

Local candidate folder:

```txt
output/store-screenshots-submission-build40
```

The build 42 code change targeted native startup stability and did not change
the store screenshot UI, but build 42 failed on real iPhone. Reuse these
screenshots only if the newer passing build does not change the UI.

Files:

- `01-home.png`
- `02-templates.png`
- `03-builder-step1.png`
- `04-builder-step3.png`
- `05-preview.png`
- `06-mypage.png`

Verification:

```bash
zsh scripts/verify-store-screenshots.sh output/store-screenshots-submission-build40
```

Result on 2026-05-03: 6 PNG files passed at `1206x2622`, with no visible iOS
open-confirmation prompt, dev overlay, or simulator window chrome. Re-run
visual review if App Store Connect requires new screenshots or if the UI
changes before final submission.

## App Privacy Draft

Use App Store Connect privacy labels that match the current app:

| Data Type | Purpose | Linked to User | Tracking |
| --- | --- | --- | --- |
| Contact Info: email, name | account management, invitation owner display, RSVP contact | yes | no |
| User Content: invitation text, RSVP, guestbook, optional photos when enabled | app functionality | yes | no |
| Identifiers: user id, invitation id, transaction id | app functionality and purchase verification | yes | no |
| Purchases: product id/order or transaction reference | purchase verification and fraud prevention | yes | no |

Set tracking to no unless a cross-app tracking SDK or use case is added.

## App Review Contact

Required from user before saving:

- Contact name
- Phone number
- Verified email address

Do not use `support@invitehub.co.kr` until DNS/MX and mailbox receipt are
confirmed.

## Evidence Recording

After each Apple-side save, record structured evidence:

```bash
node scripts/record-app-store-evidence.mjs --key currentTestFlightBuildProcessed --evidence "<App Store Connect TestFlight shows the newer passing build processed/available>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key currentBuildExportComplianceSaved --evidence "<newer passing build export compliance saved or not requested>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key currentBuildAssignedToInternalGroup --evidence "<newer passing build assigned to Team (Expo)>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key realIphoneTestFlightInstallLaunchPassed --evidence "<real iPhone installed the newer TestFlight build and launched home/template/builder/preview without the crash dialog>" --artifact "output/testflight-device-watch/<timestamp>/evidence/<timestamp>"
node scripts/record-app-store-evidence.mjs --key appInfoSaved --evidence "<saved App Information summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key versionMetadataSaved --evidence "<saved version metadata summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key currentReleaseBuildSelectedForVersion --evidence "<newer passing build selected for the App Store version>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key screenshotsUploaded --evidence "<uploaded screenshot summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key privacyLabelsSaved --evidence "<saved privacy labels summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/appprivacy"
node scripts/record-app-store-evidence.mjs --key reviewNotesSaved --evidence "<saved review notes summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key verifiedAppReviewContactSaved --evidence "<saved verified App Review contact summary>" --artifact "user-confirmation:app-review-contact-saved-by-account-holder"
# Do not record build42SelectedForVersion. Build 42 failed real iPhone launch.
```

After recording evidence, rerun:

```bash
node scripts/verify-goal-completion.mjs
```
