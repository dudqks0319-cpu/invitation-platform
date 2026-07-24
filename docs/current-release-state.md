# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-24 14:07 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, App Store Connect 처리, TestFlight, 실기기 검증, 앱 심사를
서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-submit-20260724` |
| Branch | `agent/osamosam-appstore-submit-20260724` |
| Release source commit | `a59380d5434f28c7173e77714d4942de2744fb9f` |
| Public App Store version | `1.0.2`; bundle `com.invitehub.app`; App Store id `6763630299` |
| Local candidate | `1.0.3`; source is newer than Build 64, so the next iOS build number must exceed `64` |
| Main visual | 완성된 웨딩 초대장 3종 합성 홈 이미지와 두 장 완성형 카드 목록 |
| Template copy | 카드의 흰색 문구 칩을 제거하고 실제 미리보기 예시의 이름·날짜·장소를 이미지 안전 여백에 직접 표시 |
| Template order | `wedding-barunson-anime-09`, `wedding-barunson-anime-04`, `wedding-barunson-anime-10`을 홈과 전체 목록 맨 앞에 고정 |
| Local tests | `99/99` files, `458/458` tests passed; root/mobile lint and typecheck passed |
| Runtime dependency gate | `npm audit --omit=dev --offline`: `0` vulnerabilities |
| Residual dev dependency risk | 전체 개발 도구 트리는 기존 검사 기준 18 advisories(critical 1 포함). 런타임 트리와 분리해 추적하며 App Review 전 소유자 위험 수용 또는 도구 체인 정리가 필요 |
| Simulator result | Release build/install/launch passed on iPhone 17 Pro, iOS 26.2; exactly one preview image, enlarged copy, transparent safe zones, and no subject overlap verified |
| Visual verdict | `96/100`, pass; one template only, enlarged readable copy, no white text chips, and no copy overlap with people/illustrations |
| Store screenshots | 6.3-inch set has 2 screenshots, both `1206x2622`: home fan composite first, real template copy second |
| EAS iOS build id | `1f103d1b-f328-4702-b3a1-5f4847a6afa4` |
| EAS iOS build number | `64` |
| EAS build state | `FINISHED`; exact commit `a95bca7`; completed 2026-07-24 10:43 KST |
| EAS submission id | `747d357c-d4b9-4302-8a32-a62c741a98f7`; App Store upload completed |
| Superseded builds | Builds 62, 63, and 64 must not be selected for review; Build 64 predates the final single-preview and enlarged-copy fix |
| App Store Connect version | iOS `1.0.3`, `제출 준비 중` |
| App Store metadata | Release notes and review notes saved for Build 64; automatic release mode unchanged |
| App Store build selection | No build selected; Builds 62, 63, and 64 remain excluded |
| TestFlight result | Build 64 is `제출 준비 완료` in the `Team (Expo)` internal group, but it is superseded by local source `a59380d` |
| Real-device result | Connected iPhone 12 Pro is paired and available but still has Build 63; the next exact-build smoke is pending |
| App Review state | Not submitted; `심사에 추가` and final submission remain gated |
| Public release state | Still `1.0.2`; no 1.0.3 public rollout |

## Current verdict

The final local source candidate is commit
`a59380d5434f28c7173e77714d4942de2744fb9f`. Its Release simulator build
succeeded, the single-template preview was exercised at runtime, and both top
and bottom copy are enlarged without white text panels or artwork overlap.

Build 64 finished on EAS, uploaded to App Store Connect, completed Apple
processing, and is `제출 준비 완료` in TestFlight. It does not contain the final
single-preview and enlarged-copy fix, so it is superseded and must not be
selected. A new build with a number greater than 64, exact-build physical-device
smoke, and user preview approval are required before App Review submission.

## 1.0.3 release notes

- 메인 화면에 완성된 웨딩 초대장 3종 합성 이미지를 적용했습니다.
- 최신 애니메이션 웨딩 템플릿 3종을 홈과 전체 목록 맨 앞에 배치했습니다.
- 템플릿 카드의 흰색 문구 배경을 제거하고 실제 이름, 날짜, 장소를 표시합니다.
- 디자인 미리보기에는 템플릿 한 장만 표시하고 이름, 일정, 장소 글자를 읽기 쉽게 확대했습니다.
- 이미지가 가운데 있으면 문구를 상·하단에, 가운데가 비어 있으면 중앙 여백에 배치합니다.

## Remaining release gates

1. Produce and upload a new iOS build greater than Build 64 from exact source `a59380d`.
2. Wait for App Store Connect processing and assign that exact build to the internal TestFlight group.
3. Install the exact new build on the connected iPhone 12 Pro.
4. Verify launch, login, latest-template ordering, one-template preview, enlarged text placement, and free publish/share.
5. Select only the exact verified new build. Do not select Builds 62, 63, or 64.
6. Add the version to App Review and submit only after the exact-build smoke and explicit user approval.

## Stop conditions

- Do not describe simulator, EAS, Apple processing, TestFlight, real-device, review, approval, or public release as the same state.
- Do not select Builds 62, 63, or 64.
- Do not submit a build that lacks exact-build physical-device launch and login evidence.
- Do not enable paid publishing or IAP in this free-only candidate.
