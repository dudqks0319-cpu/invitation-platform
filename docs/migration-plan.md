# 마이그레이션 계획

## 목적
현재 웹 기반 InviteHub 코드를 새 monorepo 구조와 `InvitationPayload v2`로 점진 전환한다.

## 1. 마이그레이션 원칙
- 공개 웹 동작을 깨지 않는다.
- 기존 slug URL을 유지한다.
- v1과 v2를 짧은 기간 공존시킨 뒤 shared 모델로 정리한다.

## 2. 대상
1. 기존 payload
2. 기존 HTML 템플릿
3. 기존 web builder

## 3. Payload 전환
할 일:
- 기존 payload 구조 파악
- `migrateV1toV2()` 작성
- 기본값과 빈 값 처리 규칙 고정
- base64 이미지 참조는 신규 업로드 경로로 이전

완료 기준:
- 기존 초대장 데이터가 v2로 읽힌다
- 신규 앱은 v2만 생성한다

## 4. 템플릿 전환
할 일:
- 기존 HTML string 템플릿 ID 목록 정리
- 각 템플릿을 `TemplateConfig` JSON으로 매핑
- v1.0은 3~5개만 앱에서 활성화
- 나머지는 매핑만 해두고 후속 릴리스에서 활성화

완료 기준:
- 앱 템플릿 렌더러가 최소 3개 템플릿을 정확히 표현한다
- 기존 웹 템플릿은 계속 노출된다

## 5. Builder 전략
결정:
- 웹 빌더는 유지
- 모바일 빌더는 별도로 구현
- 두 빌더는 같은 shared payload를 저장

이유:
- 앱 설치 없이도 제작이 가능하다
- 웹에서 작성하던 기존 사용자 흐름을 보존한다

## 6. 리스크
| 리스크 | 대응 |
| --- | --- |
| v1/v2 필드 불일치 | migration test 작성 |
| 템플릿 표현 차이 | 앱은 대표 템플릿만 먼저 검증 |
| base64 이미지 잔존 | 점진 업로드 이전 스크립트 |

## 7. 산출물
- `packages/shared/src/types/invitation.ts`
- `packages/shared/src/templates/migration.ts`
- payload migration test
- template mapping test
