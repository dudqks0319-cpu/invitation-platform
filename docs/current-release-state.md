# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-28 18:02 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, App Store Connect 처리, TestFlight, 실기기 검증, 앱 심사를
서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-submit-20260724` |
| Branch | `agent/osamosam-appstore-submit-20260724` |
| Release source commit | `533aec35178b185b4ab04a76e2c2819b83208056` |
| Public App Store version | `1.0.2`; bundle `com.invitehub.app`; App Store id `6763630299` |
| Local candidate | `1.0.3 (66)`; EAS Production build finished from exact commit `533aec3` |
| Main visual | 완성된 웨딩 초대장 3종 합성 홈 이미지와 두 장 완성형 카드 목록 |
| Template copy | 카드의 흰색 문구 칩을 제거하고 실제 미리보기 예시의 이름·날짜·장소를 이미지 안전 여백에 직접 표시; 둘러보기 제목은 `12/15pt`, 전체 미리보기는 제목 `16/21pt`·상세 `12/16pt`로 균형 조정 |
| Typography | 앱 UI·본문·버튼·날짜·장소는 번들 `Pretendard` 6종, 초대장 이름·감성 문구는 번들 `Gowun Batang` 2종으로 통일; 두 글꼴의 OFL 라이선스 포함 |
| Curated artwork | 집들이·베이비샤워·졸업·비즈니스 4종을 `941x1672` 번들 이미지로 교체하고 원격 카탈로그가 오래된 이미지를 반환해도 교정본을 우선 표시 |
| Template order | `wedding-barunson-anime-09`, `wedding-barunson-anime-04`, `wedding-barunson-anime-10`을 홈과 전체 목록 맨 앞에 고정 |
| Local tests | 2026-07-28 `105/105` files, `485/485` tests passed; root/mobile lint and typecheck passed |
| Runtime dependency gate | `npm audit --omit=dev --offline`: `0` vulnerabilities |
| Dependency audit | 2026-07-28 `npm audit --omit=dev --offline`와 `npm audit --offline` 모두 runtime/full tree 0 vulnerabilities. 그러나 offline 결과는 기존 기록 18 advisories(critical 1)를 닫지 않는다. fresh online registry audit는 dependency graph 외부 전송 승인이 없어 실행하지 않았으므로 이전 advisory를 open 유지 |
| Simulator result | Runtime-identical Release build/install/launch passed on iPhone 17 Pro, iOS 26.2; subsequent source change only normalized license-file trailing whitespace; Release 홈과 current-source dev-client의 디자인 목록·`플로럴 세레모니 04` 한 장 미리보기 상하단에서 새 글꼴, 이미지 로딩, 안전 여백, 중복 없음 확인 |
| Visual verdict | `94/100`, pass; Pretendard UI와 Gowun Batang 초대장 문구가 균형 있게 표시되며 흰 문구 칩, 글자 잘림, 이미지 겹침, 중복 템플릿 없음 |
| Local font QA evidence | 4 screenshots: Release home, loaded design browse, full-preview top, full-preview lower/date/location |
| Store screenshots | 6.3-inch set has 2 screenshots, both `1206x2622`: home fan composite first, real template copy second |
| EAS iOS build id | `b1a187d7-0776-4dd0-b648-9685edbb7760` |
| EAS iOS build number | `66` |
| EAS build state | 2026-07-28 live 재조회 `FINISHED`; `1.0.3 (66)`, exact commit `533aec3`, build id와 원장 일치 |
| EAS submission id | `90000462-1a28-424d-a496-bef9ad8d7f41`; live 재조회 `FINISHED`, error 없음 |
| Build 66 artifact | EAS IPA 176,900,378 bytes; SHA-256 `b065a732e3c51963bad999c9acd248c34ec1c5b7f43b816d643e588dcace4854`; embedded Info.plist `오삼오삼`, `com.invitehub.app`, `1.0.3 (66)`, non-exempt encryption false |
| Free-only artifact check | EAS production env에 `EXPO_PUBLIC_ENABLE_PAID_PUBLISH`가 없어 default false. IPA Frameworks에는 `hermesvm.framework`만 있고 RevenueCat/Purchases framework 없음 |
| Failed build | Build 65 (`945fad1a-f595-4472-9500-8ecc713b3663`) produced no IPA because four curated PNGs were excluded from the EAS archive; fixed in `533aec3` |
| Superseded builds | Builds 62, 63, and 64 must not be selected for review; Build 64 predates the final single-preview, curated-artwork, balanced-preview typography, and bundled Gowun Batang/Pretendard fixes |
| App Store Connect version | iOS `1.0.3`; Build 66 upload는 EAS에서 확인. API credential 부재와 Chrome/in-app browser 모두 signed-out 상태라 2026-07-28 Apple processing live 상태는 미확인 |
| App Store metadata | Release notes and review notes saved for Build 64; automatic release mode unchanged |
| App Store build selection | No build selected; Builds 62, 63, and 64 remain excluded |
| TestFlight result | 과거 Build 64 `제출 준비 완료` 기록은 superseded. Build 66의 현재 internal-group 배정은 ASC signed-out 상태라 미확인. 연결 iPhone에는 TestFlight 앱이 설치되어 있지 않음 |
| Real-device result | 케이블 연결 iPhone 12 Pro(iOS 26.5.2)에 `com.invitehub.app` `1.0.3 (66)` 설치 확인. `builtByDeveloper=true`라 TestFlight 설치 증거는 아님. EAS IPA와 동일 바이너리라는 증거도 아님. 마지막 launch는 기기 잠금으로 거절됨. 이후 세 번의 연속 목표 턴에서 lock-state 재조회가 모두 CoreDeviceService 초기화 timeout으로 실패해 현재 잠금 여부를 새로 확인하지 못했으며 smoke는 계속 미완 |
| Release-control tooling | App Store packet verifier 324 checks가 상태 문서·원장·IPA SHA/크기를 교차 확인. repo release gate는 script가 속한 active worktree를 readonly trust root로 사용하고 alternate root/canonical-evidence env override를 거부하며, online audit 또는 iOS build skip 시 false pass 대신 `blocked`/exit 2. current real-iPhone verifier는 connected physical device와 `1.0.3 (66)` 메타데이터 일치만 확인하며, stale capture, 수집·launch 실패, 실패 outcome, launch 후 빈 process를 fail-closed 처리 |
| App Review state | Not submitted; `심사에 추가` and final submission remain gated |
| Public release state | Still `1.0.2`; no 1.0.3 public rollout |
| Goal continuation state | `blocked_external_user_action_required`: 2026-07-28 18:02 KST에도 ASC credential 없음, in-app browser login 화면, CoreDeviceService timeout 반복. 로그인·기기 복구·online audit 승인 없이는 추가 안전 진행 불가 |

## Current verdict

The final EAS source candidate is commit
`533aec35178b185b4ab04a76e2c2819b83208056`. Its runtime UI source is the verified
font candidate plus an EAS archive inclusion fix. Its runtime-identical Release simulator build,
install, and launch succeeded. The Release home and current-source dev-client
design browser plus the `플로럴 세레모니 04` full preview were exercised.
Pretendard is used for app UI, body copy, dates, and locations; Gowun Batang is
used for invitation identity copy. The copy stays within transparent safe zones
without clipping or subject overlap, and only one template appears in the
preview.

Build 66 finished successfully on EAS and produced the iOS IPA. Before the
successful build, Build 65 failed during JavaScript bundling because four
curated PNG files were excluded from the EAS archive. The archive rules were
fixed, a regression test was added, all 150 static template asset references
were found in the reconstructed archive, and the Production iOS Metro export
passed with 1,445 modules and 204 assets.

Build 64 previously finished on EAS, uploaded to App Store Connect, completed
Apple processing, and is `제출 준비 완료` in TestFlight. It does not contain the final
single-preview, curated-artwork, balanced-preview typography, and bundled
Gowun Batang/Pretendard fixes, so it is superseded and must not be selected. A
Build 66 was uploaded successfully to App Store Connect under EAS submission
`90000462-1a28-424d-a496-bef9ad8d7f41`. A 2026-07-28 EAS live lookup reconfirmed
the build and submission as `FINISHED`, with no submission error. The current
Apple processing and internal TestFlight-group state could not be refreshed:
the repository has no App Store Connect API credential and both browser
sessions are signed out.

The same live EAS build record exposed the Build 66 IPA. Its SHA-256 is
`b065a732e3c51963bad999c9acd248c34ec1c5b7f43b816d643e588dcace4854`;
embedded metadata is `오삼오삼`, `com.invitehub.app`, version `1.0.3`, build
`66`, and non-exempt encryption false. The archive contains only
`hermesvm.framework` under the app Frameworks directory; RevenueCat/Purchases
frameworks are absent. The EAS production environment also has no
`EXPO_PUBLIC_ENABLE_PAID_PUBLISH`, so the source default remains false.

The cabled iPhone 12 Pro has an installed app whose metadata matches
`1.0.3 (66)`, superseding the older Build 63 device note. The device inventory
reports it as a developer app, and the TestFlight app is absent. It therefore
does not prove that the installed binary is the EAS IPA or that internal-group
distribution succeeded. The automated launch attempt was denied because the
phone was locked. Login, template order, single-preview layout, free
publish/share, relaunch, network recovery, and deep-link scenarios therefore
remain open.

## 1.0.3 release notes

- 메인 화면에 완성된 웨딩 초대장 3종 합성 이미지를 적용했습니다.
- 최신 애니메이션 웨딩 템플릿 3종을 홈과 전체 목록 맨 앞에 배치했습니다.
- 템플릿 카드의 흰색 문구 배경을 제거하고 실제 이름, 날짜, 장소를 표시합니다.
- 디자인 미리보기에는 템플릿 한 장만 표시하고 이름, 일정, 장소 글자를 읽기 쉽게 확대했습니다.
- 이미지가 가운데 있으면 문구를 상·하단에, 가운데가 비어 있으면 중앙 여백에 배치합니다.
- 앱 화면은 Pretendard로 통일하고 초대장 이름과 감성 문구에는 Gowun Batang을 적용했습니다.

## Remaining release gates

1. Unlock the connected iPhone 12 Pro, keep the cable attached, and rerun the metadata-matching developer build launch.
2. Sign in to App Store Connect or provide approved read-only API credentials, then refresh Build 66 processing and internal-group state.
3. If Build 66 is not in the internal group, assign it only after explicit approval; do not use Builds 62, 63, or 64.
4. Install/confirm Build 66 through TestFlight and preserve provenance evidence.
5. Install the EAS candidate through TestFlight, then verify launch, login, latest-template ordering, one-template preview, enlarged text placement, free publish/share, relaunch, network recovery, and deep link.
6. Run a fresh online dependency advisory lookup only after explicit authorization to send the dependency graph to the registry.
7. Add the version to App Review and submit only after the exact-build smoke and a separate explicit user approval.

## Stop conditions

- Do not describe simulator, EAS, Apple processing, TestFlight, real-device, review, approval, or public release as the same state.
- Do not select Builds 62, 63, or 64.
- Do not submit a build that lacks exact-build physical-device launch and login evidence.
- Do not enable paid publishing or IAP in this free-only candidate.
