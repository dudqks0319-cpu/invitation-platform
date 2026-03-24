# InviteHub iOS 앱 상세 계획서 v3.1

## 1. Summary
InviteHub v1.0은 "초대장을 만드는 사람"을 위한 iOS 앱과 "초대장을 받는 사람"을 위한 웹 공개 페이지를 함께 운영하는 제품이다.  
앱은 작성, 수정, 관리에 집중하고, 공개 초대장 열람과 RSVP 제출, 방명록 작성은 웹에서 처리한다. 이렇게 해야 초대장을 받는 사람이 앱 설치 없이 바로 내용을 볼 수 있다.

## 2. Contacts
| 역할 | 담당 | 메모 |
| --- | --- | --- |
| Product Owner | 영빈님 | 범위, 우선순위, 출시 결정 |
| iOS App Lead | TBD | Expo, React Native, App Store 제출 |
| Web Lead | TBD | 공개 초대장 페이지, OG 이미지, 공개 API |
| Backend Lead | TBD | Supabase schema, RLS, Edge Functions |
| Design | TBD | 템플릿, 앱 UI, 스크린샷 |
| QA | TBD | Maestro, Playwright, 수동 검증 |
| Support | TBD | `support@invitehub.co.kr` 운영 |

## 3. Background
현재 레포는 이미 웹 초대장 서비스의 뼈대를 갖고 있다.  
웹에는 초대장 공개 페이지, 빌더, 대시보드, Supabase 연동, 공개 RSVP/방명록 API, 결제 API 초안이 있다.

문제는 두 가지다.
- 받는 사람까지 앱 설치를 요구하면 공유 전환율이 크게 떨어진다.
- 현재 웹 구조를 무시하고 앱을 새로 만들면 같은 기능을 두 번 만들게 된다.

따라서 방향을 이렇게 고정한다.
- 작성자 경험: iOS 앱이 주력
- 수신자 경험: 웹 공개 페이지가 정본
- 데이터 저장소: Supabase 하나로 통합

## 4. Objective
### 4.1 Product Objective
결혼식 초대장을 빠르게 만들고, 카카오톡으로 쉽게 공유하고, RSVP를 관리할 수 있는 iOS 제작 도구를 출시한다.

### 4.2 Why It Matters
- 작성자는 앱에서 더 편하게 사진 촬영, 수정, 관리가 가능하다.
- 수신자는 앱 설치 없이 웹 링크로 바로 초대장을 볼 수 있다.
- 운영자는 하나의 데이터 모델로 앱과 웹을 같이 운영할 수 있다.

### 4.3 Key Results
- KR1. 첫 초대장 생성 완료율 60% 이상
- KR2. 초대장 공유 완료율 70% 이상
- KR3. 앱 시작 후 첫 화면 표시 2초 이내
- KR4. 공개 초대장 페이지 로드 2초 이내
- KR5. App Store 첫 심사 통과 또는 1회 재제출 내 통과

## 5. Market Segment(s)
### 5.1 Primary Segment
- 결혼식을 준비하는 20~40대 예비부부
- 모바일로 사진과 문구를 자주 바꾸는 사용자
- 카카오톡 공유가 기본인 사용자

### 5.2 Secondary Segment
- 부모님이나 가족이 같이 관리하는 사용자
- RSVP를 행사 전까지 계속 확인해야 하는 사용자

### 5.3 Constraints
- v1.0은 결혼식 중심으로 시작한다.
- 받는 사람은 앱 설치 없이 웹에서 열 수 있어야 한다.
- App Store 심사를 위해 로그인, UGC, 계정 삭제, 권한 설명을 준비해야 한다.

## 6. Value Proposition(s)
### 6.1 For Creators
- 앱에서 초대장을 쉽게 만들고 수정할 수 있다.
- 사진 업로드, RSVP 확인, 방명록 관리가 한곳에 있다.
- 카카오톡 공유용 링크와 미리보기 이미지가 자동으로 준비된다.

### 6.2 For Guests
- 앱 설치 없이 링크만 열면 된다.
- RSVP와 방명록 작성이 간단하다.
- 지도로 장소를 바로 열 수 있다.

