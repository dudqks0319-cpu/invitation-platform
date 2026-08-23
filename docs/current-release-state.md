# 오삼오삼 iOS 현재 릴리스 상태

Last updated: 2026-08-09 KST

이 문서는 iOS App Store 릴리스의 단일 현재 상태 원장이다. 로컬 코드,
EAS 빌드, App Store Connect 처리, TestFlight, 실기기 검증, 앱 심사를
서로 다른 증거로 기록한다.

| Field | Current State |
| --- | --- |
| Release workspace | `/Users/jyb-m3max/Desktop/codex/invitation-platform/.worktrees/osamosam-build69-corrected` |
| Branch | `agent/osamosam-build69-corrected` |
| Candidate source Git SHA | `856e7227d92a2ac7ddf5bc6a49726721d17685dd`; corrected 81-path Build 69 commit |
| Evidence HEAD | Direct child of the source commit; limited to eight ledger/provenance controls and bound by ignored raw evidence |
| Public App Store version | `1.0.2`; bundle `com.invitehub.app`; App Store id `6763630299` |
| Local source identity | Xcode Release `com.invitehub.app` `1.0.3 (69)`; Xcode Debug remains `com.invitehub.app.dev` `1.0.3 (52)` |
| Main visual | 완성된 웨딩 초대장 선택 화면, 최신 애니메이션 웨딩 템플릿, 화면 비율에 맞춘 템플릿 미리보기 |
| Local checks | Current working tree PASS: 122/122 test files and 654/654 tests; root lint and typecheck passed; CocoaPods deployment install passed twice and the fmt hook was idempotent; Apple clang 21 iOS Simulator syntax probe passed |
| Uncommitted local follow-up | System-font fallback, category-tab accessibility/contrast, and a fail-closed Xcode 26.4+ compatibility hook for pinned fmt 11.0.2 are locally verified but are not yet a clean source/evidence candidate |
| Dependency audit | 2026-07-29 online root audit: 15 advisories (11 moderate, 4 high, 0 critical). Mobile: 12 (11 moderate, 1 high, 0 critical). Mobile high is indirect `brace-expansion` in Expo/React Native build tooling |
| EAS iOS build id | `47878231-5f1e-4a7f-b871-07adc9dfaa9e` |
| EAS iOS build number | `68` |
| EAS build state | `FINISHED`; version `1.0.3`, build `68`, production bundle `com.invitehub.app` |
| Next-build allocation | 2026-08-04 read-only EAS and ASC UI: highest production build `68`, Build `69` count `0`; source number 69 is reserved locally but not uploaded |
| EAS submission id | `e9aee1a2-d44a-429f-81b1-e22428fcfcee` |
| EAS submission state | `FINISHED`; uploaded successfully to App Store Connect |
| Build 68 artifact | EAS IPA 176,918,411 bytes; SHA-256 `3ba0f27c4250be1ae794287b951508e0b82ea8efb76fd98d8cf7454619a86324`; embedded Info.plist `오삼오삼`, `com.invitehub.app`, `1.0.3 (68)`, non-exempt encryption false |
| Free-only artifact check | IPA Frameworks contains `hermesvm.framework`; RevenueCat/Purchases frameworks are absent and paid publish remains disabled by default |
| Superseded builds | Builds 62, 63, 64, 66, 67, and 68 must not be submitted for review |
| App Store Connect version | iOS `1.0.3` remains `제출 준비 중` until added to App Review |
| TestFlight result | 2026-07-29 authenticated Chrome live check: Build 68 upload `완료`, TestFlight `제출 준비 완료`, internal `Team (Expo)` group assigned, one tester, zero installs shown at check time |
| App Store metadata | Six iPhone screenshots and version metadata present. Review note updated from Build 64 to Build 68 |
| App Store build selection | Build 68 is still selected but is now blocked/superseded and must be replaced with the verified Store Build 69 |
| Release mode | `수동으로 버전 출시` selected and saved; App Review approval will not publish automatically |
| Real-device result | Cabled iPhone 12 Pro (iOS 26.5.2): production bundle `com.invitehub.app` reports `1.0.3 (68)`; separate development bundle `com.invitehub.app.dev` reports `1.0.3 (69)` and launched successfully without replacing the store app |
| Local visual result | Release simulator confirmed the home screen and process screen use the same heading, copy, four event cards, images, and styling; the next screen correctly opens `청첩장 디자인` |
| App Review state | Not submitted; `심사에 추가` is blocked until Store/TestFlight Build 69 replaces Build 68 and passes exact-build device smoke |
| Public release state | Still `1.0.2`; no 1.0.3 public rollout |

## Current verdict

Build 68 is uploaded and processed, but it is no longer a valid review
candidate. The source now routes both home and process entry through one shared
component, and production Release identity is bound locally to
`com.invitehub.app` `1.0.3 (69)`. The separately installed development app is
still `com.invitehub.app.dev` `1.0.3 (69)` and is not production provenance.

This is not yet a Store/TestFlight Build 69 or an App Review submission. The
corrected 81-path source is committed and selected at
`856e7227d92a2ac7ddf5bc6a49726721d17685dd`; a direct evidence commit and
ignored raw packet bind provenance without changing production source. EAS/ASC
Build 69 upload count remains zero. App Review remains gated until production
Build 69 is generated and uploaded under separate approval, Build 68 is
replaced, and exact TestFlight Build 69 smoke checks pass.

The 2026-08-09 follow-up working tree is not promoted as that Store candidate.
Its web and CocoaPods checks pass locally, while `xcodebuild` itself currently
stalls in the Xcode build service's compiler-macro discovery step before source
compilation. The same Apple clang 21 probe succeeds when invoked directly, and
the patched fmt header compiles against the iOS 26.5 Simulator SDK. This is
useful compatibility evidence, but not a successful full app build.

## Remaining release gates

1. Create a clean source commit and direct evidence commit for the verified
   2026-08-09 follow-up, then rebind candidate identity without reusing the
   older development-device result as same-SHA evidence.
2. Under separate approval, generate the production EAS Store Build 69 and bind
   its IPA identity, SHA-256, and profile to the clean source SHA.
