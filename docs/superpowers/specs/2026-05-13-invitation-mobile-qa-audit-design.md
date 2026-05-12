# InviteHub Mobile Invitation QA Audit Design

Date: 2026-05-13
Branch: `codex/invitation-review-fixes`
Purpose: 출시 전 사용자 관점 QA 감사를 설계한다. 이 문서는 구현 계획이 아니라, 실제 모바일 초대장 서비스로 사용할 때 막힘이 없는지 확인하기 위한 감사 스펙이다.

## 1. Goal

InviteHub가 "모바일 초대장 제작 + RSVP 운영 서비스"로 출시 가능한지 확인한다. 코드 테스트 통과만 보지 않고, 실제 사용자가 템플릿을 고르고, 정보를 입력하고, 미리보기와 실제 공개 화면을 확인하고, 하객에게 공유하고, RSVP/방명록/CSV를 운영하는 전체 흐름을 감사한다.

최종 산출물은 우선순위가 붙은 QA 리포트다.

- `P0`: 출시 전 반드시 막아야 하는 사용자 피해, 결제, 개인정보, 공유, 발행 실패
- `P1`: 출시 전 고치면 체감 품질이 크게 올라가는 UX/운영 문제
- `P2`: 출시 후 개선하거나 마케팅 실험으로 검증할 수 있는 문제

## 2. Audit Perspectives

### User

초대장을 만드는 사람이 처음 방문 후 5분 안에 초대장 완성 가능성을 이해하고, 무료/유료 조건과 발행 상태를 혼동하지 않는지 본다.

### Guest

하객이 모바일 초대장에서 날짜, 장소, 지도, 계좌, RSVP, 방명록, 공유를 빠르게 찾고 사용할 수 있는지 본다.

### Designer

360px, 390px, 430px, 데스크톱 폭에서 카드, 버튼, 텍스트, 미리보기, 대시보드 row, 공개 초대장 섹션이 깨지지 않는지 본다.

### Marketer

랜딩의 "무료 발행", "사진 포함 유료", "RSVP 운영", "카카오톡/문자/SNS 공유" 문구가 실제 기능과 충돌하지 않는지 본다. 전환 이벤트가 GA4 태그 설치 시 수집 가능한지도 확인한다.

### Developer

API 권한, fallback, publish readiness, store payment partial success, Expo 호환성, 테스트 커버리지, secret scan, audit 경고를 본다.

### Operator

대시보드에서 RSVP 전체 보기, 필터, CSV 다운로드, 방명록 승인, 상태별 액션, 발행 복구가 실무적으로 충분한지 본다.

## 3. User Journeys To Audit

### First Visit

1. 랜딩 접속
2. 서비스 목적 파악
3. 무료/유료 조건 확인
4. 템플릿 목록 탐색
5. 템플릿 미리보기
6. 템플릿 사용 시작

Pass criteria:

- 첫 화면에서 "모바일 초대장을 만들고 보내고 관리한다"는 목적이 명확하다.
- 템플릿 카드에서 사진 없는 무료 발행과 사진 포함 정책을 이해할 수 있다.
- 모바일 폭에서 카드나 CTA가 잘리지 않는다.

### Builder

1. 템플릿 선택 후 빌더 진입
2. 기본 정보, 사람 정보, 사진, 계좌/지도, 발행 단계 입력
3. 사진 단계에서 유료 정책 확인
4. 공개 전 체크리스트 확인
5. 부족한 항목 클릭 시 해당 단계 이동
6. 초안 저장과 발행의 차이 확인

Pass criteria:

- 데모값이 실제 입력값처럼 보이지 않는다.
- 사진 유료 정책이 업로드 전과 발행 전 모두 보인다.
- 공개 전 필수값 누락이 서버 에러보다 먼저 UI에서 이해된다.

### Preview And Public Invitation

1. 빌더 미리보기 확인
2. 공개 초대장 화면 확인
3. 두 화면의 제목, 이름, 날짜, 장소, 문구, 사진 분위기 비교
4. 미리보기 전용 제한 문구 확인

Pass criteria:

- 빌더 미리보기와 공개 초대장이 정보 구조와 분위기 면에서 크게 다르지 않다.
- 공개 전 미리보기 링크가 하객에게 보낼 수 있는 링크처럼 오해되지 않는다.

