# 💌 InviteHub - 초대장 플랫폼

> 소중한 순간을 더욱 특별하게 만드는 모바일 초대장 플랫폼

![Platform Preview](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS-blue)
![Templates](https://img.shields.io/badge/Templates-30%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🌐 라이브 데모

> GitHub Pages로 바로 확인하세요!  
> `Settings → Pages → Source: main / root` 설정 후 활성화

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📊 실시간 RSVP | 참석 여부 실시간 확인, 엑셀 내보내기 |
| 🗺️ 지도 연동 | 카카오맵, 네이버맵 교통편 안내 |
| 💳 계좌/카카오페이 | 신랑·신부 계좌 + 카카오페이 송금 링크 연결 |
| 🎵 BGM 업로드 | 직접 음원 업로드 또는 추천 BGM 선택 |
| 📸 포토 갤러리 | 최대 40장 사진, 확대 방지 옵션 |
| 🔔 카카오톡 알림 | 방문자 알림, 공유 현황 실시간 확인 |
| ✏️ 무제한 수정 | 제작 후 언제든 실시간 수정 가능 |
| 🔗 개인 도메인 | 나만의 고유 링크 + QR 코드 자동 생성 |
| 🛠️ 제작 전용 페이지 | `사용하기` 클릭 시 `builder.html`로 이동, 실시간 폰 미리보기 |
| 📅 날짜/시간 피커 | `datetime-local` 기반 캘린더/시간 선택 |
| 👨‍👩‍👧‍👦 혼주 상세 입력 | 신랑/신부 + 양가 부모님 성함/연락처 입력 |
| 🗺️ 네이버 지도 연결 | 주소 기반 네이버 지도 검색 링크 자동 생성 |

---

## 📋 초대장 카테고리 & 템플릿

### 💍 결혼식 (5종)
- 클래식 로즈 - 따뜻한 크림톤 플로럴
- 다크 골드 - 다크 배경 + 골드 포인트
- 핑크 플로럴 - 화사한 핑크 로맨틱
- 미니멀 화이트 - 심플하고 가독성 최고
- 내추럴 그린 - 초록빛 자연 감성

### 🎂 돌잔치 (5종)
- 귀요미 옐로 - 아기자기 따뜻한 옐로
- 파스텔 핑크 - 공주님 파스텔
- 블루 스페이스 - 우주 탐험 남아용
- 그린 내추럴 - 자연 친화 미니멀
- 골드 럭셔리 - 프리미엄 골드

### 🎊 환갑잔치 (5종)
- 황금 환갑 - 전통 황금빛
- 모던 브라운 - 다크 브라운 + 골드
- 레드 장수 - 건강 장수 레드
- 플로럴 칠순 - 꽃향기 화사한
- 서예 전통 - 한자 서예 감성

### 👰 브라이덜샤워 (5종)
- 핑크 드림 - 핑크빛 로맨틱
- 보헤미안 - 어스톤 골드 보헤미안
- 블랙 럭셔리 - 다크 프리미엄
- 민트 프레시 - 청량한 민트
- 플로럴 가든 - 화사한 정원 파티

### 🎉 생일파티 (3종)
- 컬러풀 파티 - 다채로운 신나는
- 엘레강스 - 퍼플 고급스러운
- 키즈 무지개 - 아이들을 위한

### 🏠 집들이 / 🍼 베이비샤워 / 🎓 졸업파티 / 📋 비즈니스 (각 2종+)

---

## 🗂️ 프로젝트 구조

```
invitation-platform/
├── index.html          # 메인 페이지
├── builder.html        # 초대장 제작 전용 페이지
├── css/
│   └── main.css        # 전체 스타일 (반응형 포함)
├── js/
│   ├── templates.js    # 템플릿 데이터 (30종+)
│   ├── supabase-client.js # Supabase 클라이언트 초기화 (localStorage 기반)
│   ├── main.js         # 메인 페이지 로직 (로그인, RSVP, 방명록, 통계)
│   └── builder.js      # 제작 페이지 로직 (폼, 업로드, 실시간 미리보기)
├── supabase/
│   └── schema.sql      # 테이블 + RLS 정책
└── README.md
```

---

## 📱 모바일 앱 로드맵

### Android (React Native / Flutter)
- [ ] 웹 기반 → React Native 포팅
- [ ] 푸시 알림 (FCM)
- [ ] 카카오 소셜 로그인
- [ ] 오프라인 초안 저장
- [ ] Google Play Store 배포

### iOS
- [ ] Swift UI 또는 Flutter 멀티플랫폼
- [ ] APNs 푸시 알림
- [ ] Apple 로그인 지원
- [ ] App Store 배포

---

## 🚀 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/dudqks0319-cpu/invitation-platform.git

# 2. 폴더 진입
cd invitation-platform

# 3. 로컬 서버 실행 (권장)
python3 -m http.server 4180

# 4. 브라우저 접속
open http://127.0.0.1:4180
```

---

## 🧪 Supabase 테스트 연동 (키를 GitHub에 안 넣는 방식)

1. Supabase SQL Editor에서 `supabase/schema.sql` 실행
2. 웹앱 우상단 `Supabase 설정` 클릭
3. `Supabase URL`, `Anon Key` 입력 후 저장
4. 로그인 모달에서 이메일 회원가입/로그인 테스트

보안 메모:
- URL/Anon Key는 코드 파일에 저장하지 않고 **브라우저 localStorage에만 저장**됩니다.
- 따라서 GitHub에 push해도 키가 같이 올라가지 않습니다.
- 이미 노출된 키가 있으면 폐기(revoke) 후 새 키를 사용하세요.

---

## 💡 경쟁사 분석 & 차별점

| 업체 | 장점 | 단점 |
|------|------|------|
| 데어무드 | 트렌디한 디자인, RSVP 기능 | 상대적으로 비싼 가격 |
| 투아워게스트 | 10분 완성, 무료 | 템플릿 수 제한 |
| 유비비드 | 다국어 지원 | UI 구식 |
| 니프티핸즈 | 간편한 사용법 | 고급 기능 부족 |
| **InviteHub** | **모든 장점 통합 + 앱 지원** | - |

---

## 📄 라이선스

MIT License © 2026 InviteHub