3. Upload and process Build 69 in App Store Connect under separate approval.
4. Replace Build 68 with Build 69 in version 1.0.3 and update the review note.
5. Install TestFlight Build 69 on the cabled iPhone 12 Pro and verify launch,
   login, the home-to-process UI match, template ordering, invitation preview,
   free link/share entry point, relaunch, and basic recovery.
6. Only then add version 1.0.3 to App Review; keep release mode manual.

## 2026-08-09 local Xcode compatibility follow-up

This checkpoint is local-only. It did not build or upload an EAS artifact,
write App Store Connect/TestFlight/Production state, install an app, or reuse
the earlier development Build 69 launch as proof for the changed source.

- `pod install --deployment --no-repo-update` passed twice with 101 declared
  dependencies and 103 installed pods. The first run reported
  `InviteHub fmt compatibility: patched`; the second reported
  `already_patched`.
- The hook applies only to pinned fmt `11.0.2` on Xcode `26.4+`, changes one
  exact Apple-clang guard, is idempotent, and fails closed if the expected
  header shape drifts. Its five regression tests passed.
- `Podfile.lock` and `Pods/Manifest.lock` match, and the lockfile's Podfile
  checksum matches the current Podfile.
- `npm test` passed 122/122 files and 654/654 tests; `npm run lint` and
  `npm run typecheck` passed. No dependency audit was run in this approved
  cache/install lane.
- Patched fmt compiled successfully with Apple clang `21.0.0` against the iOS
  `26.5` Simulator SDK using a direct C++20 syntax probe.
- Full app and isolated fmt-target `xcodebuild` attempts both stalled before
  source compilation in `ExecuteExternalTool clang -v -E -dM`. Directly
  running the same clang macro probe completed successfully. This leaves a
  local Xcode build-service blocker to resolve before a new candidate claim.

## Stop conditions

- Do not describe EAS completion, Apple processing, TestFlight availability,
  physical-device validation, App Review, approval, or public release as the
  same state.
- Do not submit Builds 62, 63, 64, 66, 67, or 68.
- Do not submit a build that lacks exact TestFlight physical-device launch
  evidence.
- Do not enable paid publishing or in-app purchase in this free-only candidate.

## 2026-08-04 production Build 69 source binding

- Read-only EAS query for Store-distributed iOS builds of `com.invitehub.app`
  returned 31 records, highest build 68, Build 69 count zero, and no second page.
- The user separately confirmed the ASC read-only UI also shows highest
  production Build 68 and no Build 69.
- Xcode Release now matches the intended source identity
  `com.invitehub.app` `1.0.3 (69)`. Debug remains the development identity
  `com.invitehub.app.dev` `1.0.3 (52)`.
- EAS production remains `distribution: store`, local app-version allocation,
  `autoIncrement: false`, `APP_BUNDLE_ID: com.invitehub.app`, and no automatic
  submission path.
- This is source binding only. No EAS build id, ASC build id, IPA/archive,
  artifact hash, profile binding, clean commit SHA, TestFlight result, or device
  proof exists for production Build 69.

## 2026-08-03 local backend public-write security checkpoint

Recorded: 2026-08-03 16:28 KST

This checkpoint is **local implementation evidence only**. No Supabase
migration, Production/Vercel configuration, App Store state, deployment,
commit, or push was changed. The official app security scan was explicitly
skipped for this task; the repository `AGENTS.md` security gate was applied
directly instead. Build 69 and all release gates above remain unchanged.

### Locally completed boundaries

- Public RSVP and guestbook writes now validate JSON, bounded bodies, slugs and
  fields; require replay-safe idempotency keys; use service-only database
  writes; and enforce client burst, rolling, daily, invitation-daily, and
  global-daily quotas that fail closed when durable quota state is uncertain.
- Guest publishing now requires a verified anonymous Supabase user and binds
  the invitation directly to that user id. Shared publisher ownership was
  removed. Full accounts cannot use the guest route, and authenticated free
  publishing binds both reads and writes to the verified owner.
- Authentication errors deny access even if an SDK result also contains a user
  object. OAuth callback destinations reject external, encoded separator,
  control-character, and backslash paths; successful redirect requires a
  verified post-exchange user.
- Uploads authenticate before parsing, require a bounded request length, verify
  magic bytes and decoded pixel count, canonicalize images to strip metadata,
  enforce per-user object/byte quotas, use content-addressed owner paths for
  replay deduplication, and restrict deletion to canonical owner paths.
- Account deletion requires a verified bearer token, explicit confirmation,
  a stable idempotency key and quotas. Owner storage cleanup must succeed before
  the auth account is removed; internal provider errors are not returned.
- `consume_rate_limit` uses one atomic upsert and is service-role-only. The
  forward 2026-08-03 migration re-installs this implementation so an environment
  that already applied the earlier migration is not left on stale logic.
- No dependency was added and no secret value was read or logged. Client IPs
  are converted to keyed HMAC fingerprints; raw addresses are not stored by
  the application quota keys.

### Verification evidence

- Focused security regression suite: `npx vitest run 'app/api/public/[slug]/rsvp/route.test.ts' 'app/api/public/[slug]/guestbook/route.test.ts' app/api/public/guest-publish/route.test.ts app/api/payments/free-publish/route.test.ts app/api/uploads/route.test.ts app/api/account/delete/route.test.ts app/auth/callback/route.test.ts lib/auth.test.ts lib/rate-limit.test.ts lib/supabase/public-write.test.ts lib/invitation-upload-security.test.ts tests/supabase-schema-security.test.ts apps/mobile/lib/invitations.test.ts components/invitations/invitation-view.test.tsx` — 14/14 files, 98/98 tests passed.
- Full regression suite: `npm test -- --run` — 116/116 files,
  575/575 tests passed.
- Web lint: `npm run lint` — 0 errors; one pre-existing unused-function warning
  in `scripts/verify-app-store-packet.mjs`.
