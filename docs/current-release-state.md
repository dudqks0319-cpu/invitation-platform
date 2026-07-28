# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-28 18:58 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, App Store Connect 처리, TestFlight, 실기기 검증, 앱 심사를
서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-submit-20260724` |
| Branch | `agent/osamosam-appstore-submit-20260724` |
| Release source commit | `0196fb4a337e1b894af93d3c9b1374d0cfd30783` |
| Public App Store version | `1.0.2`; bundle `com.invitehub.app`; App Store id `6763630299` |
| Local candidate | `1.0.3 (67)`; EAS Production build finished from exact commit `0196fb4` |
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
| EAS iOS build id | `616d9c95-7189-4a76-8751-9d8ed947c833` |
| EAS iOS build number | `67` |
| EAS build state | 2026-07-28 18:57 KST Build 67 `FINISHED`; `1.0.3 (67)`, exact commit `0196fb4`, build id와 원장 일치 |
| EAS submission state | Build 67은 아직 App Store Connect에 업로드하지 않음. 최신 완료 submission은 Build 66의 `90000462-1a28-424d-a496-bef9ad8d7f41` |
| Build 67 artifact | EAS IPA 176,900,384 bytes; SHA-256 `356de45d57c46bbf31f88a63cc743a193c5dd29490da310d3dce1409f8f0482e`; embedded Info.plist `오삼오삼`, `com.invitehub.app`, `1.0.3 (67)`, non-exempt encryption false |
| Free-only artifact check | EAS production env에 `EXPO_PUBLIC_ENABLE_PAID_PUBLISH`가 없어 default false. IPA Frameworks에는 `hermesvm.framework`만 있고 RevenueCat/Purchases framework 없음 |
| Failed build | Build 65 (`945fad1a-f595-4472-9500-8ecc713b3663`) produced no IPA because four curated PNGs were excluded from the EAS archive; fixed in `533aec3` |
| Superseded builds | Builds 62, 63, 64, and 66 must not be selected for review. Build 67 is the only current candidate |
| App Store Connect version | iOS `1.0.3` `제출 준비 중`. Build 66은 TestFlight `제출 준비 완료`; Build 67은 아직 업로드하지 않음 |
| App Store metadata | 릴리스 노트는 1.0.3 후보 내용을 포함하지만 심사 메모는 아직 Build 64로 표기. 자동 출시가 선택되어 있으므로 심사 제출 전 Build 67 기준 메모 수정과 출시 방식 재확인 필요 |
| App Store build selection | No build selected; Builds 62, 63, 64, and 66 remain excluded |
| TestFlight result | Chrome authenticated live 확인: Build 66 `제출 준비 완료`, 내부 `Team (Expo)` 그룹 1개·테스터 1명에 배정, 초대 1·설치 2 표시. 연결 iPhone에서 해당 TestFlight 설치 provenance는 아직 미확인 |
| Real-device result | 2026-07-28 18:26 KST 케이블 연결 iPhone 12 Pro(iOS 26.5.2)의 잠금 해제와 CoreDevice 연결을 확인. `com.invitehub.app` `1.0.3 (66)` 개발자 설치본을 실행한 뒤 실제 `InviteHub.app/InviteHub` 프로세스가 유지되는 증거 수집 통과. `builtByDeveloper=true`라 TestFlight 설치 증거는 아니며 EAS IPA와 동일 바이너리라는 증거도 아님 |
| Release-control tooling | App Store packet verifier 328 checks가 상태 문서·원장·IPA SHA/크기를 교차 확인. repo release gate는 script가 속한 active worktree를 readonly trust root로 사용하고 alternate root/canonical-evidence env override를 거부하며, online audit 또는 iOS build skip 시 false pass 대신 `blocked`/exit 2. current real-iPhone verifier는 connected physical device와 `1.0.3 (66)` 메타데이터 일치만 확인하며, stale capture, 수집·launch 실패, 실패 outcome, launch 후 빈 process를 fail-closed 처리 |
| App Review state | Not submitted; `심사에 추가` and final submission remain gated |
| Public release state | Still `1.0.2`; no 1.0.3 public rollout |
| Duplicate app cleanup | 이전 개발용 `InviteHub (76e945)` / `com.invitehub.app.dev` / Apple ID `6761149001`은 2026-07-28 계정에서 삭제됨. iPhone의 개발용 Build 52도 제거되어 운영용 `com.invitehub.app` Build 66만 남음 |
| Goal continuation state | 중복 개발용 앱 정리와 Build 67 생성 완료. 남은 차단은 Build 67 App Store Connect 업로드, TestFlight 설치·화면 smoke, online audit 명시 승인, App Review 전 Build 선택·심사 메모 갱신 |

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

Build 67 finished successfully on EAS and produced the current iOS IPA from
commit `0196fb4`. Direct archive inspection confirmed `오삼오삼`,
`com.invitehub.app`, version `1.0.3`, build `67`, non-exempt encryption false,
and only `hermesvm.framework`. Build 67 has not been submitted to App Store
Connect; Build 66 remains the latest uploaded TestFlight build.

Build 66 previously finished successfully on EAS and produced an iOS IPA. Before the
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
the build and submission as `FINISHED`, with no submission error. A
2026-07-28 18:18 KST authenticated Chrome check confirmed Build 66 as
`제출 준비 완료` in TestFlight and assigned to the internal `Team (Expo)` group
with one tester. App Store version 1.0.3 is still `제출 준비 중`; no build is
selected for App Review, and the review note still identifies Build 64.

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
distribution succeeded. On 2026-07-28 18:26 KST the phone was unlocked,
CoreDevice access recovered, and the metadata-matching developer app remained
running after launch. The evidence collector was corrected to match the
executable URL path instead of a nonexistent process `Name` field. Login,
template order, single-preview layout, free publish/share, relaunch, network
recovery, and deep-link scenarios on the exact TestFlight binary remain open.

## 1.0.3 release notes

- 메인 화면에 완성된 웨딩 초대장 3종 합성 이미지를 적용했습니다.
- 최신 애니메이션 웨딩 템플릿 3종을 홈과 전체 목록 맨 앞에 배치했습니다.
- 템플릿 카드의 흰색 문구 배경을 제거하고 실제 이름, 날짜, 장소를 표시합니다.
- 디자인 미리보기에는 템플릿 한 장만 표시하고 이름, 일정, 장소 글자를 읽기 쉽게 확대했습니다.
- 이미지가 가운데 있으면 문구를 상·하단에, 가운데가 비어 있으면 중앙 여백에 배치합니다.
- 앱 화면은 Pretendard로 통일하고 초대장 이름과 감성 문구에는 Gowun Batang을 적용했습니다.

## Remaining release gates

1. Submit Build 67 to App Store Connect only with explicit user approval.
2. Install/confirm Build 67 through TestFlight on the connected iPhone and preserve provenance evidence.
3. Verify launch, login, latest-template ordering, one-template preview, enlarged text placement, free publish/share, relaunch, network recovery, and deep link.
4. Run a fresh online dependency advisory lookup only after explicit authorization to send the dependency graph to the registry.
5. Before App Review, select only Build 67, update the review note from Build 64 to Build 67, and reconfirm the currently selected automatic release mode.
6. Add the version to App Review and submit only after the exact-build smoke and a separate explicit user approval.

## Stop conditions

- Do not describe simulator, EAS, Apple processing, TestFlight, real-device, review, approval, or public release as the same state.
- Do not select Builds 62, 63, or 64.
- Do not submit a build that lacks exact-build physical-device launch and login evidence.
- Do not enable paid publishing or IAP in this free-only candidate.
