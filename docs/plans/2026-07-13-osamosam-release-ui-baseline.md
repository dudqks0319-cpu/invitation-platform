# 오삼오삼 출시 UI 통합 베이스라인

- 기록일: 2026-07-13 KST
- 기준 브랜치: `codex/testflight-launch-crash-fix`
- 기준 커밋: `d44ce0d620f08b0af3ea41eccddc7ed03b9d72f1`
- 통합 브랜치: `codex/osamosam-release-ui-unification`
- 참고 브랜치: `origin/feat/osamosam-ui-v2`
- 참고 커밋: `8d629f7f8a497de02092d42b62bb7eb38ccd3e85`

## 기준 검증

- `npm test`: 64개 테스트 파일, 220개 테스트 통과
- `npm run lint`: 통과
- `npm --prefix apps/mobile run typecheck`: 통과
- `npm run typecheck`: 통과
  - 제한된 샌드박스에서는 Google Fonts DNS 조회가 실패했으며, 네트워크 허용 후 동일 명령이 통과했다.
- `scripts/release-harness-check.sh`: `ATTENTION`
  - 기준 커밋에 `release-ledger.yaml`과 `RELEASE_STATUS.md`가 없어 발생한 기존 기록 공백이다.
  - UI 통합 브랜치에서는 출시 및 네이티브 파일을 수정하지 않는다.

## 기준 화면

- `output/ui-baseline/2026-07-13/home-desktop.png`
- `output/ui-baseline/2026-07-13/home-mobile.png`
- `output/ui-baseline/2026-07-13/builder-mobile.png`
- `output/ui-baseline/2026-07-13/preview-mobile.png`
- `output/ui-baseline/2026-07-13/image-text-mobile.png`

## 보호 범위

다음 경로는 기준 커밋과 byte-identical 상태를 유지한다.

- `apps/mobile/**`
- iOS/Android 네이티브 설정
- TestFlight/App Store 출시 문서 및 스크립트
- API, 인증, Supabase, rate-limit, 공개 쓰기 계약
- 이미지 초대장 9:16 PNG 저장과 텍스트 배치 로직
