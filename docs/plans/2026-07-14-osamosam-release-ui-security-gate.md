# 오삼오삼 출시 UI 통합 보안 게이트

- 점검일: 2026-07-14
- 작업 브랜치: `codex/osamosam-release-ui-unification`
- 기준 브랜치: `codex/testflight-launch-crash-fix`
- 판정: UI 변경 범위 통과, 전체 출시 게이트는 주의 필요

## 변경 범위 점검

- 웹 홈, 템플릿 탐색, 빌더, 공개 초대장 UI와 관련 테스트만 변경했다.
- iOS/Android 네이티브 설정, 모바일 앱 소스, API, Supabase, 인증, 배포 및 출시 설정은 기준 브랜치와 동일하다.
- 일반 merge 또는 cherry-pick 없이 참고 브랜치의 시각 언어와 문구만 수동 적용했다.

## 필수 보안 점검

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 비밀정보 | 통과 | 변경 파일에 토큰, 키, 비밀번호, 민감 로그가 없다. |
| 인증·인가 | 통과(변경 없음) | 공개 초대장 조회와 작성 API의 기존 인증·공개 상태 검사를 변경하지 않았다. |
| 입력·출력 | 통과(변경 없음) | API의 Zod/JSON 검증, honeypot, 출력 이스케이프 경계를 유지했다. `dangerouslySetInnerHTML`을 추가하지 않았다. |
| 의존성 | 주의 | 새 의존성이나 lockfile 변경은 없다. 기존 `npm audit --omit=dev` 결과에 17건(critical 1, high 1, moderate 14, low 1)이 남아 있다. |
| 개인정보 | 통과(변경 없음) | 공개 조회 최소화, DB 오류 메시지 비노출, 방명록 승인 필터를 유지했다. |
| 남용 방지 | 통과(변경 없음) | RSVP/방명록의 fail-closed 영속 rate limit과 honeypot을 유지했다. |
| 부정 경로 테스트 | 통과 | 보안 관련 8개 테스트 파일, 34개 테스트가 통과했다. |

## 잔여 위험과 담당

| 위험 | 담당 | 기한 |
| --- | --- | --- |
| 기존 의존성 취약점 17건을 영향도별로 정리하고 안전한 업데이트 계획 수립 | 보안/플랫폼 담당 | 다음 출시 후보 생성 전 |
| `release-ledger.yaml`, `RELEASE_STATUS.md` 부재 및 App Store 패킷 검증 실패 정리 | 출시 담당 | 다음 TestFlight 업로드 전 |
| iOS `Podfile.lock`과 현재 Expo 모듈 해석 차이 정리, Android 서명용 keystore를 안전한 CI 비밀 저장소에서 주입 | 모바일/출시 담당 | 다음 네이티브 Release 빌드 전 |
| 모바일 기존 lint 오류 3건 정리 | 모바일 담당 | 다음 TestFlight 후보 브랜치 전 |
| chunked 요청의 총 바이트 상한, 게스트 공개 메모리 fallback, RSVP 이름+전화 덮어쓰기 정책 검토 | 백엔드 담당 | 공개 출시 전 |
| IP+UA 방문자 키의 무염 SHA-256 처리 재검토 | 개인정보/백엔드 담당 | 공개 출시 전 |
| TestFlight 최신 빌드 번호 확인 후 실기기 삭제·재설치 및 콜드 스타트 증거 수집 | QA/출시 담당 | 출시 승인 전 |

## 서명

- Security Owner: Orchestrator
- Date: 2026-07-14
- Residual Risks: 위 표 참조
