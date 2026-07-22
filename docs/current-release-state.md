# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-07-22 11:24 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, TestFlight, App Store 심사, 실기기 검증을 서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-appstore-v103` |
| Branch | `agent/osamosam-appstore-v103` |
| Source commit | `b7753375bd60632abb957ace82bf51ecc66d8787` |
| Public App Store version | `1.0.2`, released 2026-06-29, bundle `com.invitehub.app`, App Store id `6763630299` |
| Local candidate | `1.0.3 (60)`; signed local IPA produced and uploaded to TestFlight |
| Display name | `오삼오삼` |
| Main visual | Center: `플로럴 세레모니 04`; sides: `웨딩 포토 컨셉 01`, `웨딩 포토 컨셉 02` |
| Local tests | `68/68` files, `241/241` tests passed; mobile lint and typecheck passed |
| Local release bundle | `/tmp/osamosam-v103-build60.ipa`; 48,466,272 bytes; SHA-256 `cd855d19d77d5feb9b3cbfd116343fb7651fcf3bc0d7bb339fc3bafc3692e383` |
| Simulator result | iPhone 17 Pro, iOS 26.2, Release build succeeded and launched without a crash; screenshot `/tmp/osamosam-v103-home.png` |
| Security gate | No repository credential files created; every temporary P12 was securely deleted and temporary keychains were destroyed; free-only/IAP-copy/store-metadata checks passed |
| Residual dependency risk | Clean EAS install: 18 advisories (1 low, 12 moderate, 4 high, 1 critical). Expo Doctor: 15/19 checks passed, with duplicate/config/native-sync issues and 12 SDK package-version mismatches. Resolve or risk-accept before App Review |
| EAS iOS build id | Not applicable: source-private local build; no EAS cloud build was created |
| EAS iOS build number | `60` |
| EAS submission id | `2ff4d83a-7c55-4476-85c0-0c639eba587a` |
| App Store Connect / TestFlight | IPA upload accepted on 2026-07-22; Apple processing is pending |
| Real-device result | Pending TestFlight install, launch, Apple/email login, template selection, and free-publish smoke test |
| App Store version selection | Pending; do not select or submit a build until real-device smoke passes |
| Public release state | Still `1.0.2`; no 1.0.3 review submission or public rollout yet |

## Current verdict

The source-private local Build 60 succeeded without an EAS cloud build. The root
cause was Xcode 26.3 resolving EAS/Fastlane's generic `iPhone Distribution` archive
identity and automatic export selector to `Apple Distribution`, while the profile's
matching certificate uses the legacy common name `iPhone Distribution`. Both the
archive `CODE_SIGN_IDENTITY` and export `signingCertificate` were therefore pinned
to the profile certificate SHA-1 `C54290CF0E787B62F68BD1D5DB8701604CC78EB9`.
Fastlane 2.232.1 also required the compatible export method name `app-store`
instead of Xcode's newer `app-store-connect`. Archive and IPA export then succeeded.

The resulting IPA contains bundle `com.invitehub.app`, version `1.0.3`, build
`60`, display name `오삼오삼`, and a distribution profile with
`get-task-allow=false`. The embedded profile app ID and certificate SHA-1 match the
build settings. The packaged `wedding-04.png`, `wedding-09.png`, and
`wedding-10.png` hashes exactly match their source assets. Apple accepted the
binary upload through EAS Submit; Apple processing remains pending, so this is not
yet a TestFlight-install or public-release result. Every preserved-build P12 was
securely deleted, temporary keychains were destroyed, and no credentials were
written to the repository.

## 1.0.3 release notes draft

- 오삼오삼 메인 화면을 플로럴 세레모니 04와 웨딩 포토 컨셉 이미지로 새롭게 구성했습니다.
- 결혼식, 돌잔치, 브라이덜샤워 등 초대장 디자인 탐색을 더 편하게 개선했습니다.
- 로그인 완료 흐름과 앱 실행 안정성을 개선했습니다.

## Remaining release gates

1. Wait for Apple to finish processing Build 60 and confirm it appears in TestFlight.
2. Identify the full-tree critical dependency advisory and resolve or explicitly
   risk-accept the 18 advisories and four Expo Doctor failures before App Review.
3. On a real iPhone, uninstall the old app if stale data is suspected, install the
   exact TestFlight build, and verify launch, Apple/email login, main hero,
   template selection, builder preview, and free publish/share.
4. Create/select App Store version `1.0.3`, save Korean release notes and current
   screenshots, verify privacy/review contact, and select only the verified build.
5. Submit for App Review. Public availability remains pending Apple approval and
   the chosen release mode.

## Stop conditions

- Do not describe a simulator or EAS build as a public App Store release.
- Do not enable paid publishing or IAP in this free-only candidate.
- Do not submit a build that fails real-device login or launch evidence.
