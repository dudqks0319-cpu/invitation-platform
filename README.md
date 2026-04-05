# InviteHub Web Rebuild

기존 `invitation-platform` 정적 데모를 `Next.js + TypeScript + Supabase` 기반 웹 앱 구조로 재구성한 작업본입니다.

## 현재 범위

- 디자인 언어 유지
  - 기존 `css/main.css`의 컬러, 타이포, 간격, 카드/버튼 스타일 유지
- 웹 MVP 구조
  - 랜딩 페이지
  - 초대장 빌더
  - 미리보기 페이지
  - 공개 초대장 페이지
  - 대시보드
  - 이메일 로그인 화면
- 데이터 저장 경로
  - 환경 변수가 없으면 로컬 데모 모드
  - Supabase 환경 변수가 있으면 실제 저장/발행/RSVP/방명록 사용 가능

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase SSR / supabase-js
- Vitest

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## Supabase 연결

루트의 `.env.example`를 참고해서 아래 환경 변수를 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
KAKAOPAY_CID=
KAKAOPAY_SECRET_KEY=
```

그리고 `supabase/schema.sql`을 SQL Editor에서 실행합니다.

## 인수인계 / 외부 서비스 설정

다른 사람이나 AI가 바로 이어받아 작업하려면 아래 문서를 먼저 읽는 것이 좋습니다.

- [handoff-setup-guide.md](/Users/jyb-m3max/Desktop/codex/invitation-platform/docs/handoff-setup-guide.md)

## 검증 명령

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## 구조

```txt
app/
  page.tsx
  builder/page.tsx
  preview/page.tsx
  dashboard/page.tsx
  invitations/[slug]/page.tsx
components/
  landing/
  builder/
  invitations/
  dashboard/
  shared/
lib/
  invitation-payload.ts
  demo-data.ts
  templates.ts
  supabase/
supabase/schema.sql
css/main.css
```

## 남은 확장 포인트

- 이미지 업로드를 Supabase Storage로 전환
- 카카오/네이버 OAuth
- 결제
- 운영용 guestbook moderation UI
- 공개 초대장 조회 통계 고도화
