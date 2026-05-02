# InviteHub Security Gate - 90점 Release Readiness

Date: 2026-05-01
Owner: Orchestrator / Security Engineer harness

## Verdict

Local security controls are materially in place. A fresh network-enabled
`npm audit --audit-level=high` passed for the current lockfile on
2026-05-01 18:06 KST with no high or critical findings.

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
| Negative-path tests | Latest local test run passed 52 files / 152 tests and focused mobile/API run passed 9 files / 30 tests, including auth, ownership, invalid body, payment, public write, and rate-limit coverage. | Pass |
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
| Real-device TestFlight install/launch evidence for build 38 has not been captured in this run. | Store Manager / Release owner | Before final release readiness sign-off |
| App Store Connect app information, version metadata, build selection, privacy labels, IAP approval, review notes, and screenshots are verified incomplete. | Store Manager / Release owner | Before final App Store submission |
| Custom domain `invitehub.co.kr` does not resolve by DNS; store URLs must use the verified Vercel deployment or DNS must be connected before submission. | Store Manager / Release owner | Before entering App Store metadata |
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

EAS iOS build 38 completed and EAS Submit uploaded the binary to App Store
Connect. It contains commit `d8ed82188b3233bebe7be90c173d434f36690581`, which
keeps paid photo publishing disabled by default until an IAP product exists.
Build 37 remains the last App Store Connect internal-group build that was
visually confirmed as `테스트 중`; build 38 processing/group assignment still
needs App Store Connect confirmation.

The remaining external gates are real-device TestFlight install/launch evidence
and final App Store Connect submission surfaces: app information, version
metadata, version build selection, privacy URL and privacy labels, IAP approval
or feature-flag fallback, screenshots, and review notes. A 2026-05-02 read-only
audit found those App Store submission surfaces incomplete even though the
TestFlight build is available internally.

The IAP feature-flag fallback is now implemented locally and defaults to off.
Verification on 2026-05-02 passed targeted tests, web/mobile typecheck,
web/mobile lint, and an iPhone 17 Release simulator build. This reduces the
store-compliance risk while the App Store Connect IAP product does not exist,
but the flag must stay disabled until the product is created and approved.
