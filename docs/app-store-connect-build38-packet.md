# InviteHub App Store Connect Build 38 Packet

Date: 2026-05-02

This packet is the single handoff sheet for entering InviteHub build `1.0.0
(38)` into App Store Connect. It avoids claims about paid publishing because
the first-submission fallback keeps photo-included paid publishing disabled
until the IAP product exists.

Official references checked:

- Apple submission overview: `https://developer.apple.com/ios/submit/`
- Submit an app: `https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app/`
- App privacy details: `https://developer.apple.com/app-store/app-privacy-details/`
- Screenshot specifications: `https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/`

## Verified Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| EAS build id | `d185dfc1-9110-4d81-b510-08e02f1ece7f` |
| App version | `1.0.0` |
| Build number | `38` |
| Git commit in build | `d8ed82188b3233bebe7be90c173d434f36690581` |
| EAS submission id | `77395141-a80b-48f9-8e43-c61114fafa25` |
| EAS submission status | `FINISHED`, `error: null` |

Verification command:

```bash
node scripts/eas-build-submission-status.mjs d185dfc1-9110-4d81-b510-08e02f1ece7f
```

## TestFlight Confirmation

Open:

```txt
https://appstoreconnect.apple.com/apps/6763630299/testflight/ios
```

Confirm and save evidence:

- `1.0.0 (38)` appears after Apple processing.
- Export compliance is saved for build 38 if App Store Connect asks.
- Build 38 is assigned to internal group `TE Team (Expo)`.
- Tester `dudqks2@gmail.com` can install or update InviteHub in TestFlight.
- iPhone smoke test passes: home -> template selection -> builder Step 1 ->
  preview.

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
machine.

## Version Metadata

Promotional text:

```txt
디자인을 고르고 이름, 날짜, 장소만 채우면 무료 모바일 초대장을 바로 만들 수 있습니다.
```

Description:

```txt
InviteHub는 결혼식과 각종 행사 초대장을 모바일에서 손쉽게 만들고 공유할 수 있는 앱입니다.

- 청첩장, 돌잔치, 브라이덜샤워, 환갑잔치 등 행사별 템플릿을 고를 수 있습니다.
- 날짜, 장소, 문구, 계좌 안내, RSVP, 방명록까지 한 번에 준비할 수 있습니다.
- 링크 하나로 하객에게 초대장을 공유하고 참석 여부와 축하 메시지를 받을 수 있습니다.
- 방명록은 호스트 확인 후 공개되도록 운영할 수 있습니다.
- 현재 제출 버전은 사진 없는 공개 링크 발행을 무료로 제공합니다.

현재 적용 중인 요금 정책:
- 기본 디자인, 초안 작성, 미리보기, 사진 없는 공개 링크 발행: 무료
- 사진 포함 발행권: App Store 상품 준비 후 활성화 예정

InviteHub는 “디자인을 먼저 고르고, 필요한 정보만 채워 공유한다”는 방향으로 초대장 경험을 만들고 있습니다.
```

Keywords:

```txt
청첩장,모바일초대장,결혼식초대장,돌잔치초대장,초대장제작,웨딩초대장,모바일청첩장,RSVP,방명록,초대링크
```

## Review Notes

```txt
로그인 없이도 앱 내에서 초대장 초안을 만들고 미리보기할 수 있습니다.
계정이 있는 경우 원격 저장, 공개 링크 발행, RSVP/방명록 관리가 가능합니다.
방명록은 작성 직후 공개되지 않고 호스트가 대시보드에서 승인하거나 숨길 수 있습니다.
지도는 앱 내부 지도 타일을 직접 표시하지 않고, 장소명/주소를 기준으로 카카오맵과 네이버지도 검색 링크를 엽니다.
현재 제출 빌드에서는 사진 없는 무료 발행만 노출합니다.
사진 포함 발행은 App Store Connect 인앱결제 상품 준비 후 EXPO_PUBLIC_ENABLE_PAID_PUBLISH=true로 다시 활성화합니다.
문의: support@invitehub.co.kr
```

Review contact fields require the account holder's real contact information.
Do not fabricate these fields. Enter the user's current App Review contact name,
phone, and email in App Store Connect.

## App Privacy Labels

Use this as the answer basis, then verify against the actual App Store Connect
question wording before saving:

| Data type | Purpose | Linked to user | Tracking |
| --- | --- | --- | --- |
| Contact info: email/name | Account, invitation owner display, RSVP contact | Yes | No |
| User content: invitation text/photos/RSVP/guestbook | App functionality | Yes | No |
| Identifiers: user id, invitation id, transaction id | App functionality, fraud prevention, purchase verification if enabled | Yes | No |
| Purchases: product/order/transaction reference if paid publishing is enabled later | Purchase verification, fraud prevention | Yes | No |
| Usage data: invitation view/count events if enabled | Analytics/app functionality | Yes if account-linked | No |

Current first-submission build hides the paid photo publish flow. If App Store
Connect privacy questions ask only about current collected data, do not claim
active purchase collection unless paid publishing is enabled in the submitted
build.

## In-App Purchase

For build 38, do not attach or promote an IAP product unless it has actually
been created and is ready in App Store Connect.

Future activation values:

| Field | Value |
| --- | --- |
| Product ID | `publish.credit.ios` |
| Type | Consumable |
| Display name | `사진 포함 발행권` |
| Price target | `3,300원` |

Keep these flags disabled until that product is ready:

```env
NEXT_PUBLIC_ENABLE_PAID_PUBLISH=false
EXPO_PUBLIC_ENABLE_PAID_PUBLISH=false
```

## Screenshots

Apple accepts one to ten screenshots per display set in `.png`, `.jpg`, or
`.jpeg`. For iPhone 17/6.3" screenshots, `1206 x 2622` portrait is an accepted
size.

Existing verified local screenshot evidence:

- `output/store-screenshots-verified/05-preview-fit-to-viewport.png`
- `output/store-screenshots-verified/06-preview-fixed-canvas.png`
- `output/store-screenshots-fallback/01-home-paid-disabled.png`
- `output/store-screenshots-fallback/02-step3-paid-disabled.png`

Before upload, reject any screenshot that contains the iOS deep-link prompt
`InviteHub에서 열겠습니까?`.

Minimum recommended App Store set for build 38:

1. Home/template-first screen.
2. Template gallery/category screen.
3. Builder Step 1 with prefilled invitation details.
4. Step 3 showing photo publishing disabled for first submission.
5. Preview showing fixed template canvas with editable text overlay.
6. My Page with support/privacy/terms/account path.

## Submit Sequence

1. Confirm build `1.0.0 (38)` is processed and available.
2. Save export compliance for build 38 if prompted.
3. Add build 38 to `TE Team (Expo)`.
4. Install and launch build 38 on the user's iPhone through TestFlight.
5. Enter App Information fields.
6. Enter version metadata and review notes.
7. Upload verified screenshots.
8. Enter App Privacy labels.
9. Select build 38 for version `1.0`.
10. Add for Review, then submit only after the user explicitly confirms the
    final submission action.
