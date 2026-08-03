# 오삼오삼 iOS 릴리스 상태

Canonical status: [docs/current-release-state.md](docs/current-release-state.md)

- Local source identity: Release `com.invitehub.app` `1.0.3 (69)`, based on
  dirty HEAD `0538c5d`; candidate Git SHA remains `UNBOUND/PENDING`
- Device proof: separately signed `com.invitehub.app.dev` Build 69 was
  installed and launched on the cabled iPhone 12 Pro without replacing the
  store app
- Latest uploaded Store build: `1.0.3 (68)`; EAS build
  `47878231-5f1e-4a7f-b871-07adc9dfaa9e` finished
- 2026-08-04 read-only number check: authenticated EAS and ASC UI both show
  production Build 68 as the highest build and Build 69 count `0`
- EAS submission:
  `e9aee1a2-d44a-429f-81b1-e22428fcfcee` finished
- EAS artifact: 176,918,411 bytes; SHA-256
  `3ba0f27c4250be1ae794287b951508e0b82ea8efb76fd98d8cf7454619a86324`
- Embedded identity: `오삼오삼`, `com.invitehub.app`, `1.0.3 (68)`,
  non-exempt encryption false
- App Store Connect: Build 68 processed, TestFlight `제출 준비 완료`, assigned
  to internal group `Team (Expo)`, and currently selected for version 1.0.3
- Build 68 disposition: superseded after the user found that
  `초대장 만들기 과정 둘러보기` still opened the older event-selection UI
- Release mode: `수동으로 버전 출시` remains saved
- App Review: not submitted
- Public App Store: still `1.0.2`
- Dependency audit: online root audit 15 advisories (11 moderate, 4 high),
  mobile audit 12 (11 moderate, 1 high), and 0 critical. The mobile high is an
  indirect `brace-expansion` advisory in Expo/React Native build tooling.
- Current Build 69 source verification: 122/122 test files and 650/650 tests
  passed; focused identity/release contract 5/5 files and 32/32 tests passed;
  web/mobile lint and typecheck, packet 334 checks, and web production build
  passed. No native build/archive was run.

Do not press `심사에 추가` with Build 68. Build 69 is now bound only in the
production Release source; its candidate Git SHA is unbound and no EAS/ASC
Build 69 artifact exists. First produce one approved clean commit and raw source
evidence. A later separately approved build/upload must then replace Build 68
and pass exact TestFlight device smoke before App Review. Public release remains
manual.

## 2026-08-04 Build 69 source binding

- Xcode Release is exactly `com.invitehub.app` `1.0.3 (69)`.
- Xcode Debug remains `com.invitehub.app.dev` `1.0.3 (52)`; no dev or test
  target identity was promoted.
- `app.json` remains version `1.0.3`; production app config and EAS profile
  resolve the Store bundle `com.invitehub.app`, use local version allocation,
  disable auto-increment, and do not auto-submit.
- EAS and ASC read-only evidence both show highest production Build 68 and no
  Build 69. No build, archive, upload, submit, device, staging, or Production
  action was performed.
- Candidate SHA remains `UNBOUND/PENDING`, `selected_candidate.selected` is
  false, and raw candidate evidence/IPA/archive are absent. The release
  candidate preflight therefore remains intentionally blocked.

## 2026-08-03 release candidate identity gate

Native release build/install and EAS build/upload entrypoints now fail closed
before their side-effecting command unless `release-ledger.yaml` explicitly
selects one clean committed candidate and the ignored raw evidence file binds
the same version, build, Store bundle, full SHA, branch, native identity, and
artifact hash where applicable. EAS remote version allocation, auto-increment,
auto-submit, identity-affecting environment overrides, stale Build 52, dev
bundles, dirty source, and mismatched evidence are rejected.

The current ledger deliberately has `selected_candidate.selected: false` and
there is no raw candidate evidence. Therefore local release gate and EAS build
wrapper checks return `blocked` before lint/native/EAS commands. This is local
guard implementation evidence only; no candidate was approved, no native build
or install ran, and no EAS/App Store Connect state changed.

## 2026-08-03 22:09 INV-IOS-002 candidate preflight

- Verdict: **HOLD / BLOCKED-CANDIDATE**.
- Canonical worktree is still dirty (89 entries), the ledger SHA remains
  `working_tree_based_on_0538c5d4dfe56b7a3dd9aa41bbbee484f4a536e7`,
  `selected_candidate.selected` is `false`, and raw candidate evidence is
  absent.
- Live native Release identity is `com.invitehub.app` `1.0.3 (52)`, so it does
  not match ledger Build 69 and the explicitly blocked stale Build 52 cannot be
  built or installed.
- Installed prod `1.0.3 (68)` and dev `1.0.3 (69)` were read only. Neither is
  promoted: Build 68 is superseded and its local IPA is absent; Build 69 is a
  dev bundle with no exact artifact/SHA binding.
- No build, archive, install, overwrite, deletion, reset, launch, XCUITest, UI
  flow, login, Kakao send, account deletion, or external write ran.
- Final `InviteHub` and `OsamosamDeviceQA-Runner` process counts are both 0.
- Evidence: `output/real-device-qa/2026-08-03T2204KST-ios-inv-ios-002-candidate-preflight-blocked/summary.md`.

`실기기 점유 해제 완료`