- Mobile lint: `npm --prefix apps/mobile run lint` — 0 errors, 0 warnings.
- Web typecheck: `npx tsc --noEmit` — passed.
- Mobile typecheck: `npm --prefix apps/mobile run typecheck` — passed.
- Web production build: `npm run build` — passed; the final run required
  network read access for `next/font` Google Fonts and performed no external
  write.
- Diff integrity: `git diff --check` — passed after this evidence entry.

### Remaining external or operational gates

1. **Supabase owner: backend/security; due before the next production deploy.**
   Review and apply both unapplied migrations to the intended project, then
   verify RLS policies, grants, unique indexes, atomic RPC concurrency, and
   existing-row compatibility against that target. Local SQL tests do not prove
   deployed protection.
2. **Vercel owner: backend/operations; due before the next production deploy.**
   Set a new 32-256 byte `RATE_LIMIT_FINGERPRINT_KEY_V1`, confirm which ingress
   supplies the trusted IP header, reject direct header spoofing, enforce an
   edge request-body limit, and observe burst/rolling/daily quota failures in
   the deployed runtime.
3. **Cost-abuse owner: operations; due before public write enablement.** Add
   WAF/bot controls, provider storage budgets and alerts, a global kill switch,
   and spend-spike telemetry. Cross-instance reservation at the per-user
   storage object/byte boundary remains an operational/database follow-up; the
   local content-addressed deduplication does not make that race impossible.
4. **Account-security owner: product/security; due before the next account
   deletion release.** Decide and implement a recent-reauthentication policy for
   destructive account deletion. The current local boundary proves a valid
   bearer token plus explicit confirmation, not recent authentication.
5. **Dependency owner: web/mobile maintainers; due before the next production
   deploy.** Reconcile the already-recorded root/mobile high and moderate audit
   advisories without broad dependency upgrades. This task added no dependency
   and did not run a new external audit.
6. Run target-environment negative probes for missing/invalid identity,
   conflicting idempotency keys, replay and concurrent duplicate delivery,
   quota backend outage, burst and slow daily abuse, oversized uploads,
   storage-budget exhaustion, provider timeout, and cleanup failure before any
   operational protection claim.

## 2026-08-03 release candidate identity checkpoint

Recorded: 2026-08-03 21:48 KST

This checkpoint covers App Store readiness Slice 1 only. It is local
implementation and test evidence, not approval of Build 68, local development
Build 69, Store Build 69, or any other release candidate. No iPhone, native
build/install, EAS/ASC, Supabase, Vercel, Kakao, WAF, Production, commit, or
push operation was performed.

### Fail-closed boundary

- `release-ledger.yaml` now has an explicit `selected_candidate` record. It is
  intentionally `selected: false`; no version/build/SHA is promoted.
- Build/install/upload preflight requires a clean committed 40-character SHA,
  exact branch, a version newer than the public ledger version, the canonical
  Store bundle, live `app.json` and Xcode Release identity, local EAS version
  allocation with auto-increment disabled, an explicit user-confirmation
  reference, and matching ignored raw evidence.
- Native Build 52, dev bundle identifiers, dirty source, identity-affecting
  environment overrides, SHA/version/build drift, unselected candidates, and
  missing evidence fail independently in negative tests.
- Existing local simulator installation now verifies the `.app` identity and a
  deterministic artifact SHA-256 before `simctl install`. IPA upload verifies
  the IPA Info.plist identity and file SHA-256 before `eas submit`.
- EAS build and upload are separate entrypoints. `--auto-submit` is not used,
  so a resulting IPA must be inspected and evidence-bound before upload.

### Local verification evidence

- Negative-test red phase: `npx vitest run scripts/verify-release-candidate.test.ts`
  failed because the verifier module did not yet exist.
- Focused release gate: `npx vitest run scripts/verify-release-candidate.test.ts scripts/release-entrypoints.test.ts scripts/invitehub-release-gate.test.ts`
  — 3/3 files, 20/20 tests passed.
- Related release harness: `npx vitest run scripts/*.test.ts apps/mobile/app.config.test.ts tests/verify-app-store-packet.test.ts`
  — 9/9 files, 51/51 tests passed.
- Full regression: `npm test -- --run` — 119/119 files, 594/594 tests passed.
- Packet verifier: `node scripts/verify-app-store-packet.mjs` — 323 checks passed.
- Web lint: `npm run lint` — 0 errors and one pre-existing unused helper warning
  in `scripts/verify-app-store-packet.mjs`; mobile lint passed with 0 warnings.
- Web typecheck: `npx tsc --noEmit` — passed after adding the verifier module
  declaration; mobile typecheck passed.
- Web production build: `npm run build` — passed. No native build was run.
- Live local negative probes: candidate preflight, repository release gate, and
  EAS build wrapper each exited 2 before any native/provider command because
  no candidate is selected and no raw evidence exists.

### Remaining release/security gates

1. **Release owner; due before any native candidate build.** Choose a clean
   committed candidate, update all native version/build fields, explicitly set
   `selected_candidate`, capture the matching raw evidence, and obtain user
   approval. Build 68/69 is not implicitly approved by this checkpoint.
2. **Release owner; due before IPA upload.** Verify the produced IPA's embedded
   Store identity and SHA-256, add the artifact fields to the raw evidence, then
   obtain separate approval before running the upload wrapper.
3. **Device/review owner; due before App Review.** Install the exact processed
   TestFlight artifact on the real iPhone, bind the installed identity to the
   submitted SHA/build, run the required smoke scenarios, and retain manual
   release mode. No current device evidence satisfies this new candidate gate.
4. **Operations/security owners; due before Production enablement.** The
   Supabase/Vercel/WAF/provider and public-write cost gates listed above remain
   external. Slice 2 quota/idempotency/recent-auth/partial-failure work was not
   mixed into this checkpoint.

## 2026-08-03 INV-IOS-002 physical-device candidate preflight

Recorded: 2026-08-03 22:04-22:09 KST

Verdict: **HOLD / BLOCKED-CANDIDATE**. The fail-closed candidate gate did not
open, so no install or functional device QA was authorized.

### Candidate and artifact binding