### 6.3 Why We Can Win
- "제작은 앱, 소비는 웹" 구조가 실제 공유 습관에 맞다.
- 웹/앱이 같은 데이터 모델을 쓰므로 유지보수가 단순하다.
- 사진, 공유, RSVP 같은 실제 행사 운영 기능을 먼저 푼다.

## 7. Solution
### 7.1 Product Shape
- `apps/mobile`: 작성자용 iOS 앱
- `apps/web`: 수신자용 공개 페이지 + 공개 API + OG 이미지
- `packages/shared`: 타입, 템플릿 설정, 유틸, 상수
- `supabase`: DB, Auth, Storage, Edge Functions

### 7.2 Core Product Rule
- 앱은 "관리 도구"다.
- 공개 초대장은 항상 웹 URL이 정본이다.
- 공유는 항상 `https://invitehub.co.kr/i/{slug}` 형식으로 한다.

### 7.3 Scope for v1.0
포함:
- 결혼식 초대장 생성
- 템플릿 3~5개
- 메인 사진, 배경 사진, 갤러리 최대 10장
- Apple 로그인, 카카오 로그인, 이메일 로그인
- RSVP 조회
- 방명록 조회, 승인, 숨기기, 신고 처리
- 카카오톡 공유
- 네이버 지도 열기
- 계좌 복사
- 계정 삭제

제외:
- 앱 내 결제
- 유료 플랜 활성화
- 돌잔치, 환갑, 비즈니스 행사 활성화
- 30종 전체 템플릿 활성화
- 동영상, BGM, 커스텀 도메인

### 7.4 Information Architecture
앱 탭 구조:
- 홈
- 내 초대장
- 마이페이지

앱 주요 흐름:
1. 로그인
2. 템플릿 선택
3. 빌더 5단계
4. 미리보기
5. 저장
6. 공유
7. RSVP/방명록 관리

웹 주요 흐름:
1. 공개 URL 접속
2. 초대장 열람
3. RSVP 제출
4. 방명록 작성

### 7.5 Shared Data Model
공유 데이터는 `InvitationPayload v2`를 기준으로 한다.

핵심 원칙:
- `schemaVersion`: 데이터 구조 버전
- `revision`: 문서 수정 충돌 검사용 증가 값
- `eventType`: v1.0에서는 `wedding`만 실제 사용
- `photos.gallery`: v1.0 제한 10장

중요 결정:
- `schemaVersion`과 `revision`은 분리한다.
- 스키마 버전은 마이그레이션용이다.
- 수정 충돌 비교에는 `revision`만 사용한다.

### 7.6 Backend Boundary
앱이 직접 처리:
- Auth session 유지
- 내 초대장 CRUD
- 내 RSVP 조회
- 내 방명록 관리
- 통계 조회

웹 서버가 처리:
- 공개 초대장 조회
- 익명 RSVP 작성
- 익명 방명록 작성
- OG 이미지 생성
- 공개 API rate limit

도구 결정:
- 공개 API rate limit은 v1.0에서 `Upstash Redis` 기반 슬라이딩 윈도우를 사용한다.
- 기본값은 RSVP `10분당 5회`, 방명록 `10분당 10회`로 시작한다.

### 7.7 Upload Decision
v1.0 업로드 방식은 하나로 고정한다.

선택:
- 앱은 Supabase Storage에 직접 업로드한다.

이유:
- 작성자는 인증된 사용자다.
- 사진은 작성자만 업로드한다.
- 파일 바이트를 웹 서버가 중계하지 않아도 된다.

보완책:
- Storage bucket에 크기와 MIME 제한 적용
- 업로드 경로는 `owner_id/...`로 고정
- 앱에서 업로드 전 리사이즈 수행
- 업로드 실패 시 재시도 큐 유지

v1.0에서 제거:
- `POST /api/upload/validate`

### 7.8 Auth Decision
Apple 로그인:
- iOS 앱은 `expo-apple-authentication` 기반 네이티브 로그인 사용
- 받은 토큰은 Supabase에 연결해 세션을 만든다

카카오 로그인:
- Supabase OAuth 브라우저 플로우 사용
- 앱 복귀는 `invitehub://auth/callback` 사용

이메일 로그인:
- Supabase Auth 기본 기능 사용