### Publish And Share

1. 무료 발행 시도
2. 발행 완료 화면 확인
3. 공유하기, 링크 복사, 실제 화면 보기, RSVP 운영 CTA 확인
4. clipboard 실패 fallback 확인
5. native share 실패 fallback 확인
6. Kakao SDK 공유 가능성 확인

Pass criteria:

- "카카오톡으로 공유"라는 문구는 실제 Kakao SDK 공유 버튼에만 사용한다.
- Web Share API 또는 링크 복사 fallback은 "공유하기"로 표현한다.
- 공유 실패 시 사용자는 직접 복사할 방법을 받는다.

### Guest Interaction

1. 공개 초대장 접속
2. 날짜/장소/지도 확인
3. 계좌 복사와 복사 완료 메시지 확인
4. 카카오페이 링크 없을 때 안내 확인
5. RSVP 참석/불참 제출
6. 불참 시 동행 인원 0 처리
7. 방명록 작성과 승인 전 안내 확인
8. 하객 공유 버튼 확인

Pass criteria:

- 하객은 장소/지도와 RSVP를 5초 안에 찾을 수 있다.
- 계좌 복사는 성공/실패 피드백이 있다.
- RSVP 제출 후 중복 제출 위험이 안내된다.
- 방명록이 승인 후 공개된다는 점이 명확하다.

### Dashboard And Operations

1. 대시보드 접속
2. 오늘 확인할 일 확인
3. 초대장 목록 상태별 액션 확인
4. RSVP 전체 보기, 검색, 참석/불참 필터 확인
5. CSV 다운로드와 개인정보 안내 확인
6. 방명록 승인/거절 확인
7. paid 상태 발행 복구 확인

Pass criteria:

- 운영자는 새 RSVP, 승인 대기 방명록, 결제 확인 필요 상태를 빠르게 확인한다.
- CSV 다운로드 전 하객 개인정보 취급 안내가 보인다.
- 발행 복구 후 재결제 없이 공유 CTA로 이어진다.

### Mobile App And Expo

1. 모바일 홈 로그인 상태 분기 확인
2. 내 초대장 이어가기 확인
3. 템플릿 탐색 확인
4. 모바일 빌더/미리보기 확인
5. 스토어 결제 보류 상태 확인
6. Expo dependency check와 Doctor 확인

Pass criteria:

- 로그인 사용자는 "로그인" 대신 "내 초대장" 또는 이어가기 흐름을 본다.
- 결제 확인됨/발행 보류 상태는 결제 실패로 오해되지 않는다.
- Expo Doctor의 non-CNG config sync 경고는 운영 정책으로 별도 관리한다.

## 4. Korean Product Reference Criteria

한국형 모바일 초대장 서비스는 직접 모든 기능을 만들기보다 사용자가 이미 믿고 쓰는 생태계를 잘 연결해야 한다.

Reference products and patterns:

- SnapPost: RSVP, 엑셀 내보내기, 계좌/카카오페이, 카카오/네이버/구글 지도, 섹션 편집
- Paper Moments: 카카오톡/문자/인스타 DM 공유, RSVP 실시간 수집, 방명록 승인, 엑셀 다운로드
- Vivid Vows and similar wedding invitation services: 카카오톡 공유, QR, RSVP, 방명록, 외부 링크

External platform strategy:

- Kakao Talk sharing: Kakao JavaScript SDK 공유를 우선한다. SDK 키, 도메인 설정, SDK load failure, fallback을 감사한다.
- Login: 자체 계정 UX보다 Kakao/Google/Apple social login availability를 우선 확인한다.
- Maps: 초기 출시는 카카오맵/네이버지도/구글맵 외부 링크를 안정적으로 연결하는 것으로 충분하다.
- Payment: 카카오페이 송금은 직접 송금 처리하지 않고 사용자가 등록한 송금 링크를 안전하게 노출한다.
- Export: RSVP는 서비스 내 관리하고, CSV/Excel 다운로드는 브라우저 다운로드로 처리한다. 개인정보 안내와 한글 호환 파일 포맷을 확인한다.
- Kakao Alimtalk/Friendtalk: 초기 감사 범위에서는 제외한다. 비즈니스 채널, 템플릿 심사, 수신 동의, 광고성 메시지 규정이 붙기 때문이다.