- Canonical worktree: `agent/osamosam-uiux-plan-v1` at full HEAD
  `0538c5d4dfe56b7a3dd9aa41bbbee484f4a536e7`.
- Worktree: 89 dirty entries (67 tracked and 22 untracked).
- Ledger: `working_tree_based_on_0538c5d4dfe56b7a3dd9aa41bbbee484f4a536e7`;
  `selected_candidate.selected: false`; selected identity empty.
- Raw candidate evidence: `docs/release-candidate-evidence.json` missing.
- Live native Release identity: `com.invitehub.app`, `1.0.3 (52)`. This is not
  ledger Build 69, and Build 52 is an explicit stale-build blocker.
- Selected-candidate IPA/archive: absent. The recorded Build 68 SHA-256 remains
  `3ba0f27c4250be1ae794287b951508e0b82ea8efb76fd98d8cf7454619a86324`,
  but the local IPA is absent and Build 68 is superseded, so it cannot be
  rehashed or promoted.
- `node scripts/verify-release-candidate.mjs build` exited 2 before any native
  build or provider command.

### Read-only device and provisioning observations

- Device: iPhone 12 Pro, iOS 26.5.2, UDID
  `00008101-000525241EE3003A`, wired/paired/developer mode enabled.
- Installed prod: `com.invitehub.app` `1.0.3 (68)`; artifact source, installed
  binary SHA, and embedded profile remain unbound.
- Installed dev: `com.invitehub.app.dev` `1.0.3 (69)`; development bundle and
  artifact SHA remain unbound.
- Installed runner: `com.invitehub.deviceqa.xctrunner` `1.0 (1)`.
- Local Store profile `c52af7eb-517a-4fb3-9cc4-445db1d14c51` targets the prod
  bundle and contains no device list, as expected for Store distribution.
- Local dev profile `158cad4c-738d-4521-a58f-04d0fe748570` targets the dev
  bundle and includes this iPhone UDID. This does not prove the installed dev
  binary's exact profile or SHA.

### Non-destructive boundary and final state

- Build/archive/install/reinstall/overwrite/delete/data reset: none.
- Launch: 0. XCUITest: 0. Computer Use observed flows: 0.
- Invitation open, RSVP, guestbook, share/Kakao entry/cancel/reopen,
  guest-to-account ownership, and account-deletion/recent-auth flows were not
  observed and are not passed.
- Login credentials, Kakao send, account deletion, Production/DB/provider/Store
  writes: none.
- Final `InviteHub` process count: 0. Final
  `OsamosamDeviceQA-Runner` process count: 0.
- Evidence packet:
  `output/real-device-qa/2026-08-03T2204KST-ios-inv-ios-002-candidate-preflight-blocked/summary.md`.

`실기기 점유 해제 완료`

## 2026-08-03 INV-BE-002 Slice 2: view-log cost and abuse boundary

Verdict: **LOCAL PASS / PRODUCTION BLOCKED**. This checkpoint proves the local
implementation and regression surface only. No Supabase migration, Vercel/WAF
configuration, provider write, native build/install, EAS/ASC action, commit, or
push occurred.

### Implemented local boundary

- Public invitation rendering now sends one server-internal UUID view event to
  a service-only `record_invitation_view` RPC. There is no public view-log API,
  request body, client-controlled batch, or retry loop; array-shaped and
  oversized identifiers are rejected before quota or database work.
- Verified Supabase users are separated into `authenticated` and signed
  `anonymous_session` identities. Visitors without an auth cookie use only a
  trusted-ingress IP input. Every identity is HMAC-SHA-256 keyed with
  `RATE_LIMIT_FINGERPRINT_KEY_V1`; a missing, short, malformed, or conflicting
  identity fails closed. Raw IP, user ID, and user agent are not stored or
  logged.
- `VIEW_LOGGING_ENABLED` defaults to `false`. When enabled, server-side limits
  are identity 3/minute, 30/hour, 100/day; invitation 1,000/day; and global
  1,000/day. Quota RPCs run sequentially and stop at the first denial or
  uncertainty. A process-local concurrency gate allows at most 8 active view
  writes, while durable database buckets provide the cross-instance ceilings.
- Auth, quota, and write dependencies use 750 ms bounded waits; the SQL write
  has a 2 second statement timeout. There are no automatic retries. Timeout,
  abort, malformed dependency results, or quota uncertainty suppress the write
  while leaving the public invitation read available.
- A server-issued timestamp is accepted for 60 seconds with 5 seconds of future
  skew. A keyed 30-minute idempotency window produces `inserted`, `replayed`,
  or `collision`; stale tickets and collisions never trigger repeated work.
- Direct `view_logs` insert/update/delete is revoked from public, anon,
  authenticated, and service roles. Only service-role RPC execution can write.
  Owner reads remain deny-by-default through RLS.
- The local migration records one `cost_units` value and a redacted
  `identity_kind` attribution dimension. Identity/idempotency hashes are
  cleared after 1 day and rows are deleted after 90 days by the bounded
  `cleanup_view_logs(1..5000)` RPC. Scheduling and observation remain staging
  operations gates.

### Local verification evidence

- Negative-test red phase: the new view-log and schema tests initially failed
  because the module, RPC, constraints, and migration did not exist.
- Focused security suite: `npx vitest run lib/view-log.test.ts lib/rate-limit.test.ts 'app/invitations/[slug]/page.test.ts' tests/supabase-schema-security.test.ts`
  passed 4/4 files, 43/43 tests.
- Related public-write suite: `npx vitest run lib/view-log.test.ts lib/rate-limit.test.ts lib/supabase/public-write.test.ts 'app/invitations/[slug]/page.test.ts' 'app/api/public/[slug]/rsvp/route.test.ts' 'app/api/public/[slug]/guestbook/route.test.ts app/api/public/guest-publish/route.test.ts app/api/payments/free-publish/route.test.ts tests/supabase-schema-security.test.ts apps/mobile/lib/invitations.test.ts components/dashboard/dashboard-delete-policy.test.ts`
  passed 11/11 files, 91/91 tests.
