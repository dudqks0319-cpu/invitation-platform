# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-21 08:45 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, TestFlight, App Store 심사, 실기기 검증을 서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-v103` |
| Branch | `agent/osamosam-appstore-v103` |
| Source commit | Pending candidate commit |
| Public App Store version | `1.0.2`, released 2026-06-29, bundle `com.invitehub.app`, App Store id `6763630299` |
| Local candidate | `1.0.3`; EAS remote build number is `59`, so production auto-increment is expected to create Build `60` |
| Display name | `오삼오삼` |
| Main visual | Center: `플로럴 세레모니 04`; sides: `웨딩 포토 컨셉 01`, `웨딩 포토 컨셉 02` |
| Local tests | `68/68` files, `241/241` tests passed; mobile lint and typecheck passed |
| Local release bundle | iOS export passed; all three `assets/home-hero/*.png` files are present in the bundle |
| Simulator result | iPhone 17 Pro, iOS 26.2, Release build succeeded and launched without a crash; screenshot `/tmp/osamosam-v103-home.png` |
| Security gate | No hardcoded secret pattern found; free-only/IAP-copy/store-metadata checks passed; npm critical advisory count is zero after lockfile update |
| Residual dependency risk | One high build-tool `brace-expansion` advisory and moderate Expo/Next transitive advisories remain; fixes require upstream or breaking changes and are not exposed as app runtime input surfaces |
| EAS iOS build id | Pending |
| EAS iOS build number | Pending; expected `60`, verify from EAS output |
| EAS submission id | Pending |
| App Store Connect / TestFlight | Pending new 1.0.3 upload and processing |
| Real-device result | Pending TestFlight install, launch, Apple/email login, template selection, and free-publish smoke test |
| App Store version selection | Pending; do not select or submit a build until real-device smoke passes |
| Public release state | Still `1.0.2`; no 1.0.3 review submission or public rollout yet |

## Current verdict

The `1.0.3` source candidate is locally verified and visually matches the requested
home hero. It is not yet a TestFlight or public App Store release. The next safe
step is to commit the candidate, create the EAS production build, upload it to
TestFlight, and verify the exact build number on a real iPhone.

## 1.0.3 release notes draft

- 오삼오삼 메인 화면을 플로럴 세레모니 04와 웨딩 포토 컨셉 이미지로 새롭게 구성했습니다.
- 결혼식, 돌잔치, 브라이덜샤워 등 초대장 디자인 탐색을 더 편하게 개선했습니다.
- 로그인 완료 흐름과 앱 실행 안정성을 개선했습니다.

## Remaining release gates

1. Commit the candidate and record the exact Git SHA.
2. Create EAS production iOS Build 60 (or the actual auto-incremented number).
3. Upload the processed build to App Store Connect/TestFlight.
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
