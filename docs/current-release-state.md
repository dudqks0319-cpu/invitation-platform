# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-22 13:56 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, TestFlight, App Store 심사, 실기기 검증을 서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-v103` |
| Branch | `agent/osamosam-appstore-v103` |
| Source commit | `1ee33a4b477bcee4d550076be3dadea165ea76e6` |
| Public App Store version | `1.0.2`, released 2026-06-29, bundle `com.invitehub.app`, App Store id `6763630299` |
| Local candidate | `1.0.3 (61)`; signed local IPA produced and uploaded to TestFlight |
| Display name | `오삼오삼` |
| Main visual | Center card uses realistic names, date, and venue in the image whitespace; visible template-name labels removed. New animated templates are ordered first |
| Local tests | `69/69` files, `249/249` tests passed; mobile lint, typecheck, Expo iOS export, and release simulator build passed |
| Local release bundle | `/tmp/osamosam-v103-build61.ipa`; 149,394,623 bytes; SHA-256 `9e961c3e9952724a5ace770d7c08efe628deba9a83075e6a132388e750df40a2` |
| Simulator result | iPhone 17 Pro, iOS 26.2, Release build launched without a crash; hero screenshot `/tmp/osamosam-build61-home-final.png`, wedding carousel screenshot `/tmp/osamosam-build61-home-wedding-final.png` |
| Security gate | Codex Security source diff scan: `12/12` files covered, `0` findings; no repository credentials; temporary P12/keychains/workspaces deleted; 60/60 new IPA assets hash-matched |
| Residual dependency risk | Clean EAS install: 18 advisories (1 low, 12 moderate, 4 high, 1 critical). Expo Doctor: 15/19 checks passed, with duplicate/config/native-sync issues and 12 SDK package-version mismatches. Resolve or risk-accept before App Review |
| EAS iOS build id | Not applicable: source-private local build; no EAS cloud build was created |
| EAS iOS build number | `61` |
| EAS submission id | `6f876ba8-be5e-4d52-bdf5-b7440d69bc5d` |
| App Store Connect / TestFlight | Build 61 upload accepted at 13:55 KST on 2026-07-22; Apple processing is pending |
| Real-device result | Pending exact Build 61 TestFlight install, launch, Apple/email login, new-template selection, and free-publish smoke test |
| App Store version selection | Pending; do not select or submit a build until real-device smoke passes |
| Public release state | Still `1.0.2`; no 1.0.3 review submission or public rollout yet |

## Current verdict

The source-private local Build 61 succeeded without an EAS cloud build. The root
cause was Xcode 26.3 resolving EAS/Fastlane's generic `iPhone Distribution` archive
identity and automatic export selector to `Apple Distribution`, while the profile's
matching certificate uses the legacy common name `iPhone Distribution`. Both the
archive `CODE_SIGN_IDENTITY` and export `signingCertificate` were therefore pinned
to the profile certificate SHA-1 `C54290CF0E787B62F68BD1D5DB8701604CC78EB9`.
Fastlane 2.232.1 also required the compatible export method name `app-store`
instead of Xcode's newer `app-store-connect`. Archive and IPA export then succeeded.

The resulting IPA contains bundle `com.invitehub.app`, version `1.0.3`, build
`61`, display name `오삼오삼`, and a distribution profile with
`get-task-allow=false`. The embedded profile app ID and certificate SHA-1 match the
build settings. All 60 newly added animated-template PNG hashes exactly match
files inside the IPA. Apple accepted submission
`6f876ba8-be5e-4d52-bdf5-b7440d69bc5d`; Apple processing remains pending, so
this is not yet a TestFlight-install or public-release result. Every preserved-build P12 was
securely deleted, temporary keychains were destroyed, and no credentials were
written to the repository.

## 1.0.3 release notes draft

- 메인 화면의 웨딩 이미지에 실제 이름, 날짜, 장소를 배치해 청첩장 느낌을 강화했습니다.
- 결혼식, 돌잔치, 생일, 아기, 집들이, 환갑 카테고리에 새 애니메이션 템플릿 60개를 추가하고 앞쪽에 배치했습니다.
- 미리보기 문구를 이미지 여백에 배치해 주요 그림과 겹치지 않도록 개선했습니다.
- 로그인 완료 흐름과 앱 실행 안정성을 개선했습니다.

## Remaining release gates

1. Sign in to App Store Connect in Chrome if the session has expired, then confirm Apple finished processing Build 61 and it appears in TestFlight.
2. Identify the full-tree critical dependency advisory and resolve or explicitly
   risk-accept the 18 advisories and four Expo Doctor failures before App Review.
3. On a real iPhone, uninstall the old app if stale data is suspected, install
   exact TestFlight Build 61, and verify launch, Apple/email login, main hero,
   all six new-template categories, builder preview, and free publish/share.
4. Create/select App Store version `1.0.3`, save Korean release notes and current
   screenshots, verify privacy/review contact, and select only the verified build.
5. Submit for App Review. Public availability remains pending Apple approval and
   the chosen release mode.

## Stop conditions

- Do not describe a simulator or EAS build as a public App Store release.
- Do not enable paid publishing or IAP in this free-only candidate.
- Do not submit a build that fails real-device login or launch evidence.