- The App Store packet fixture was aligned with the existing Slice 1
  `blocked_candidate_preflight_failed` phase, then its focused suite passed
  1/1 file, 6/6 tests.
- Full regression: `npm test -- --run` passed 120/120 files, 611/611 tests.
- `npx tsc --noEmit`, `npm --prefix apps/mobile run typecheck`, and both web
  and mobile lint passed. Web lint reported 0 errors and one pre-existing
  unused helper warning in `scripts/verify-app-store-packet.mjs`.
- `npm run build` passed the Next.js production build. No native build ran.
- Targeted secret and raw-IP scans found no credential-shaped value, raw test
  IP, or logging call in the runtime/migration boundary. A full changed-diff
  pattern scan flagged only two deterministic Vitest HMAC fixtures; neither is
  used by runtime code. The only runtime `user_agent` matches explicitly set
  the value to `null`. `git diff --check` passed.

### Exact staging enablement and observation gates

1. **Migration and grants.** In staging only, verify migration history, apply
   `202608030002_harden_view_log_cost_boundary.sql`, and prove anon,
   authenticated, and direct service-role table writes are denied while only
   the service-role RPC succeeds. Exercise owner/non-owner RLS reads.
2. **Secrets and kill switch.** Provision a new staging-only 32-256 byte
   `RATE_LIMIT_FINGERPRINT_KEY_V1`; never expose it to `NEXT_PUBLIC_*`. Keep
   Production `VIEW_LOGGING_ENABLED=false`. Set it to `true` in staging only
   after the migration/grant checks pass, and prove toggling it back to `false`
   immediately stops new rows.
3. **Trusted ingress.** Confirm the deployed ingress overwrites and authenticates
   `cf-connecting-ip` or `x-vercel-forwarded-for`. Send conflicting and
   spoofed-forwarding probes and observe zero writes; do not fall back to a
   client-supplied raw header.
4. **Quota and replay observation.** Observe the five durable buckets under
   burst, slow daily traffic, identifier rotation, and concurrent instances.
   Confirm one row per identity/invitation/30-minute window, explicit replay or
   collision outcomes, no retries, and no write on timeout, malformed RPC
   output, quota dependency failure, or the 1,000-unit global ceiling.
5. **Retention and cost telemetry.** Schedule `cleanup_view_logs` with a batch
   no larger than 5,000. Prove identity/request hashes are cleared after 1 day,
   rows disappear after 90 days, and dashboards/alerts use only invitation ID,
   identity kind, cost units, and time. Alert on global quota exhaustion,
   dependency failures, concurrency saturation, and cleanup lag without raw IP
   or personal identifiers.
6. **External cost gate.** WAF/distributed-bot rules, provider budget alerts,
   staging load calibration, and an operations rollback owner must be approved
   and observed before any Production enablement. Local code cannot prove these
   controls are operating.

Next proposed single Slice 3: **signed-URL ownership, expiry, transform, and
download-cost boundary**. Account-delete partial failure/cost handling remains
separate and should not be mixed into that slice.

## 2026-08-03 INV-BE-002 Slice 3: account deletion lifecycle boundary

Verdict: **LOCAL PASS / CANDIDATE PROMOTION BLOCKED / STAGING REQUIRED**.
This proves local code, contract tests, and a production-mode web build only.
No account or data was deleted, no migration was applied, and no Supabase,
Vercel, WAF, provider, device, EAS/ASC, commit, or push action occurred.
`ACCOUNT_DELETION_ENABLED` remains fail-closed unless explicitly set to
`true`; Production must remain `false` until the staging gates below pass.

### Implemented lifecycle and failure boundary

- Only a non-anonymous authenticated user whose signed claims contain a
  detailed, non-anonymous AMR timestamp from the last 5 minutes can obtain a
  deletion ticket. The HMAC ticket is bound to the user, auth session, random
  request ID, issue time, and expiry. A wrong user/session, stale ticket,
  malformed claim, missing server key, mismatched idempotency key, custom-header
  failure, or cross-site browser origin fails before destructive work.
- Exact ticket/idempotency replay returns the existing request without rerunning
  cleanup. A fresh recent-auth ticket may resume a partial-failure outbox once;
  a durable ticket-hash quota rejects reuse, while the database lease,
  `next_retry_at`, and maximum five claims prevent concurrent/retry-storm work.
- `begin_account_deletion` uses a per-user transaction lock, checks payment,
  entitlement, and publish-credit retention blockers, creates one service-only
  tombstone/outbox row, then changes all owned invitations—including an
  anonymous guest account later upgraded in place—to `deletion_pending` before
  cleanup. Owner/public/storage/payment policies exclude a pending account, so
  a partial failure does not make its rows or objects accessible again.
- Cleanup order is fixed as Storage objects, account-scoped external providers,
  Auth identity, then redacted outbox finalization. Storage/provider/Auth/DB
  calls have 1.5-second application timeouts; SQL transitions have 2-second
  statement timeouts. Each invocation performs no inline retry. Failures move
  to `retry_wait`, back off, keep a two-minute lease barrier, and become
  `blocked` after five claims. Storage deletion is bounded by object/batch
  limits and is idempotent after a partial batch failure. Auth
  `user_not_found` is treated as already-completed work.
- Current payment providers expose verification records but no remote
  account-scoped resource to delete, so the provider stage is an explicit
  no-op. Accounts with payment/entitlement/credit records are blocked before
  tombstoning pending a legal-retention decision. A future remote provider
  adapter must occupy this already-ordered, leased, and timed stage.
- No restoration is attempted after tombstoning because cleanup is
  intentionally irreversible. The client requires both an export disposition
  (`downloaded` or explicit `skipped`) and a restore-impossible acknowledgment.
  The API does not generate an export; the user must complete any desired
  export before confirmation.
- The outbox stores keyed subject/request/ticket hashes and allowlisted error
  codes only—never raw user ID after finalization, raw IP, token, secret,
  provider payload, or provider error text. Completed identifiers are cleared
  after one day and completed audit rows after 90 days in batches of at most
  1,000. Blocked jobs remain hidden for operator/legal review and are never
  automatically reactivated or deleted.

### Local verification evidence

