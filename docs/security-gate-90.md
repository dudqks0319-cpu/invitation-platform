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
| App Store Connect export compliance for build 37 is not saved yet, so the uploaded TestFlight build is blocked from tester availability. | Store Manager / Release owner | Before internal TestFlight install |
| App Store Connect privacy labels, IAP approval, review notes, and screenshots are not externally verified. | Store Manager / Release owner | Before final App Store submission |

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

EAS iOS build 37 and its App Store Connect submission have completed. The
remaining gate is the App Store Connect encryption/export compliance prompt for
the current build. The project now includes `ITSAppUsesNonExemptEncryption=false`
for future builds, but build 37 still requires the App Store Connect answer to
be saved manually.

Saving the App Store Connect answer is a legal/export compliance action and
requires explicit user confirmation.
