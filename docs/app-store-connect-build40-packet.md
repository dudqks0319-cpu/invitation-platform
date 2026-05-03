# InviteHub App Store Connect Build 40 Packet

Date: 2026-05-03

Build `1.0.0 (40)` supersedes builds 38 and 39 because both produced a
user-visible iOS crash dialog on the user's iPhone through TestFlight. Build 40
contains source commit `9c83039`, which removes the optional Google/Kakao/IAP
native launch modules from the first-submission binary instead of only lazy
loading them.

## Verified Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| EAS build id | `86a14873-bdfd-4390-87d1-81ae0ddd06dc` |
| App version | `1.0.0` |
| Build number | `40` |
| Source commit | `9c83039` |
| EAS submission id | `cf537e44-73dd-4a2d-8640-7d31e9facba8` |
| EAS submission status | `FINISHED`, `error: null` |
| IPA artifact | `https://expo.dev/artifacts/eas/hCes69aZwsDbfuVwaP4mFN.ipa` |
| Latest EAS status recheck | `2026-05-03 12:28 KST` |

Verification command:

```bash
node scripts/eas-build-submission-status.mjs 86a14873-bdfd-4390-87d1-81ae0ddd06dc
```

## TestFlight Status

EAS Submit uploaded build 40 to App Store Connect and returned `FINISHED` with
`error: null`. Apple processing and internal-group assignment still need console
or user evidence before this can be treated as passed on the real iPhone.

Required next evidence:

- `1.0.0 (40)` appears in the iOS build upload list with status `완료`.
- Build 40 export compliance is saved if App Store Connect prompts for it.
- Build 40 is assigned to internal group `TE Team (Expo)`.
- The user's iPhone installs build 40 from TestFlight and launches without the
  crash dialog.

## What Changed From Build 39

- Removed these native packages from the mobile workspace:
  `@react-native-google-signin/google-signin`, `@react-native-kakao/core`,
  `@react-native-kakao/user`, `react-native-iap`, and
  `react-native-nitro-modules`.
- Re-ran CocoaPods so iOS `Podfile.lock` and the Xcode project no longer link
  GoogleSignIn, Kakao, IAP, NitroModules, or ExpoAdapterGoogleSignIn resources.
- Disabled native Google/Kakao sign-in for the stabilization build with clear
  in-app error messages.
- Stubbed store purchase state so paid publishing remains unavailable until an
  App Store Connect IAP product is ready and native packages are intentionally
  restored.
- Added config guards so stale EAS environment variables cannot re-enable
  removed native plugins unless the packages are actually installed.

Local evidence before EAS build:

- `npm --prefix apps/mobile run typecheck`: passed.
- `npm --prefix apps/mobile run lint`: passed.
- Focused native/config evidence tests passed: 7 files / 25 tests.
- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed code gates on 2026-05-03 12:37 KST through web/mobile lint,
  web/mobile typecheck, the 58-file web/API test suite with 175 tests, and the
  focused 9-file mobile/API test suite with 34 tests. The packet verifier was
  then updated from build 39 to build 40.
- iPhone 17 Release simulator build passed with 0 errors and 2 warnings and
  opened `com.invitehub.app`.
- Release simulator screenshot:
  `/tmp/invitehub-build40-candidate-release-home-20260503.png`.
- Native dependency scan found no removed package names in mobile package files,
  iOS Pod locks, the Xcode project, or Android Gradle.

## App Information

Use these values unless App Store Connect rejects name availability:

| Field | Value |
| --- | --- |
| App Name | `InviteHub` |
| Name fallback | `InviteHub 모바일 초대장` |
| Subtitle | `모바일 초대장 제작과 공유` |
| Category | Lifestyle or Productivity, choose the best fit in App Store Connect |
| Privacy URL | `https://invitation-platform-youngbeens-projects.vercel.app/privacy` |
| Support URL | `https://invitation-platform-youngbeens-projects.vercel.app/support` |
| Terms URL | `https://invitation-platform-youngbeens-projects.vercel.app/terms` |

Do not use `invitehub.co.kr` yet. DNS still does not resolve from the release
machine. `support@invitehub.co.kr` also has no verified MX/DNS evidence in this
run, so do not use it as the App Review contact until the mailbox is confirmed.
Set `NEXT_PUBLIC_SUPPORT_EMAIL` to the same verified mailbox before relying on
email text in the public support page.

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

Review contact fields require the account holder's real contact information.
Do not fabricate these fields. Enter the user's current App Review contact name,
phone, and email in App Store Connect.

## In-App Purchase

For build 40, do not attach or promote an IAP product unless it has actually
been created and is ready in App Store Connect.

Keep these flags disabled until that product is ready:

```env
NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false
EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false
```

## Submit Sequence

1. Confirm build `1.0.0 (40)` is processed and available.
2. Save export compliance for build 40 if prompted.
3. Add build 40 to `TE Team (Expo)`.
4. Install and launch build 40 on the user's iPhone through TestFlight.
5. Enter App Information fields.
6. Enter version metadata and review notes.
7. Upload verified screenshots.
8. Enter App Privacy labels.
9. Select build 40 for version `1.0`.
10. Add for Review, then submit only after the user explicitly confirms the
    final submission action.