- Negative-first focused red phase initially failed because the account
  lifecycle module, outbox migration, tombstone policies, and failure contracts
  did not exist.
- Final focused account-delete/security suite:
  `npx vitest run lib/account-deletion.test.ts app/api/account/delete/route.test.ts lib/invitation-upload-security.test.ts tests/supabase-schema-security.test.ts app/api/uploads/route.test.ts app/api/payments/free-publish/route.test.ts app/api/payments/store/verify/route.test.ts app/api/public/guest-publish/route.test.ts apps/mobile/lib/invitations.test.ts`
  passed 9/9 files and 84/84 tests.
- Full regression: `npm test -- --run` passed 121/121 files and 630/630 tests.
- `npm run lint` passed with 0 errors and one pre-existing unused-helper warning
  in `scripts/verify-app-store-packet.mjs`. `npx tsc --noEmit`,
  `npm --prefix apps/mobile run typecheck`, and `npm run build` passed. No native
  build ran.
- Local SQL execution is not claimed. `supabase db lint --local --level warning`
  could not connect to the absent local Supabase database at
  `127.0.0.1:54322`; migration syntax, grants, transactions, RLS, and cleanup
  behavior therefore remain staging gates.

### Clean-candidate minimum allowlist

Do not promote the current dirty tree. A new clean committed candidate must
include the following account-deletion files together, plus the already-required
Slice 1/2 rate-limit/public-write primitives and migrations they import:

- Runtime/UI: `.env.example`, `app/api/account/delete/route.ts`,
  `app/api/uploads/route.ts`, `app/api/payments/free-publish/route.ts`,
  `app/api/payments/store/verify/route.ts`, `apps/mobile/app/(tabs)/mypage.tsx`,
  `lib/account-deletion.ts`, `lib/invitation-upload-security.ts`,
  `lib/rate-limit.ts`, `lib/supabase/public-write.ts`, and
  `lib/supabase/types.ts`.
- Database: `supabase/schema.sql` and the ordered local migrations
  `202608030001_bind_guest_owners_and_public_write_idempotency.sql`,
  `202608030002_harden_view_log_cost_boundary.sql`, and
  `202608030003_harden_account_deletion_lifecycle.sql`.
- Tests: the matching route tests for account delete, uploads, free publish,
  store verify, and guest publish; `lib/account-deletion.test.ts`,
  `lib/invitation-upload-security.test.ts`, `lib/rate-limit.test.ts`,
  `lib/supabase/public-write.test.ts`, `apps/mobile/lib/invitations.test.ts`, and
  `tests/supabase-schema-security.test.ts`.
- Evidence only: `docs/current-release-state.md` and `release-ledger.yaml`.
  No unrelated dirty UI, generated artifact, candidate evidence, or stale
  Build 52 identity may enter this allowlist.

### Staging test-account runbook (not executed)

1. **Environment and deny default.** Use an isolated staging Supabase project
   and synthetic accounts only. Configure staging values for
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only
   `SUPABASE_SERVICE_ROLE_KEY`, fresh 32-256 byte
   `RATE_LIMIT_FINGERPRINT_KEY_V1`, fresh 32-256 byte
   `ACCOUNT_DELETE_TICKET_KEY_V1`, and exact `NEXT_PUBLIC_SITE_URL`. Keep
   `ACCOUNT_DELETION_ENABLED=false`, apply migrations 001-003 in order, lint
   the live schema, and prove direct outbox/table writes are denied before
   setting the staging flag to `true`. Production remains untouched and false.
2. **Non-destructive negative probes.** With synthetic accounts A and B, test
   missing/wrong custom header, wrong Origin, missing bearer, anonymous AMR,
   stale or timestamp-less AMR, expired ticket, A ticket used by B, wrong
   idempotency key, modified body, exact replay, ticket collision, oversized
   body, quota uncertainty, and global quota exhaustion. Assert no new
   tombstone, Storage/Auth/provider call, or data mutation for every rejected
   request; exact replay may only return the existing request.
3. **Retention hold.** Give a synthetic account a payment or test entitlement
   record. Expect `423 retention_required`, no `deletion_pending` change, no
   outbox row, and no cleanup call. Review export and legal-retention handling
   with the named privacy/legal owner before any broader enablement.
4. **Owned-data visibility.** Create synthetic account A by upgrading a signed
   anonymous account in place, then add an owned invitation, RSVP, guestbook
   entry, view record, and test Storage objects. Account B must never read or
   mutate A. With deletion still disabled, capture the pre-delete export and
   verify the planned tombstone transaction would hide all owner/public/storage
   surfaces before cleanup. Enabling and actually deleting this disposable
   account is a separate explicit staging approval because it is destructive.
5. **Approved disposable deletion.** Only after that approval, use a newly
   reauthenticated disposable A, issue one ticket, and submit once. Observe one
   outbox row and the order `deletion_pending -> Storage -> provider no-op ->
   Auth -> finalize`. Confirm A cannot authenticate and B cannot access A data;
   final telemetry contains only keyed attribution, stage/status/attempt,
   allowlisted error code, and timestamps.
6. **Fault and recovery lane.** In an isolated staging test project, inject one
   Storage partial failure, provider-stage failure adapter, Auth failure, and DB
   lock/timeout separately. Confirm no later stage runs, data stays hidden,
   error text is redacted, and the job enters `retry_wait`. After the lease and
   backoff expire, reauthenticate and use a fresh ticket once to resume. Reuse
   of that ticket must fail; concurrent callers must yield one lease holder;
   attempts stop at five and move to `blocked` with no automatic reactivation.
7. **Already-deleted and retention cleanup.** On a disposable fixture whose
   Auth identity is already absent, an approved recovery run must treat
   `user_not_found` as success and finalize. Backdate completed test rows to
   prove one-day hash redaction and 90-day bounded deletion; blocked/legal-hold
   rows must remain. Verify alerts for blocked jobs, retries, dependency
   failures, and cleanup lag without raw PII.