### 7.9 Guestbook Moderation Rule
방명록은 기본 승인 대기로 시작한다.

정책:
- `is_approved default false`
- 공개 웹에서는 `is_approved = true`만 보여준다
- 작성자는 앱에서 승인 또는 숨기기 처리한다
- 신고 누적이 높으면 `is_blocked = true` 처리한다

Apple UGC 대응:
- 욕설 필터
- 신고 기능
- abusive user 차단
- 연락처 공개

abusive user 차단 방식:
- `ip_hash`만 쓰지 않는다
- `ip_hash + rate limit + anonymous client identifier + report_count`를 같이 쓴다

### 7.10 Offline and Sync
자동 저장:
- 입력 후 5초 디바운스
- 단계 이동 시 즉시 저장
- 앱이 백그라운드로 갈 때 즉시 저장

동기화 상태:
- `synced`
- `pending`
- `offline`
- `conflict`

충돌 규칙:
- 서버 `revision`과 로컬 `baseRevision` 비교
- 다르면 충돌 배너 노출
- 사용자가 서버 버전 또는 내 버전을 선택

### 7.11 Pricing and App Review Policy
v1.0은 무료 전용 앱으로 고정한다.

앱 내 정책:
- 가격표 없음
- 유료 업셀 버튼 없음
- "웹에서 결제" 문구 없음
- 프리미엄 잠금 해제 흐름 없음

이유:
- Apple 3.1.1 리스크 제거
- MVP 복잡도 축소

### 7.12 Success Metrics
앱:
- 회원가입 수
- 초대장 생성 수
- 공유 완료 수
- 초안 저장 성공률

웹:
- 공개 페이지 조회 수
- RSVP 제출 수
- 방명록 제출 수
- 공유 링크 클릭률

기술:
- 크래시 프리 세션 비율
- 업로드 성공률
- 동기화 실패율

### 7.13 Security and Privacy
필수 원칙:
- RLS로 owner 데이터만 접근
- 공개 페이지는 published slug만 조회
- 공개 쓰기 API는 rate limit 적용
- 사진 버킷은 owner 경로 제한
- 계정 삭제 시 사용자 데이터 정리
- 로그에 민감정보 저장 금지

### 7.14 Test Strategy
Unit:
- `packages/shared`
- payload migration
- validation
- template mapping
- entitlement
- formatter

E2E App:
- Maestro
- 로그인
- 초대장 생성
- 저장
- 공유

E2E Web:
- Playwright
- 공개 페이지 렌더링
- RSVP 제출
- 방명록 작성
- OG 이미지

Release gate:
- typecheck
- lint
- unit test
- maestro smoke
- playwright smoke
- iOS device build

관측 도구:
- 앱 크래시 리포팅은 `Sentry`를 사용한다.
- 사용 흐름 집계는 Expo 기본 지표 + 서버 로그 기반으로 시작한다.

### 7.15 Assumptions
- 수신자는 앱 설치보다 웹 링크를 선호한다
- 초기 사용자는 결혼식 카테고리에 가장 많이 집중한다
- v1.0 무료만으로도 초기 사용성과 공유 흐름 검증이 가능하다
- 템플릿 3~5개면 첫 출시 테스트에 충분하다

### 7.16 OG Image
카카오톡 공유 성능을 위해 동적 OG 이미지를 만든다.

원칙:
- 공개 초대장마다 `1200x630` 비율의 OG 이미지를 제공한다.
- 서버는 `apps/web`에서 `/api/og/[slug]` 경로로 이미지를 동적 생성한다.
- 카드에는 이름, 행사 날짜, 장소, 템플릿 톤을 반영한다.

기대 효과:
- 카카오톡 공유 미리보기 품질 향상
- 공유 링크 클릭률 개선

### 7.17 Migration Plan
기존 웹 코드를 버리지 않고 점진적으로 이전한다.

핵심 작업:
- 기존 payload를 `InvitationPayload v2`로 변환하는 함수 작성
- 기존 HTML 템플릿을 `TemplateConfig` JSON으로 매핑
- 웹 빌더는 유지하되, 신규 앱은 shared 모델을 기준으로 개발

