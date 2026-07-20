# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-21 09:00 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, TestFlight, App Store 심사, 실기기 검증을 서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-v103` |
| Branch | `agent/osamosam-appstore-v103` |
| Source commit | `8fcbfffce2d6d62af5c8b2846b0dc0c77fe1cf90` |
| Public App Store version | `1.0.2`, released 2026-06-29, bundle `com.invitehub.app`, App Store id `6763630299` |
| Local candidate | `1.0.3`; EAS reserved remote Build `60` during the local production build attempt |
| Display name | `오삼오삼` |
| Main visual | Center: `플로럴 세레모니 04`; sides: `웨딩 포토 컨셉 01`, `웨딩 포토 컨셉 02` |
| Local tests | `68/68` files, `241/241` tests passed; mobile lint and typecheck passed |
| Local release bundle | iOS export passed; all three `assets/home-hero/*.png` files are present in the bundle |
| Simulator result | iPhone 17 Pro, iOS 26.2, Release build succeeded and launched without a crash; screenshot `/tmp/osamosam-v103-home.png` |
| Security gate | No hardcoded secret pattern found; free-only/IAP-copy/store-metadata checks passed; npm critical advisory count is zero after lockfile update |
| Residual dependency risk | One high build-tool `brace-expansion` advisory and moderate Expo/Next transitive advisories remain; fixes require upstream or breaking changes and are not exposed as app runtime input surfaces |
| EAS iOS build id | Pending |
| EAS iOS build number | `60` reserved; signed IPA was not produced |
| EAS submission id | Pending |
| App Store Connect / TestFlight | No 1.0.3 upload. Local signing stopped because the stored provisioning profile does not include the current Apple Distribution certificate |
| Real-device result | Pending TestFlight install, launch, Apple/email login, template selection, and free-publish smoke test |
| App Store version selection | Pending; do not select or submit a build until real-device smoke passes |
| Public release state | Still `1.0.2`; no 1.0.3 review submission or public rollout yet |

## Current verdict

The `1.0.3` source candidate is locally verified and visually matches the requested
home hero. It is not yet a TestFlight or public App Store release. The cloud build
path was blocked because it uploads private source to Expo. The safer local build
reserved Build 60, but signing failed because the existing provisioning profile
does not include the current distribution certificate. Updating Apple/Expo signing
credentials requires explicit user approval before continuing.

## 1.0.3 release notes draft

- 오삼오삼 메인 화면을 플로럴 세레모니 04와 웨딩 포토 컨셉 이미지로 새롭게 구성했습니다.
- 결혼식, 돌잔치, 브라이덜샤워 등 초대장 디자인 탐색을 더 편하게 개선했습니다.
- 로그인 완료 흐름과 앱 실행 안정성을 개선했습니다.

## Remaining release gates

1. With explicit owner approval, refresh only the iOS provisioning profile so it
   includes the existing Apple Distribution certificate; do not revoke the
   certificate unless separately approved.
2. Re-run the local signed IPA build without uploading source to Expo.
3. Upload the signed IPA to App Store Connect/TestFlight.
4. On a real iPhone, uninstall the old app if stale data is suspected, install the
   exact TestFlight build, and verify launch, Apple/email login, main hero,
   template selection, builder preview, and free publish/share.
5. Create/select App Store version `1.0.3`, save Korean release notes and current
   screenshots, verify privacy/review contact, and select only the verified build.
6. Submit for App Review. Public availability remains pending Apple approval and
   the chosen release mode.

## Stop conditions

- Do not describe a simulator or EAS build as a public App Store release.
- Do not enable paid publishing or IAP in this free-only candidate.
- Do not submit a build that fails real-device login or launch evidence.
