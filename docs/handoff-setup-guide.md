# InviteHub Handoff And Setup Guide

이 문서는 `codex/store-publish-fixes` 브랜치를 기준으로, 다른 개발자나 AI가 이 프로젝트를 이어받아 바로 작업할 수 있도록 현재 상태와 필요한 외부 설정을 정리한 문서다.

## 1. 현재 상태

- 웹 앱은 `Next.js + TypeScript + Supabase` 기반이다.
- 모바일 앱은 `Expo / React Native` 기반이다.
- 기본 청첩장 생성/미리보기는 무료 흐름이다.
- 사진이 포함된 초대장 발행은 단일 인앱상품 `사진 포함 발행권`으로 정리 중이다.
- 현재 가격 정책 목표는 `사진 포함 발행권 3,300원` 단일 상품이다.
- 공개 초대장, RSVP, 방명록, 조회 통계, 계좌/지도, Store verify, 카카오페이 approve 경로는 코드가 있다.
- 아직 외부 서비스 값이 모두 채워진 상태는 아니다. Apple / Google Play / KakaoPay / EAS production 설정이 운영 기준으로 완성되지 않았다.

## 2. 이 브랜치에서 이미 구현된 것

- 계정 삭제 API와 모바일 마이페이지 삭제 버튼
- 공개 RSVP / 방명록 저장 API
- 무료 발행 API
- Apple / Google Play store verify API
- 카카오페이 ready / approve / cancel API
- 모바일 빌더 UX 개선
  - 날짜/시간 피커
  - 단계별 필수값 검증
  - 부모님 이름 입력
  - 사진 삭제 / 처리중 상태
  - 오프라인 배너
  - 빈 상태 / 스켈레톤
  - 미리보기 상단 발행 흐름 표시
- 보안 보강
  - store product allowlist
  - verification payload 최소 저장
  - 공개 자산 프록시
  - root 의존성 audit 0 취약점

## 3. 아직 운영 전 필수로 채워야 하는 것

- Apple App Store Connect API 키
- Apple IAP 상품 등록
- Google Play 서비스 계정 JSON
- Google Play IAP 상품 등록
- KakaoPay 운영용 CID / Secret
- EAS production environment variables
- Supabase production 프로젝트 점검
- 스토어 제출용 스크린샷 / 메타데이터

## 4. 폴더와 파일 역할

- 웹 서버/API: `/Users/jyb-m3max/Desktop/codex/invitation-platform/app`
- 웹 공용 로직: `/Users/jyb-m3max/Desktop/codex/invitation-platform/lib`
- 모바일 앱: `/Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile`
- Supabase SQL: `/Users/jyb-m3max/Desktop/codex/invitation-platform/supabase/schema.sql`
- 모바일 EAS 설정: [/Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile/eas.json](/Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile/eas.json)
- 서버 환경변수 예시: [/Users/jyb-m3max/Desktop/codex/invitation-platform/.env.example](/Users/jyb-m3max/Desktop/codex/invitation-platform/.env.example)
- 모바일 환경변수 예시: [/Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile/.env.example](/Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile/.env.example)

## 5. 환경변수 넣는 위치

### 서버용 비밀값

위치:
- 로컬 개발: `/Users/jyb-m3max/Desktop/codex/invitation-platform/.env.local`
- 실제 배포: Vercel 또는 서버 환경변수

여기에 넣는 값:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
KAKAOPAY_CID=
KAKAOPAY_SECRET_KEY=
PORTONE_STORE_ID=
PORTONE_CHANNEL_KEY=
APPLE_APP_STORE_ISSUER_ID=
APPLE_APP_STORE_KEY_ID=
APPLE_APP_STORE_PRIVATE_KEY=
APPLE_BUNDLE_ID=
GOOGLE_PLAY_PACKAGE_NAME=
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
STORE_PUBLISH_PRODUCT_IDS_IOS=
STORE_PUBLISH_PRODUCT_IDS_ANDROID=
```

주의:
- `SUPABASE_SERVICE_ROLE_KEY`, `KAKAOPAY_SECRET_KEY`, `APPLE_APP_STORE_PRIVATE_KEY`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`은 절대 앱 번들에 넣으면 안 된다.

### 모바일 앱 공개값

위치:
- 로컬 개발: `/Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile/.env.local`
- 클라우드 빌드: Expo EAS environment variables

여기에 넣는 값:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_BASE_URL=
EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=
EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID=
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=
```

주의:
- `EXPO_PUBLIC_`로 시작하는 값은 앱 번들에 포함된다. 비밀값을 넣지 말 것.

## 6. Supabase 설정

사이트:
- `https://supabase.com/dashboard`

필수 작업:

1. 프로젝트 생성
2. `Project Settings > API`에서 아래 값 확보
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. SQL Editor에서 [/Users/jyb-m3max/Desktop/codex/invitation-platform/supabase/schema.sql](/Users/jyb-m3max/Desktop/codex/invitation-platform/supabase/schema.sql) 실행
4. Authentication provider 확인
   - Email
   - Apple
   - Kakao
5. Storage bucket 확인
   - `invitation-assets`
6. Redirect URL 확인
   - 앱: `invitehub://auth/callback`
   - 웹: `https://YOUR_DOMAIN/auth/callback` 또는 Supabase callback