원칙:
- 공개 웹의 현재 동작을 깨지 않는다.
- 기존 slug와 공개 URL은 유지한다.
- 앱과 웹이 동시에 shared 타입을 쓰도록 점진 전환한다.

### 7.18 Performance and Accessibility Baseline
성능 기준:
- 앱 시작 후 홈 화면 표시 `2초 이내`
- 템플릿 목록 스크롤 `60fps 유지`
- 10MB 사진 업로드 `10초 이내` on Wi-Fi
- 빌더 입력 반영 `300ms 이내`
- RSVP 100건 로드 `1초 이내`

접근성 기준:
- 모든 주요 버튼과 이미지에 `accessibilityLabel` 제공
- 최소 터치 타깃 `44x44pt`
- 텍스트 대비 `WCAG AA` 기준 지향
- VoiceOver 기본 탐색 가능

## 8. Release
### 8.1 Phase Plan
Phase 0 `(1주)`:
- 모노레포 구조 확정
- shared 타입 작성
- schema v2 작성
- OAuth 설정 문서화

Phase 1 `(1주)`:
- Expo 앱 생성
- Xcode 실기기 빌드 통과
- Supabase 연결
- 탭 구조 생성

Phase 2 `(2주)`:
- 홈
- 템플릿 렌더러
- 빌더 5단계
- 내 초대장 목록

Phase 3 `(2주)`:
- 로그인
- 사진 업로드
- 공유
- RSVP/방명록 관리
- 오프라인 처리

Phase 4 `(2주)`:
- 디자인 시스템
- 애니메이션
- 접근성
- 마이페이지

Phase 5 `(1~2주)`:
- 웹/앱 통합 검증
- 테스트 자동화
- 성능 점검

Phase 6 `(1~2주 + 심사)`:
- 앱 에셋
- 법적 문서
- App Store Connect
- EAS build
- 심사 제출

### 8.2 Acceptance Criteria for v1.0
- 사용자는 iOS 앱에서 결혼식 초대장을 만들 수 있다
- 사용자는 사진을 올리고 저장할 수 있다
- 사용자는 카카오톡으로 웹 링크를 공유할 수 있다
- 수신자는 앱 설치 없이 초대장을 볼 수 있다
- 수신자는 웹에서 RSVP와 방명록을 제출할 수 있다
- 작성자는 앱에서 RSVP와 방명록을 관리할 수 있다
- 앱은 오프라인 저장과 충돌 알림을 처리한다
- App Store 심사 필수 항목을 충족한다

### 8.3 Risks
| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| Apple 로그인/카카오 로그인 설정 지연 | 출시 지연 | Phase 0에서 먼저 설정 |
| 공개 API 스팸 | RSVP/방명록 오염 | rate limit, 필터, 신고 |
| 템플릿 렌더링 공수 증가 | 일정 지연 | v1.0 템플릿 수 제한 |
| 오프라인 충돌 처리 복잡도 | 버그 위험 | revision 모델 단순화 |
| App Review 해석 차이 | 재심사 | 무료-only 정책 유지 |

### 8.4 Future Releases
v1.1:
- 돌잔치, 환갑 활성화
- 템플릿 확장
- 푸시 알림

v1.2:
- 결제 도입 검토
- IAP 또는 별도 구조 확정
- 갤러리 40장 확대

## 9. Budget
| 항목 | 비용 | 메모 |
| --- | --- | --- |
| Apple Developer Program | `$99/년` | 필수 |
| Supabase | 무료 시작 | 사용량 증가 시 확장 |
| Expo EAS Build | 무료 시작 | 빌드 횟수 증가 시 유료 검토 |
| 도메인 | 약 `2만원/년` | 선택이지만 권장 |
| Upstash Redis | 무료 시작 | 공개 API rate limit용 |
| Sentry | 무료 시작 | 앱 크래시 리포팅 |

예상 초기 필수 비용:
- Apple Developer Program 중심으로 시작
- 대략 `13만~15만원` 범위

## 10. Appendix
### 10.1 Companion Docs
- `docs/implementation.md`
- `docs/oauth-checklist.md`
- `docs/migration-plan.md`
- `docs/apple-review.md`

### 10.2 Working Rule
- PRD는 "왜, 무엇을"을 정의한다.
- 구현 세부와 체크리스트는 companion docs에 둔다.
