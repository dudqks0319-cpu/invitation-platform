# 오삼오삼 템플릿 탐색·미리보기 QA

- 날짜: 2026-07-23
- 대상: iOS 로컬 Debug 빌드, `iPhone 17 Pro / iOS 26.2`
- 번들 ID: `com.invitehub.app.dev`
- 범위: 템플릿 탐색, 이미지 실패 복구, 미리보기, 콘텐츠 인지형 문구 배치, 접근성
- 배포 상태: 로컬 시뮬레이터 검증만 완료. TestFlight·App Store·실기기 배포 검증은 포함하지 않음.

## 시각 결함 전후

| 증거 | 결과 |
| --- | --- |
| [00-before-overlap.png](./00-before-overlap.png) | 기존 홈 카드에서 인물·일러스트 위로 이름 문구가 겹치던 상태 |
| [01-home-centered-subject-split.jpg](./01-home-centered-subject-split.jpg) | 중앙 인물형: 짧은 문구는 위, 날짜는 아래로 분리 |
| [02-preview-centered-subject-bottom-copy.jpg](./02-preview-centered-subject-bottom-copy.jpg) | 중앙 인물형 실제 미리보기: 인물 아래 안전 영역에 행사 문구 배치 |
| [03-preview-middle-gap-copy.jpg](./03-preview-middle-gap-copy.jpg) | 위·아래 장식형: 비어 있는 중앙 영역에 전체 초대 문구 배치 |
| [09-finished-three-card-home.jpg](./09-finished-three-card-home.jpg) | 서로 다른 문구·인물·장소를 넣은 완성 초대장 3장을 메인 히어로에 직접 표시 |

`visual-verdict` 최종 판정은 96점, `pass`다. 판정 상태는
`.omx/state/osamosam-text-layout/ralph-progress.json`에 남겼다.

## 메인 완성 초대장 3종

| 디자인 | 행사 정보 | 배치 결과 |
| --- | --- | --- |
| `wedding-barunson-anime-09` | 이준서·김윤재, 2026-10-24 13:00, 라비에벨 가든홀 | 상단 제목과 하단 이름·일정·장소가 중앙 인물과 겹치지 않음 |
| `wedding-barunson-anime-04` | 박도윤·최서아, 2026-11-07 15:00, 더채플 앳 청담 | 상단 제목과 하단 세부 정보가 중앙 커플 영역을 피함 |
| `wedding-barunson-anime-10` | 김현우·윤하린, 2026-12-05 17:00, 서울 루프탑 웨딩홀 | 상단 제목과 하단 세부 정보가 중앙 인물·장식을 가리지 않음 |

세 이미지는 프로젝트 내부의 941×1672 PNG로 고정 번들되며, 런타임에는
동일 문구 오버레이를 중복 렌더링하지 않는다. 완성 이미지 로드가 실패하면
기존 빈 템플릿과 콘텐츠 인지형 문구 배치로 복구한다.

## 화면·접근성 매트릭스

| 항목 | 결과 | 증거 |
| --- | --- | --- |
| 375 / 393 / 430pt 카드 그리드 | 통과 | `template-discovery-layout.test.ts`에서 각 폭의 2열 너비·간격을 검증하고, iPhone 17 Pro 프로필에서 실제 렌더링 확인 |
| 동적 글자 약 200% 홈 | 통과 | [04-dynamic-type-200-home.jpg](./04-dynamic-type-200-home.jpg): 브랜드와 로그인 버튼을 세로로 전환해 겹침 제거 |
| 동적 글자 약 200% 검색·필터 | 통과 | [05-dynamic-type-200-search-filters.jpg](./05-dynamic-type-200-search-filters.jpg): 검색, 선택 상태, 결과 수가 잘리지 않고 의미를 유지 |
| 동적 글자 약 200% CTA | 통과 | [06-dynamic-type-200-cta.jpg](./06-dynamic-type-200-cta.jpg): 긴 행사 정보와 시작 CTA가 줄바꿈되며 조작 가능 |
| Reduce Motion | 통과 | 시뮬레이터 `ReduceMotionEnabled=1`; 정적 로딩 대체 분기 테스트 및 앱 재실행 성공 |
| 빠른 상하 스크롤 | 통과 | 0.15초 스와이프 3회 후에도 각 화면의 4개 카드가 시맨틱 트리에 존재했고 [07-fast-scroll-loaded-cards.jpg](./07-fast-scroll-loaded-cards.jpg)처럼 빈 카드가 지속되지 않음 |
| 검색 무결과·복구 | 통과 | [08-no-results-recovery.jpg](./08-no-results-recovery.jpg): 결과 0개, 적용 필터, 단일 `필터 초기화` 행동을 표시하고 탭 후 목록 복구 |
| VoiceOver 의미 순서 | 시뮬레이터 통과 | 런타임 접근성 트리에서 뒤로가기 → 제목·설명 → 최근 본 디자인 → 검색 → 행사 필터 → 형식 필터 → 결과 수 → 카드 → CTA 순서를 확인 |
| 이미지 1개 실패 | 자동 검증 통과 | 실패한 소스만 중립 대체 상태로 전환하고 다른 카드는 유지하는 `template-image-recovery.test.ts` 통과 |
| 가로 모드 | 제품 제약 확인 | `app.json`의 `orientation: "portrait"` 정책으로 회전 UI를 제공하지 않음. 이 작업에서는 릴리스 방향 정책을 변경하지 않음 |

## 수동 시나리오 결과

- 템플릿 미리보기만 열었을 때 초안은 생성되지 않는다.
- `이 디자인으로 시작하기`를 선택한 경우에만 멱등 보호된 초안 생성 경로가 실행된다.
- 최근 본 디자인은 최대 6개 ID만 저장하며, 손상·삭제된 ID는 다음 로드에서 정리된다.
- 손상된 로컬 초안은 사용자 동의 후 원본 백업에 성공한 경우에만 격리·초기화한다.
- 원격 카탈로그는 정확히 180개, `meta.count` 일치, 고유 ID, 번들 기준 ID 포함 조건을 모두 만족할 때만 최신 검증본으로 채택한다.

## 남은 릴리스 게이트

| 게이트 | 담당 | 기한 | 상태 |
| --- | --- | --- | --- |
| 실기기 VoiceOver 음성 녹화와 포커스 이동 확인 | 모바일 QA | 다음 TestFlight 후보 전 | 미실행 |
| 실기기 메모리·장시간 스크롤 프로파일링 | 모바일 QA | 다음 TestFlight 후보 전 | 미실행 |
| TestFlight 설치·실기기 실행·App Store 처리 확인 | 릴리스 담당 | 배포 승인 후 | 미실행 |

로컬 시뮬레이터 통과를 위 릴리스 게이트 완료로 간주하지 않는다.
