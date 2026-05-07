# InviteHub App Store Connect Input Packet - Build 42

Date: 2026-05-07

Use this packet when entering App Store Connect fields for build `1.0.0 (42)`.
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

Select build `1.0.0 (42)` for the App Store version only after the iPhone
TestFlight launch check passes.

## App Information

Use the same store metadata from
`docs/app-store-connect-input-packet-build41.md`, except the selected build and
evidence keys must point to build 42.

Do not use `invitehub.co.kr` yet. DNS/MX is not verified in this release run.
Do not use `support@invitehub.co.kr` as the App Review contact until DNS/MX and
mailbox receipt are confirmed.

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

The build 42 code change targets native startup stability and does not change
the store screenshot UI. Re-run visual review if App Store Connect requires new
screenshots or if the UI changes before final submission.

## Evidence Recording

After each Apple-side save, record structured evidence:

```bash
node scripts/record-app-store-evidence.mjs --key appStoreConnectBuild42Processed --evidence "<App Store Connect TestFlight shows build 1.0.0 (42) processed/available>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key build42ExportComplianceSaved --evidence "<build 42 export compliance saved or not requested>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key build42AssignedToInternalGroup --evidence "<build 42 assigned to Team (Expo)>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/testflight/ios"
node scripts/record-app-store-evidence.mjs --key realIphoneTestFlightInstallLaunchPassed --evidence "<real iPhone installed TestFlight build 1.0.0 (42) and launched home/template/builder/preview without the crash dialog>" --artifact "output/testflight-device-watch/<timestamp>/evidence/<timestamp>"
node scripts/record-app-store-evidence.mjs --key appInfoSaved --evidence "<saved App Information summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key versionMetadataSaved --evidence "<saved version metadata summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key screenshotsUploaded --evidence "<uploaded screenshot summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key privacyLabelsSaved --evidence "<saved privacy labels summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/appprivacy"
node scripts/record-app-store-evidence.mjs --key reviewNotesSaved --evidence "<saved review notes summary>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
node scripts/record-app-store-evidence.mjs --key verifiedAppReviewContactSaved --evidence "<saved verified App Review contact summary>" --artifact "user-confirmation:app-review-contact-saved-by-account-holder"
node scripts/record-app-store-evidence.mjs --key build42SelectedForVersion --evidence "<build 1.0.0 (42) selected for version 1.0.0>" --artifact "https://appstoreconnect.apple.com/apps/6763630299/distribution"
```

After recording evidence, rerun:

```bash
node scripts/verify-goal-completion.mjs
```