8. **Close the gate.** Set the staging kill switch back to `false`, confirm new
   tickets fail before auth/quota work, archive redacted evidence, and obtain
   security, privacy/legal, and release-owner approval. Only then may a clean
   candidate be selected; Production migration/provider enablement remains a
   separate approval and observation gate.

Next proposed single Slice 4: **signed-URL ownership, expiry, transform, and
download-cost boundary**. Do not mix it into the account-deletion P0 closure.

## 2026-08-03 INV-BE-002 Slice 4: signed asset ownership and download-cost boundary

Verdict: **LOCAL PASS / STAGING AND PROVIDER GATES OPEN / PRODUCTION NO-GO**.
No Supabase migration, Storage provider setting, staging/Production deploy,
device action, EAS/ASC action, commit, or push occurred. The implementation is
disabled by default through `INVITATION_ASSET_ACCESS_ENABLED=false`.

### Implemented local boundary

- The `invitation-assets` bucket remains private. Local migration
  `202608030004_harden_signed_asset_delivery.sql` removes the authenticated
  direct read/delete policies created by earlier migrations, so mobile clients
  cannot bypass application ownership, quota, or account-tombstone checks by
  calling the Storage signing API directly. Upload, original preview, delete,
  and published delivery are mediated by service endpoints.
- Public invitation images require exactly one slug and one canonical object
  key. The database row must be `published`, the key must occur in that
  invitation's bounded stored-path set, and its first folder must equal the
  invitation owner. Traversal, another owner's key, repeated/batch parameters,
  unknown parameters, transform/resize requests, and off-origin signed URLs
  fail before redirect.
- Public signed URLs expire after 120 seconds. Owner and template-admin previews
  expire after 600 seconds. Redirect/JSON responses use `private, no-store` and
  `no-referrer`; database and signing operations have 750-1,500 ms timeouts and
  no automatic retry. A Storage response key that differs from the requested
  canonical owner key is never signed or used as a cleanup target.
- Public delivery uses privacy-safe client and slug hashes with server-side
  limits of 30/minute, 300/hour, 1,000/client/day, 1,000/slug/day, and
  1,000/global/day. Owner signing uses 30/minute, 300/hour,
  1,000/user/client/day, and 1,000/global/day. Template-admin upload uses
  5/minute, 100/user/client/day, and 1,000/global/day. Quota uncertainty fails
  closed before Storage work.
- Owner asset signing is a single-path authenticated server call. Mobile no
  longer calls `supabase.storage.createSignedUrl`; it obtains one current access
  token and resolves at most 22 unique paths per invitation sequentially. The
  public gallery surface is deduplicated and capped at 20 paths.
- Template-admin upload now shares the kill switch, request-size and image
  canonicalization rules, aggregate 100-object/50 MiB user quota,
  content-addressed idempotency, burst/daily/global budgets, bounded provider
  calls, short signed preview, and cleanup of only the newly requested key on a
  signing failure. It no longer returns a nonfunctional public URL for the
  private bucket.
- Rate-limit attribution stores only keyed client/user/slug identifiers and
  route-level keys. Runtime paths contain no raw IP/user telemetry or provider
  error logging. Transform work is excluded entirely: no endpoint accepts
  width, height, quality, format, or provider transformation options.

### Replay and download-cost limit

Signed URLs are intentionally replayable during their short 120/600-second
window because browsers and mobile image loaders may refetch an asset. The app
meters each issuance but cannot observe or stop repeated CDN downloads after
the redirect. Provider egress caps, Storage analytics, hot-object alerts, WAF
rules, and emergency provider disablement therefore remain mandatory external
gates; local code does not prove download spend is bounded in Production.

### Local verification evidence

- Negative-first red phase failed 11/22 tests before the TTL, kill switch,
  ownership/key binding, quota, timeout, transform/batch, and owner-server
  endpoint contracts existed.
- Final focused suite:
  `npx vitest run lib/invitation-assets.test.ts app/api/public/assets/route.test.ts app/api/uploads/route.test.ts app/api/admin/templates/upload/route.test.ts apps/mobile/lib/invitations.test.ts tests/supabase-schema-security.test.ts`
  passed 6/6 files and 54/54 tests.
- Full regression: `npm test -- --run` passed 122/122 files and 650/650 tests.
- `npm run lint` passed with 0 errors and one pre-existing unused-helper warning
  in `scripts/verify-app-store-packet.mjs`. `npx tsc --noEmit`,
  `npm --prefix apps/mobile run typecheck`, and `npm run build` passed. No
  native build ran.
- `node scripts/verify-app-store-packet.mjs` passed 323 checks. Targeted runtime
  secret and raw-PII/provider-detail logging scans found no match. The test
  fixture scan found only the deterministic fake fingerprint key in
  `app/api/uploads/route.test.ts`. `git diff --check` passed. Migration 004 was
  not applied or linted against a live database.

### Clean-candidate minimum allowlist update

The existing Slice 1-3 allowlist remains required. Add these Slice 4 files as
one inseparable set; do not promote the current dirty tree:

- Runtime/UI: `.env.example`, `app/api/public/assets/route.ts`,
  `app/api/uploads/route.ts`, `app/api/admin/templates/upload/route.ts`,
  `apps/mobile/lib/invitations.ts`, `lib/invitation-assets.ts`, plus the existing
  `lib/invitation-upload-security.ts`, `lib/rate-limit.ts`, and Supabase client
  helpers they import.
- Database: `supabase/schema.sql` and ordered migrations 001, 002, 003, and
  `202608030004_harden_signed_asset_delivery.sql`.
- Tests: matching public-assets/uploads/admin-upload route tests,
  `apps/mobile/lib/invitations.test.ts`, `lib/invitation-assets.test.ts`,
  `lib/invitation-upload-security.test.ts`, `lib/rate-limit.test.ts`, and
  `tests/supabase-schema-security.test.ts`.
- Evidence only: `docs/current-release-state.md` and `release-ledger.yaml`.
  Unrelated dirty UI, generated artifacts, candidate evidence, and stale Build
  52 identity remain excluded.

### Exact staging and provider gates

1. Inventory stored invitation paths first. Any legacy non-content-addressed or
   nested user asset needs an explicit migration decision; the new runtime
   intentionally rejects it rather than weakening owner binding.
