# InviteHub App Store Connect Build 39 Packet

Date: 2026-05-02

Build `1.0.0 (39)` superseded build 38 because build 38 launched through
TestFlight on the user's iPhone and showed an iOS crash dialog. The user later
reported that build 39 produced the same crash dialog, so build 39 is historical
evidence only. Use `docs/app-store-connect-build40-packet.md` for the current
TestFlight candidate.

## Verified Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| EAS build id | `d3b6a8c0-4a3e-4705-8790-b9d90c98370a` |
| App version | `1.0.0` |
| Build number | `39` |
| Source commit | `c5b844e` |
| EAS submission id | `378c3b67-3a23-476b-8a22-2b03520e08db` |
| EAS submission status | `FINISHED`, `error: null` |
| Latest EAS status recheck | `2026-05-02 16:57 KST` |

Verification command:

```bash
node scripts/eas-build-submission-status.mjs d3b6a8c0-4a3e-4705-8790-b9d90c98370a
```

## Historical TestFlight Status

EAS Submit uploaded build 39 to App Store Connect, but the user reported the
same iPhone crash dialog after trying build 39. Do not use build 39 as the
current candidate.

```txt
https://appstoreconnect.apple.com/apps/6763630299/testflight/ios
```

Historical evidence that was still needed before the build was superseded:

- `1.0.0 (39)` appears in the iOS build upload list with status `완료`.
- Build 39 export compliance is saved if App Store Connect prompts for it.
- Build 39 is assigned to internal group `Team (Expo)`.
- The user's iPhone installs build 39 from TestFlight and launches without the
  crash dialog.

## What Changed From Build 38

- Paid photo publishing is still disabled for the first submission unless
  `EXPO_PUBLIC_ENABLE_PAID_PUBLISH=true`.
- `react-native-iap` / `NitroIap` is removed from the iOS Pod lock for the
  disabled-paid first-submission build.
- The IAP card is dynamically loaded only when paid publishing is explicitly
  enabled.
- Google and Kakao native auth modules are loaded only when configuring or
  starting those sign-in flows, reducing launch-time native module work.

Local evidence before EAS build:

- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed on 2026-05-02 16:50 KST.
- Web/API tests: 58 files / 171 tests passed.
- Mobile focused tests: 9 files / 32 tests passed.
- iPhone 17 Release simulator build installed and launched `com.invitehub.app`
  with no fatal/exception/crash log entries in the launch smoke check.
- Screenshot evidence: `/tmp/invitehub-release-launch-20260502.png`.

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

For build 39, do not attach or promote an IAP product unless it has actually
been created and is ready in App Store Connect.

Keep these flags disabled until that product is ready:

```env
NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false
EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false
```

## Historical Submit Sequence

1. Confirm build `1.0.0 (39)` is processed and available.
2. Save export compliance for build 39 if prompted.
3. Add build 39 to `Team (Expo)`.
4. Install and launch build 39 on the user's iPhone through TestFlight.
5. Enter App Information fields.
6. Enter version metadata and review notes.
7. Upload verified screenshots.
8. Enter App Privacy labels.
9. Select build 39 for version `1.0`.
10. Add for Review, then submit only after the user explicitly confirms the
    final submission action.
