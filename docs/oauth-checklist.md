# OAuth 체크리스트

## 1. 공통 원칙
- 환경별 bundle id를 분리한다.
- dev, staging, production의 redirect URL을 혼동하지 않는다.
- 앱 복귀용 custom scheme와 웹 callback URL을 동시에 관리한다.

## 2. 환경값
| 환경 | Bundle ID | Web Base URL |
| --- | --- | --- |
| dev | `com.invitehub.app.dev` | `https://dev.invitehub.co.kr` |
| staging | `com.invitehub.app.staging` | `https://staging.invitehub.co.kr` |
| production | `com.invitehub.app` | `https://invitehub.co.kr` |

앱 복귀 URL:
- `invitehub://auth/callback`

## 3. Apple Sign In
체크리스트:
- Apple Developer Program 가입
- App ID 생성
- Sign In with Apple capability 추가
- Service ID 생성
- Web domain 연결
- Supabase Apple provider 설정
- Expo 앱에 `usesAppleSignIn: true` 설정
- 실기기에서 Apple 로그인 테스트

구현 결정:
- iOS 앱은 `expo-apple-authentication` 사용
- 웹은 필요 시 Supabase provider 플로우 사용

## 4. Kakao Login
체크리스트:
- Kakao developer 앱 생성
- iOS 플랫폼에 bundle id 등록
- Redirect URI에 Supabase callback 등록
- 앱 scheme `kakao{APP_KEY}` 확인
- Supabase Kakao provider 설정
- 앱 복귀 URL 확인

구현 결정:
- v1.0은 Supabase OAuth 브라우저 플로우 사용

## 5. Email Login
체크리스트:
- Supabase email auth 활성화
- test 계정 생성
- 비밀번호 리셋 흐름 확인

## 6. 테스트 목록
- 앱 로그인 성공
- 앱 로그인 취소
- callback 복귀 성공
- 세션 유지 확인
- 로그아웃 확인
- 계정 삭제 후 재로그인 차단 확인
