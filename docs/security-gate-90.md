# InviteHub Security Gate - 90점 Release Readiness

Date: 2026-05-01
Owner: Orchestrator / Security Engineer harness

## Verdict

Local security controls are materially in place. A fresh network-enabled
`npm audit --audit-level=high` passed for the current lockfile on
2026-05-03 13:24 KST with no high or critical findings.

## Checklist

| Gate | Evidence | Status |
| --- | --- | --- |
| Secrets | Source scan over `app`, `lib`, `components`, `apps/mobile`, `supabase`, `.env.example`, `README.md`, and `docs` found environment-variable references and test/user-entered tokens, not hardcoded production secrets. Sensitive server keys are read from env in `lib/supabase/admin.ts`. | Pass locally |
| AuthN/AuthZ | Store verification requires bearer token and Supabase user lookup. Free publish uses server Supabase user. Both query invitations with `user_id` ownership filters. | Pass |
| Least privilege | Supabase RLS policies restrict invitation/payment/RSVP/guestbook/view-log owner access and allow public access only for published invitation reads and public submission paths. | Pass |
| Input validation | Store verification uses Zod limits for provider/product/invitation/token/receipt fields. Public write schemas cap guest, phone, memo, nickname, and message lengths. | Pass |
| Output/sensitive data | Store verification writes sanitized provider verification payloads through `sanitizeStoreVerification` before audit/payment storage. | Pass |
| Request controls | JSON-only checks and body-size limits are centralized in `lib/supabase/public-write.ts`; store verification uses an 80 KB limit. | Pass |
| Abuse controls | `consume_rate_limit` exists in Supabase and public RSVP/guestbook/guest-publish routes call it before writes. | Pass |
| Negative-path tests | Latest local code-gate run passed 58 files / 177 tests and focused mobile/API run passed 9 files / 34 tests, including auth, ownership, invalid body, payment, public write, and rate-limit coverage. | Pass |
| Dependencies | `npm audit --audit-level=high` exited 0. Current findings are moderate-only transitive advisories: PostCSS below 8.5.10 under Expo/Next and uuid below 14 under Expo config tooling. | Pass for high gate |

## Key Code Evidence

- `app/api/payments/store/verify/route.ts`: bearer-token auth, JSON-only body,
  Zod validation, product allowlist, ownership lookup, duplicate purchase
  reuse/ownership guard, sanitized verification payload.
- `app/api/payments/free-publish/route.ts`: server-side user check, JSON-only
  body, invitation ownership lookup, free-vs-paid guard.
- `lib/supabase/public-write.ts`: public input schemas, JSON content check, and
  body-size guard.
- `supabase/schema.sql`: `consume_rate_limit` function and RLS policies for
  owner-only invitations, payments, audit logs, RSVPs, guestbook moderation, and
  view logs.

## Residual Risks

| Risk | Owner | Due |
| --- | --- | --- |
| Real-device TestFlight install/launch evidence for the current crash-fix candidate has not been captured. Builds 38, 39, 40, and 41 are unsafe rollback candidates; build 42 is processed in App Store Connect but not yet proven on the user's iPhone. | Store Manager / Release owner | Before final release readiness sign-off |
| App Store Connect app information, version metadata, build selection, privacy labels, IAP approval, review notes, and screenshots are verified incomplete. | Store Manager / Release owner | Before final App Store submission |
| Custom domain `invitehub.co.kr` does not resolve by DNS; store URLs must use the verified Vercel deployment or DNS must be connected before submission. | Store Manager / Release owner | Before entering App Store metadata |
| `support@invitehub.co.kr` has no verified MX/DNS evidence; App Review contact must use a currently verified mailbox and `NEXT_PUBLIC_SUPPORT_EMAIL` until domain email is configured. | Store Manager / Release owner | Before entering App Review contact |
| Paid photo publishing remains disabled by default until an App Store Connect IAP product is created and approved. | Store Manager / Release owner | Before enabling `*_ENABLE_PAID_PUBLISH=true` |

## Latest Audit Evidence