체크 포인트:
- `service_role` 키는 서버에만 둔다.
- storage 정책은 현재 `public read 제거 + 공개 자산 프록시` 전제다.

## 7. Apple 설정

사이트:
- `https://appstoreconnect.apple.com/`
- Apple 도움말
  - `https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api`
  - `https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/generate-keys-for-in-app-purchases`

필수 작업:

1. `Users and Access > Integrations`에서 App Store Connect API key 생성
2. 확보할 값
   - `APPLE_APP_STORE_ISSUER_ID`
   - `APPLE_APP_STORE_KEY_ID`
   - `APPLE_APP_STORE_PRIVATE_KEY` (`.p8` 파일 내용)
3. iOS 앱 Bundle ID 확인
   - 운영 기준: `com.invitehub.app`
4. 인앱상품 생성
   - 상품명: `사진 포함 발행권`
   - Product ID: `publish.credit.ios`
   - 타입: `Consumable`
   - 가격: `3,300원`
5. App Store Connect 상품 설명 / 심사 정보 입력

환경변수 매핑:

```env
APPLE_APP_STORE_ISSUER_ID=
APPLE_APP_STORE_KEY_ID=
APPLE_APP_STORE_PRIVATE_KEY=
APPLE_BUNDLE_ID=com.invitehub.app
STORE_PUBLISH_PRODUCT_IDS_IOS=publish.credit.ios
EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=publish.credit.ios
```

## 8. Google Play 설정

사이트:
- `https://play.google.com/console/`
- `https://developers.google.com/android-publisher/getting_started`

필수 작업:

1. Google Play Console에서 앱 등록
2. 인앱상품 생성
   - 상품명: `사진 포함 발행권`
   - Product ID: `publish.credit.android`
   - 타입: 소모형 one-time product
   - 가격: `3,300원`
3. Google Cloud Console에서 서비스 계정 생성
4. JSON 키 발급
5. Google Play Console에서 해당 서비스 계정에 API 접근 권한 부여

환경변수 매핑:

```env
GOOGLE_PLAY_PACKAGE_NAME=com.invitehub.app
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
STORE_PUBLISH_PRODUCT_IDS_ANDROID=publish.credit.android
EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID=publish.credit.android
```

## 9. KakaoPay 설정

사이트:
- `https://developers.kakaopay.com/`

필수 작업:

1. 카카오페이 개발자센터 앱/가맹 연동
2. 운영용 CID 확보
3. 운영용 Secret Key 확보
4. 서버 환경에 주입

환경변수:

```env
KAKAOPAY_CID=
KAKAOPAY_SECRET_KEY=
```

주의:
- 이 값은 서버에서만 사용한다.

## 10. Expo EAS 설정

사이트:
- `https://expo.dev/`
- 문서: `https://docs.expo.dev/eas/environment-variables/`

목적:
- 앱 공개값을 클라우드 빌드 환경에 저장

현재 프로필:
- development
- development-simulator
- preview
- production

production 기준 필수 env:

```env
APP_VARIANT=production
APP_BUNDLE_ID=com.invitehub.app
APP_ANDROID_PACKAGE=com.invitehub.app
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WEB_BASE_URL=https://invitehub.co.kr
EXPO_PUBLIC_IAP_PRODUCT_ID_IOS=publish.credit.ios
EXPO_PUBLIC_IAP_PRODUCT_ID_ANDROID=publish.credit.android
```

예시 명령:

```bash
cd /Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile
eas env:create --name EXPO_PUBLIC_IAP_PRODUCT_ID_IOS --value publish.credit.ios --environment production --visibility plaintext
```

## 11. 가격 정책

현재 목표 정책:

- 기본 청첩장: 무료
- 사진 포함 발행권: `3,300원`
- 사진 포함 발행권 1회에 포함되는 범위:
  - 프로필 사진
  - 배경 사진
  - 갤러리 사진 전체

이 정책을 따르려면 다음이 모두 같은 값을 말해야 한다.

- 웹 랜딩 가격 문구
- 모바일 홈 가격 카드
- 모바일 미리보기 요금 카드
- Store IAP 상품 가격
- 서버 가격 계산 로직

## 12. 남은 작업

우선순위 높은 순서:

1. Apple / Google / KakaoPay 운영 키 입력
2. Supabase production 설정 점검
3. EAS production env 입력
4. 스토어 스크린샷 최종 촬영
5. TestFlight / Play internal 테스트
6. App Store Connect / Play Console 제출

추가 구현 후보:

- FAQ 웹 페이지
- 다크모드 검증
- 오프라인 세부 UX
- 사진 편집 고도화
- 푸시 알림

## 13. AI에게 넘길 때 바로 주면 좋은 프롬프트

```text
이 저장소는 InviteHub다. 현재 브랜치는 codex/store-publish-fixes 기준이다.
먼저 docs/handoff-setup-guide.md를 읽고, .env.example와 apps/mobile/.env.example를 확인해라.
Apple, Google Play, KakaoPay, Supabase, Expo EAS 설정이 아직 운영 기준으로 완전히 채워지지 않았다.
가격 정책은 기본 청첩장 무료 / 사진 포함 발행권 3,300원이다.
우선순위는 1) 외부 서비스 env 주입 2) 스토어 테스트 3) 제출 자산 정리다.
```