Official references used for the audit design:

- Kakao JavaScript SDK: https://developers.kakao.com/docs/ko/javascript/getting-started
- Kakao Talk message/share: https://developers.kakao.com/docs/ko/kakaotalk-message/js
- SnapPost: https://www.snappost.co/
- SnapPost RSVP: https://www.snappost.co/ko/features/rsvp
- Paper Moments: https://www.paper-moments.com/
- Vivid Vows: https://vividvows.co.kr/

## 5. Audit Methods

### Static Review

Read the relevant code paths:

- `app/page.tsx`
- `components/landing/template-browser.tsx`
- `components/builder/builder-studio.tsx`
- `components/invitations/invitation-view.tsx`
- `components/payments/checkout-flow.tsx`
- `components/payments/publish-recovery-panel.tsx`
- `components/dashboard/dashboard-shell.tsx`
- `app/api/public/*`
- `app/api/payments/*`
- `apps/mobile/app/*`
- `apps/mobile/hooks/useStorePurchase.ts`
- `apps/mobile/lib/*`

### Automated Verification

Run and record:

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run lint --workspace @invitehub/mobile`
- `npm run typecheck --workspace @invitehub/mobile`
- `npx expo install --check`
- `npx expo-doctor --verbose`
- `npm audit --omit=dev --audit-level=high`
- `git diff --check`
- `gitleaks protect --staged` when changes are staged

### Browser And Visual QA

Use local web execution to inspect:

- `/`
- `/builder`
- `/preview`
- `/checkout`
- `/dashboard`
- `/invitations/{slug}`
- `/dashboard/invitations/{id}/publish-recovery`

Viewports:

- 360 x 800
- 390 x 844
- 430 x 932
- 768 x 1024
- 1440 x 900

Visual checks:

- horizontal overflow
- overlapping text
- buttons leaving containers
- sticky tab behavior
- invitation preview height and cropping
- modal focus and ESC behavior
- public invitation readability
- dashboard action density

### Functional Flow QA

Use local fixtures or available demo data to verify:

- template preview open/close
- template use CTA
- draft save
- free publish blocked by missing fields
- free publish success
- share button fallback
- link copy fallback
- account copy feedback
- RSVP yes/no and guest count behavior
- guestbook moderation notice
- CSV download
- publish recovery
- GA4 event no-op behavior when `gtag` is absent

### Kakao Sharing QA

Check:

- `NEXT_PUBLIC_KAKAO_JS_KEY` path
- platform-provided Kakao key precedence
- Kakao SDK script load
- SDK initialization guard
- `Kakao.Share.sendDefault` payload
- configured domain requirement
- fallback to Web Share API or clipboard
- UI copy does not promise Kakao-only behavior when SDK is unavailable

Real Kakao app share confirmation requires a physical mobile device and production or staging domain configured in Kakao Developers.

## 6. Decision Scale

Each finding must include priority, impact, reproduction path, and recommended direction.

- `Pass`: ready for release QA
- `Watch`: acceptable now, but must be checked in staging or on device
- `Fix Recommended`: should be improved before launch if time allows
- `Blocker`: should not launch until fixed

## 7. Expected QA Report Shape

The final audit report should contain:

1. Executive summary
2. P0/P1/P2 findings
3. User journey status table
4. Viewport and visual QA status
5. Kakao/login/export/platform integration assessment
6. Marketing/design/developer/operator perspective notes
7. Tests and commands run
8. Staging or physical-device checklist
9. Recommended implementation order

## 8. Scope Boundaries

This audit design does not implement product changes. It defines how to inspect and judge the product. Implementation work begins only after the spec is reviewed, approved, and converted into an implementation plan.

Out of scope for the first audit:

- Kakao Alimtalk/Friendtalk automation
- full payment gateway replacement
- native app store build submission
- full legal review by counsel
- large redesign of the builder architecture

## 9. Self-Review

- No incomplete sections remain.
- The audit is focused on one deliverable: pre-launch mobile invitation QA.
- The design separates audit scope from implementation.
- Korean ecosystem references are used as benchmark criteria, not copied as product requirements.
- Known caveats are explicit: Kakao app share needs real device/domain verification, and Expo non-CNG warning is a structural release policy item.
