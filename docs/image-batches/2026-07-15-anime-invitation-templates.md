# 2026-07-15 애니 일러스트 초대장 이미지 배치

## 공통 제작 규칙

- 용도: 오삼오삼 모바일 초대장 템플릿 배경
- 크기: 기존 템플릿과 동일한 941 × 1672px, 최종 PNG
- 비율: 세로 9:16
- 톤: 밝은 아이보리·민트·살구·라일락 바탕, 작은 손그림 애니메이션 모티프
- 안전영역: 이름·날짜·장소 문구를 얹을 화면의 65~75%를 단순하고 밝게 유지
- 제외: 실제 인물, 사람 얼굴, 사진풍 인물, 문자, 숫자, 로고, 워터마크, QR 코드
- 참고 방식: 사용자 제공 화면에서 반복되는 세로 카드·작은 하단 일러스트·넓은 여백·얇은 식물 선화를 참고하되 특정 브랜드 문구, 상품 도안, 캐릭터는 복제하지 않음

## 매니페스트

| 자산 ID | 화면/행사 | 목적지 | 프롬프트 핵심 | 코드 참조 |
| --- | --- | --- | --- | --- |
| `wedding-19` | 템플릿/결혼식 | `public/images/custom/barunson-category-anime-2026/wedding-19.png` | 크림 카드의 민트 식물 선화, 작은 꽃다발 | `wedding-barunson-anime-19` |
| `wedding-20` | 템플릿/결혼식 | `public/images/custom/barunson-category-anime-2026/wedding-20.png` | 한복을 입은 작은 애니 커플과 전통 장식 | `wedding-barunson-anime-20` |
| `wedding-21` | 템플릿/결혼식 | `public/images/custom/barunson-category-anime-2026/wedding-21.png` | 튤립 사이 작은 애니 커플, 살구색 여백 | `wedding-barunson-anime-21` |
| `wedding-22` | 템플릿/결혼식 | `public/images/custom/barunson-category-anime-2026/wedding-22.png` | 얇은 그린·베리 식물 리스와 넓은 흰 여백 | `wedding-barunson-anime-22` |
| `wedding-23` | 템플릿/결혼식 | `public/images/custom/barunson-category-anime-2026/wedding-23.png` | 노란 들꽃 사이 작은 애니 커플 | `wedding-barunson-anime-23` |
| `wedding-24` | 템플릿/결혼식 | `public/images/custom/barunson-category-anime-2026/wedding-24.png` | 연한 블루 백합 선화 코너, 미니멀 카드 | `wedding-barunson-anime-24` |
| `dol-14` | 템플릿/첫돌 | `public/images/custom/barunson-category-anime-2026/dol-14.png` | 구름 위 토끼 인형, 리본과 별, 크림 파스텔 | `dol-barunson-anime-14` |
| `dol-15` | 템플릿/첫돌 | `public/images/custom/barunson-category-anime-2026/dol-15.png` | 한복 입은 귀여운 민화 호랑이, 보자기와 꽃 | `dol-barunson-anime-15` |
| `housewarming-09` | 템플릿/집들이 | `public/images/custom/barunson-category-anime-2026/housewarming-09.png` | 작은 집과 화분의 한 줄 일러스트 | `housewarming-barunson-anime-09` |
| `birthday-04` | 템플릿/생일 | `public/images/custom/barunson-category-anime-2026/birthday-04.png` | 케이크를 든 작은 곰 낙서와 별 | `birthday-barunson-anime-04` |
| `baby-04` | 템플릿/베이비샤워 | `public/images/custom/barunson-category-anime-2026/baby-04.png` | 작은 달·구름·곰 인형 모빌 | `baby-barunson-anime-04` |
| `hwangap-07` | 템플릿/환갑 | `public/images/custom/barunson-category-anime-2026/hwangap-07.png` | 아래쪽 학 두 마리와 모란의 현대 민화 | `hwangap-barunson-anime-07` |

## 연결 범위

- `lib/templates.ts`: 12개 템플릿 등록, 최신 바른손형 우선 정렬
- `app/page.tsx`: 새 애니 일러스트 중 결혼식 6개를 홈 추천 영역에 노출
- `lib/templates.test.ts`: 새 템플릿 ID, 로컬 PNG 존재 여부, 텍스트 없는 편집 캔버스 계약 검증

## 보안 게이트 (2026-07-16)

- 비밀정보: 통과. 토큰, 키, 사용자 정보, 민감 로그를 코드나 이미지에 포함하지 않았다.
- 외부 도구: `god-tibo-imagen`은 로컬 Codex 인증 파일과 비공개 API에 의존하므로 설치하거나 실행하지 않았다. 인증 파일도 읽지 않았다.
- 저작권·개인정보: 통과. 참고 화면의 여백·세로 구도·모티프 크기만 참고해 원본 이미지를 생성했고 브랜드 문구, 로고, 상품 도안, 실제 인물 사진을 포함하지 않았다.
- 인증·인가·입력 검증: 변경 없음. 템플릿 데이터와 정적 PNG만 추가했다.
- 의존성: 변경 없음. `package.json`과 lockfile에 새 패키지를 추가하지 않았다.
- 테스트: lint 통과, typecheck 통과, 전체 테스트 65개 파일·228개 테스트 통과.
- 잔여 위험: 인앱 브라우저의 로컬 URL 보안 정책으로 자동 시각 QA가 차단되었다. UI 담당자가 배포 전 `http://127.0.0.1:3102/`에서 홈과 각 템플릿 미리보기를 확인한다.

Security Owner: Orchestrator

Date: 2026-07-16

Residual Risks: 기존 출시 UI 보안 게이트의 의존성·실기기 검증 위험은 이번 정적 이미지 변경과 무관하게 유지
