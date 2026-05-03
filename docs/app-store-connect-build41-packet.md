# InviteHub App Store Connect Build 41 Packet

Date: 2026-05-03

Build `1.0.0 (41)` supersedes build 40 because Mac TestFlight logs for build
40 showed `Unhandled JS Exception: Error: No routes found` in Expo Router. Build
41 contains local source commit `0655ced`, which restores the supported
`expo-router/entry` release entry and explicitly loads the Expo Router Babel env
transform required by this monorepo.

## Verified Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| EAS build id | `61bc2e17-0c5a-45f3-94ee-bf3b63e09f03` |
| App version | `1.0.0` |
| Build number | `41` |
| Source commit | `0655ced` |
| EAS submission id | `25518b07-b8de-4507-8a0e-20d85bfe9e14` |
| EAS submission status | `FINISHED`, `error: null` |
| IPA artifact | `https://expo.dev/artifacts/eas/d4ZfNGP5M5EyJbZEmGjw5k.ipa` |
| Latest EAS status recheck | `2026-05-03 15:33 KST` |
| Latest ASC group check | `2026-05-03 15:40 KST`: processed, `Team (Expo)` assigned |

Verification command:

```bash
node scripts/eas-build-submission-status.mjs 61bc2e17-0c5a-45f3-94ee-bf3b63e09f03
```

## TestFlight Status

EAS Build finished build 41 and EAS Submit uploaded the binary to App Store
Connect. EAS returned linked submission `25518b07-b8de-4507-8a0e-20d85bfe9e14`
as `FINISHED` with `error: null`.

Current status:

- App Store Connect iOS build upload list shows `1.0.0 (41)` status `완료`,
  created `May 3, 2026 3:32 PM`.
- The version `1.0.0` TestFlight table shows build `41` status
  `제출 준비 완료` and `90일 후 만료`.
- The build 41 row is assigned to internal group `Team (Expo)`, with invite
  count `1` and installs/sessions/crashes all shown as `-`.
- Export compliance is not blocking the build 41 TestFlight row.
- Real iPhone install/launch evidence is still required.
- Do not use build 40 for final TestFlight QA; it is superseded by build 41.

## What Changed From Build 40

- Removed the custom `ExpoRoot` and `require.context("./app")` entry from
  `apps/mobile/index.js`.
- Set `apps/mobile/package.json` main to `expo-router/entry`.
- Added Expo default Metro config in `apps/mobile/metro.config.js`.
- Explicitly loaded `babel-preset-expo/build/expo-router-plugin` from
  `apps/mobile/babel.config.js` so `EXPO_ROUTER_APP_ROOT` is transformed in the
  mobile workspace.
- Added `apps/mobile/entry.test.ts` to lock the release entry, Metro config, and
  Babel transform.

Local evidence before EAS build:

- `npm run test -- apps/mobile/entry.test.ts apps/mobile/app.config.test.ts apps/mobile/react-native.config.test.ts scripts/verify-goal-completion.test.ts --exclude='**/.claude/**'`: passed 4 files / 18 tests.
- `npm --prefix apps/mobile run typecheck`: passed.
- `npm --prefix apps/mobile run lint`: passed.
- `node scripts/verify-app-store-packet.mjs`: passed 88 checks before this packet moved to build 41.
- `npx expo export --platform ios --output-dir /tmp/invitehub-ios-export-entry-fix-20260503-1531`: passed and produced the iOS Hermes bundle.
- `npm audit --audit-level=high`: exit 0, no high/critical findings; 13 moderate transitive findings remain in Expo/Next tooling chains.

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

For build 41, do not attach or promote an IAP product unless it has actually
been created and is ready in App Store Connect.

Keep these flags disabled until that product is ready:

```env
NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false
EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false
```

## Submit Sequence

1. Build `1.0.0 (41)` is processed and available.
2. Export compliance is not blocking the build 41 TestFlight row.
3. Build 41 is assigned to internal group `Team (Expo)`.
4. Install and launch build 41 on the user's iPhone through TestFlight.
5. Enter App Information fields.
6. Enter version metadata and review notes.
7. Upload verified screenshots.
8. Enter App Privacy labels.
9. Select build 41 for version `1.0`.
10. Add for Review, then submit only after the user explicitly confirms the
    final submission action.