```bash
cd /Users/jyb-m3max/Desktop/codex/invitation-platform
npm audit --audit-level=high
```

Result: exit 0, no high/critical findings. `npm audit` still reports 13
moderate findings in transitive Expo/Next tooling dependencies. Do not use
`npm audit fix --force` for this release because npm proposes breaking
downgrades for Next/Expo dependency chains.

## Current External Gate

EAS iOS build 42 completed and EAS Submit uploaded the binary to App Store
Connect after the latest user iPhone TestFlight crash report. Build 42 is the
current crash-fix candidate, but it is not treated as proven until the user's
iPhone installs and launches it from TestFlight.

`node scripts/eas-build-submission-status.mjs 61bc2e17-0c5a-45f3-94ee-bf3b63e09f03`
returned build 41 `FINISHED`, linked submission `FINISHED`, `error: null`.
A group-submit retry `949d446f-dea1-490f-8b52-2de359d899ee` ended `ERRORED`,
but direct App Store Connect evidence on 2026-05-03 confirmed build 40 is now
assigned to internal group `Team (Expo)` and status `테스트 중`.
Direct App Store Connect evidence on 2026-05-03 15:40 KST confirmed build
`1.0.0 (41)` upload status `완료`, version-row status `제출 준비 완료`, internal
group `Team (Expo)`, invite count `1`, and installs/sessions/crashes all `-`.

Historical build 38 completed and EAS Submit uploaded the binary to App Store
Connect. It contains commit `d8ed82188b3233bebe7be90c173d434f36690581`, which
keeps paid photo publishing disabled by default until an IAP product exists.
`node scripts/eas-build-submission-status.mjs d185dfc1-9110-4d81-b510-08e02f1ece7f`
was re-run on 2026-05-02 14:47 KST and returned build status `FINISHED`, linked
submission status `FINISHED`, and `error: null`.
Build 41 is visually confirmed in the internal group, but the 2026-05-06
follow-up showed that a `devicectl` exit code `0` was not enough evidence
because InviteHub was absent from the follow-up process query. Build 42 is the
emergency candidate after removing the prebuilt React Native core embed path
and delaying optional startup native modules. EAS Build and EAS Submit are
finished for build `88c911f5-3c21-41e8-a6a2-a04939fa6179`, submission
`ba6727cf-2c1d-464f-a005-6ce9670d4f81`, `error: null`. Chrome App Store
Connect evidence on 2026-05-07 21:49 KST shows build `1.0.0 (42)` processed,
export compliance not blocking, and internal group `Team (Expo)` assigned with
invite count `1`. Real-device install/session evidence is still pending.

The remaining external gates are real-device TestFlight install/launch evidence
and final App Store Connect submission surfaces: app information, version
metadata, version build selection, privacy URL and privacy labels, IAP approval
or feature-flag fallback, screenshots, and review notes. A 2026-05-02 read-only
audit found those App Store submission surfaces incomplete even though the
previous build 37 TestFlight path had been made available internally.

The IAP feature-flag fallback is now implemented locally and defaults to off.
Verification on 2026-05-02 passed targeted tests, web/mobile typecheck,
web/mobile lint, and an iPhone 17 Release simulator build. This reduces the
store-compliance risk while the App Store Connect IAP product does not exist,
but the flag must stay disabled until the product is created and approved.

The 2026-05-03 13:24 KST fast release gate passed web/mobile lint and
typecheck, the 58-file web/API test suite with 177 tests, and the focused
9-file mobile/API suite with 34 tests. The App Store packet verifier is now
pinned to build 42.

The public support page no longer hardcodes the unverified
`support@invitehub.co.kr` mailbox. It reads `NEXT_PUBLIC_SUPPORT_EMAIL` and only
renders a mail link when that value is syntactically valid. Verification on
2026-05-02 14:52 KST passed `lib/support-contact.test.ts`, web lint, and web
typecheck.

The filled external App Store evidence manifest
`docs/app-store-external-evidence.json` is gitignored because it can contain App
Review contact details, user/device confirmation notes, and private screenshot
paths. Only `docs/app-store-external-evidence.template.json` is tracked.
