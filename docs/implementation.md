# InviteHub 구현 가이드

## 목적
이 문서는 `PRD-invitehub-ios-v3.1.md`를 실제 코드 작업으로 옮길 때 필요한 구현 기준을 모아둔 문서다.

## 1. Monorepo 구조
```txt
apps/
  web/
  mobile/
packages/
  shared/
supabase/
docs/
```

원칙:
- `apps/web`는 공개 초대장과 공개 API를 담당한다.
- `apps/mobile`은 작성자용 iOS 앱이다.
- `packages/shared`는 타입, 템플릿, 유틸, 상수를 공유한다.

## 2. Shared 패키지
추천 구조:
```txt
packages/shared/src/
  types/
    invitation.ts
    rsvp.ts
    guestbook.ts
  templates/
    configs.ts
    migration.ts
  utils/
    format.ts
    validate.ts
    filter.ts
    csv.ts
  constants/
    colors.ts
    fonts.ts
    spacing.ts
    entitlements.ts
```

핵심 규칙:
- `schemaVersion`은 데이터 구조 변경용
- `revision`은 동기화 충돌 감지용
- v1.0 앱은 `eventType = wedding`만 활성

## 3. Mobile 앱 기본 설정
필수 설정:
- Expo + TypeScript
- `expo-router`
- `expo-apple-authentication`
- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `expo-image-picker`
- `expo-image-manipulator`
- `@react-native-community/netinfo`
- `react-native-safe-area-context`
- `react-native-reanimated`

필수 확인:
- `npx expo prebuild --platform ios`
- `npx expo run:ios --device`
- Xcode 실기기 빌드 성공

## 4. Mobile 화면 구성
핵심 화면:
- 홈
- 내 초대장 목록
- 마이페이지
- 로그인
- 빌더 step1~step5
- 미리보기
- 초대장 상세
- RSVP 관리
- 방명록 관리
- 통계

## 5. Web 구현 범위
핵심 라우트:
- `/i/[slug]`
- `/api/public/[slug]`
- `/api/public/[slug]/rsvp`
- `/api/public/[slug]/guestbook`
- `/api/og/[slug]`

원칙:
- 수신자 경험은 웹이 정본
- 공개 API는 인증 없이 동작
- 공개 쓰기는 서버에서만 처리

## 6. Storage 업로드 방식
v1.0 결정:
- 앱에서 Supabase Storage 직접 업로드

제약:
- MIME: jpeg, png, webp
- 업로드 경로: `owner_id/...`
- 업로드 전 리사이즈 수행
- 업로드 큐 저장 및 재시도

## 7. Auth 구현 방식
Apple:
- `expo-apple-authentication` 사용
- Apple 토큰을 Supabase 세션으로 교환

Kakao:
- Supabase OAuth 브라우저 플로우 사용
- 앱 복귀 URL은 `invitehub://auth/callback`

Email:
- Supabase email/password 사용

## 8. Guestbook 정책
정책:
- 기본 승인 대기
- 공개 웹에는 승인된 글만 노출
- 앱에서 승인, 숨기기, 신고 검토

UGC 보호:
- 욕설 필터
- rate limit
- anonymous client identifier
- `ip_hash`
- `report_count`

## 9. Sync 구현 기준
상태:
- `synced`
- `pending`
- `offline`
- `conflict`

자동 저장:
- 입력 후 5초
- 단계 이동 시 즉시
- 앱 백그라운드 진입 시 즉시

충돌 처리:
- 서버 `revision`과 로컬 `baseRevision` 비교
- 차이 발생 시 ConflictBanner 표시

## 10. 테스트 실행 기준
Unit:
```bash
cd packages/shared
npx vitest run
```

App E2E:
```bash
cd apps/mobile
maestro test .maestro/
```

Web E2E:
```bash
cd apps/web
npx playwright test
```

릴리스 전 필수:
- typecheck
- lint
- unit test
- maestro smoke
- playwright smoke
- iOS device build

## 11. 구현 우선순위
1. shared 타입
2. Supabase schema
3. Expo iOS 빌드
4. 홈 + 템플릿 렌더러
5. 빌더 5단계
6. 저장/조회
7. 로그인
8. 업로드
9. 공유
10. RSVP/방명록 관리
