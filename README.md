# InviteHub — 감성 초대장 플랫폼

소중한 순간을 위한 온라인 초대장 서비스입니다.

## 기술 스택

- **웹**: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4
- **모바일**: Expo SDK 52 · React Native
- **백엔드**: Supabase (DB, Auth, Storage)
- **보안**: Upstash Redis (Rate Limiting) · IP Hash · RLS

## 시작하기

```bash
# 1. 클론
git clone https://github.com/dudqks0319-cpu/invitation-platform.git
cd invitation-platform

# 2. 환경변수
cp .env.example .env.local
# .env.local에 Supabase 키 입력

# 3. 의존성 설치 & 실행
npm install
npm run dev
```

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Authentication → Providers에서 Apple 활성화
4. `.env.local`에 URL, Anon Key, Service Role Key 입력

## 모바일 앱

```bash
cd apps/mobile
npm install
npx expo start
```

## 프로젝트 구조

```txt
app/                    # Next.js 페이지
  i/[slug]/             # 공개 초대장 (/i/{slug})
  api/public/[slug]/    # 공개 API (RSVP, 방명록, 방문)
  api/og/[slug]/        # OG 이미지 생성
  privacy/              # 개인정보처리방침
  terms/                # 이용약관
components/             # React 컴포넌트
  builder/              # 초대장 빌더
  dashboard/            # 대시보드 (RSVP, 방명록, 통계)
  invitations/          # 초대장 뷰
lib/                    # 유틸리티
  supabase/             # Supabase 클라이언트
  rate-limit.ts         # Rate Limiting
  hash-ip.ts            # IP 해시
apps/mobile/            # Expo 모바일 앱
supabase/schema.sql     # DB 스키마
docs/                   # 문서
```
