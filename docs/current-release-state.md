# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-24 10:53 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, App Store Connect 처리, TestFlight, 실기기 검증, 앱 심사를
서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/private/tmp/osamosam-appstore-submit-20260724` |
| Branch | `agent/osamosam-appstore-submit-20260724` |
| Release source commit | `a95bca723632743f8135edbd7c7ffb6181c1cddc` |
| Public App Store version | `1.0.2`; bundle `com.invitehub.app`; App Store id `6763630299` |
| Local candidate | `1.0.3 (64)` |
| Main visual | 완성된 웨딩 초대장 3종 합성 홈 이미지와 두 장 완성형 카드 목록 |
| Template copy | 카드의 흰색 문구 칩을 제거하고 실제 미리보기 예시의 이름·날짜·장소를 이미지 안전 여백에 직접 표시 |
| Template order | `wedding-barunson-anime-09`, `wedding-barunson-anime-04`, `wedding-barunson-anime-10`을 홈과 전체 목록 맨 앞에 고정 |
| Local tests | `99/99` files, `457/457` tests passed; root/mobile lint and typecheck passed |
| Runtime dependency gate | `npm audit --omit=dev --offline`: `0` vulnerabilities |
| Residual dev dependency risk | 전체 개발 도구 트리는 기존 검사 기준 18 advisories(critical 1 포함). 런타임 트리와 분리해 추적하며 App Review 전 소유자 위험 수용 또는 도구 체인 정리가 필요 |
| Simulator result | Release build/install/launch passed on iPhone 17 Pro, iOS 26.2; latest-template cards and text-safe placement visually verified |
| Visual verdict | `96/100`, pass; no white text chips and no copy overlap with people/illustrations |
| Store screenshots | 6.3-inch set has 2 screenshots, both `1206x2622`: home fan composite first, real template copy second |
| EAS iOS build id | `1f103d1b-f328-4702-b3a1-5f4847a6afa4` |
| EAS iOS build number | `64` |
| EAS build state | `FINISHED`; exact commit `a95bca7`; completed 2026-07-24 10:43 KST |
| EAS submission id | `747d357c-d4b9-4302-8a32-a62c741a98f7`; App Store upload completed |
| Superseded builds | Build 62 and Build 63 must not be selected for review; both predate the final card-copy fix |
| App Store Connect version | iOS `1.0.3`, `제출 준비 중` |
| App Store metadata | Release notes and review notes saved for Build 64; automatic release mode unchanged |
| App Store build selection | Build 64 is available but not selected; Builds 62 and 63 remain excluded |
| TestFlight result | Build 64 is `제출 준비 완료` in the `Team (Expo)` internal group |
| Real-device result | Connected iPhone 12 Pro is paired and available but still has Build 63; Build 64 update and exact-build smoke are pending |
| App Review state | Not submitted; `심사에 추가` and final submission remain gated |
| Public release state | Still `1.0.2`; no 1.0.3 public rollout |

## Current verdict

The final source candidate is Build 64 from commit
`a95bca723632743f8135edbd7c7ffb6181c1cddc`. The Release simulator build
succeeded, the corrected card UI was exercised at runtime, and the two 6.3-inch
App Store screenshots are saved in App Store Connect. Build 64 finished on EAS,
uploaded to App Store Connect, completed Apple processing, and is `제출 준비 완료`
in TestFlight. This is still not an exact Build 64 physical-device result or an
App Review submission.

Builds 62 and 63 are superseded and must remain unselected. Build 64 review notes
and release notes are saved, but build selection and App Review submission must
wait for the connected iPhone 12 Pro to update from Build 63 to Build 64 and pass
the exact-build smoke.

## 1.0.3 release notes

- 메인 화면에 완성된 웨딩 초대장 3종 합성 이미지를 적용했습니다.
- 최신 애니메이션 웨딩 템플릿 3종을 홈과 전체 목록 맨 앞에 배치했습니다.
- 템플릿 카드의 흰색 문구 배경을 제거하고 실제 이름, 날짜, 장소를 표시합니다.
- 이미지가 가운데 있으면 문구를 상·하단에, 가운데가 비어 있으면 중앙 여백에 배치합니다.

## Remaining release gates

1. Update the connected iPhone 12 Pro from TestFlight Build 63 to exact Build 64.
2. Verify launch, login, latest-template ordering, preview text placement, and free publish/share on Build 64.
3. Select Build 64 only. Do not select Builds 62 or 63.
4. Add the version to App Review and submit only after the exact-build real-device smoke passes.

## Stop conditions

- Do not describe simulator, EAS, Apple processing, TestFlight, real-device, review, approval, or public release as the same state.
- Do not select Builds 62 or 63.
- Do not submit a build that lacks exact-build physical-device launch and login evidence.
- Do not enable paid publishing or IAP in this free-only candidate.