2. Apply migrations 001-004 in order to an isolated staging project. Prove the
   bucket is private and anon/authenticated direct SELECT/DELETE/signing fails,
   while only the service endpoints can issue/read/delete permitted objects.
3. Configure staging server values for Supabase, service role, a fresh
   32-256-byte `RATE_LIMIT_FINGERPRINT_KEY_V1`, and exact Supabase origin. Keep
   Production `INVITATION_ASSET_ACCESS_ENABLED=false`; enable staging only after
   migration and grant checks.
4. With synthetic owners A/B and one published invitation, prove A owner preview
   works, B cannot request A's original, public access works only for the
   published payload key, drafts/deletion-pending invitations remain hidden,
   and deletes cannot cross the owner folder.
5. Probe traversal, encoded traversal, duplicate params, arrays/batches,
   oversized URL/body, transform/resize/quality/format inputs, provider key
   mismatch, off-origin redirect, timeout, quota dependency failure, burst,
   slow daily abuse, identifier rotation, and the three global ceilings.
6. Observe token expiry at 120 and 600 seconds and verify no transform endpoint
   or transformed derivative is created. Exercise concurrent mobile gallery
   loading and confirm sequential issuance with at most 20 gallery keys.
7. Enable provider egress/budget caps, Storage usage alerts, hot-object/replay
   detection, WAF/CDN rules, and a named emergency kill-switch owner. Repeated
   CDN downloads inside a valid TTL must be measured because application rate
   limits see issuance, not provider egress.
8. Return the staging kill switch to `false`, prove issuance/upload stops before
   provider work while owner cleanup remains available, retain redacted
   evidence, and obtain security/operations/release approval before any clean
   candidate or Production enablement.

Next proposed single Slice 5: **export generation and download lifecycle**, if
required for account deletion. Keep it separate from signed image delivery.

## 2026-08-05 development Build 69 physical-device evidence

Scope: non-destructive development-bundle build/install/launch evidence only.
This does not promote or replace the Store candidate, TestFlight build, App
Review build, or Production runtime.

### Bound identity and build result

| Evidence | Verified value |
| --- | --- |
| Candidate source Git SHA | `856e7227d92a2ac7ddf5bc6a49726721d17685dd` |
| Device | cabled iPhone 12 Pro; UDID `00008101-000525241EE3003A`; iOS `26.5.2` |
| Development identity | `com.invitehub.app.dev` `1.0.3 (69)` |
| Production identity before and after | `com.invitehub.app` `1.0.3 (68)`; unchanged |
| Xcode result | succeeded; error count `0`; warning count `651` |
| Built Info.plist SHA-256 | `de1010d8e23747ecaa5611749d1c7919f1b5092ae68ef6ee1f4b9e35f38e0358` |
| Built executable SHA-256 | `bda0d3b525507e9c4195a63225f9033fd3dfb9db95373ac41f3a3218113558c` |
| Signature | `codesign --verify --deep --strict` passed; Apple Development team `3FG9QJC8WC`; CDHash `9792d7a50e802365136d5848a9987708e0a5e06a` |
| Provisioning | profile `iOS Team Provisioning Profile: com.invitehub.app.dev`; exact device UDID present; expires `2027-06-28 01:34:34 UTC` |
| Install | `devicectl device install app` reported installed bundle `com.invitehub.app.dev` without uninstalling either bundle |
| Launch | `devicectl device process launch --terminate-existing com.invitehub.app.dev` succeeded; installed-path process remained alive as PID `4337` at the recorded post-launch check |
| 2026-08-05 recheck | `devicectl device info apps` still reports Production Build `68` and development Build `69` side by side |

The native build encountered two toolchain/dependency incidents. The local
Xcode 26.6 build service stalled while probing compiler macros; a temporary
compiler-probe filter was used only for this build and was not persisted. The
vendored `fmt 11.0.2` header also required a temporary generated-Pods
`FMT_USE_CONSTEVAL` workaround. That header was restored byte-for-byte from the
CocoaPods cache after the successful build (SHA-256
`895fd797b2c203e3661cdbeb7ee4f60a637c927be1b4a4728b9aa6400e238d90`).
Temporary Xcode project, scheme, Info.plist, and generated-Pods edits were
removed after device verification. The only retained checkout change from the
native dependency operation is the Hermes checksum correction in
`apps/mobile/ios/Podfile.lock`; it matches `Pods/Manifest.lock`. The root
`package-lock.json` remained unchanged.

### Remaining decisions and release gates

| Priority | Decision or evidence still required | Owner | Due |
| --- | --- | --- | --- |
| P0 | Choose a permanent clean-build response for the `fmt`/Apple Clang issue: pinned compatible dependency or a narrowly tested Podfile hook. The one-off generated-Pods edit is not a durable fix. | iOS dependency owner | before the next clean candidate build |
| P0 | Run real-device functional QA for login/session recovery, home-to-process parity, template ordering, invitation preview, free link/share, relaunch, offline/slow/failure recovery, and data preservation. Process survival alone is only launch smoke. | device QA owner | before Store Build 69 selection |
| P0 | Produce, hash-bind, upload, process, and TestFlight-install the exact Production `com.invitehub.app` Build 69 only after separate approval. Development Build 69 is not Store provenance. | release owner | before App Review |
| P0 | Observe the Supabase/Vercel quota, idempotency, RLS, WAF, storage-budget, provider-kill-switch, and negative paths in the target staging environment. Local tests are not deployed protection. | backend/security and operations owners | before Production enablement |
| P1 | Triage the 651 dependency/toolchain warnings and record which are app-owned, upgrade-owned, or accepted with rationale. Zero build errors does not waive warning review. | iOS maintainer | before App Store submission |
| P1 | Reproduce or retire the temporary Xcode compiler-probe filter on a clean Xcode invocation; do not persist it as a production build dependency without a bounded test. | build/toolchain owner | before the next archive |

Current phase verdict: **internal test ready for the development bundle only**.
Store submission readiness remains **HOLD**.
