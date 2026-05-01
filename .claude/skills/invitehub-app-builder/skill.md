---
name: invitehub-app-builder
description: Build and verify InviteHub mobile invitation app features with UX, app, API, QA, and store gates.
---

# InviteHub App Builder

Use this skill when the user asks to build, fix, polish, or release the
InviteHub invitation app.

## Input Scan

Identify:

- Target surface: mobile app, web/admin, published invite, API, or store.
- User flow: template, editor, preview, publish, share, RSVP, guestbook, map,
  photo upload, payments, auth, or release.
- Acceptance criteria: what the user must be able to see or do.

## Recommended Routing

- Broad app feature: `product-manager` -> `marketing-copywriter` ->
  `template-image-art-director` -> `ux-designer` -> `mobile-frontend-engineer` ->
  `mobile-backend-engineer` -> `security-engineer` -> `qa-engineer`.
- UI/UX feature: `marketing-copywriter` -> `ux-designer` ->
  `mobile-frontend-engineer` -> `qa-engineer`.
- Template image feature: `template-image-art-director` ->
  `mobile-frontend-engineer` -> `qa-engineer`.
- Data/API/publishing: `api-integrator` -> `backend-web-guardian` ->
  `qa-engineer`.
- Data/API/publishing in the app: `mobile-backend-engineer` ->
  `api-integrator` -> `security-engineer` -> `qa-engineer`.
- Release/App Store: `store-manager` -> `security-engineer` -> `qa-engineer`.
- Design handoff/Figma: inspect design context first, then adapt the design to
  existing templates instead of replacing the product structure blindly.

## Execution Checklist

1. Read current code and existing patterns.
2. Plan the smallest reversible change.
3. Implement in the owned surface only.
4. Run targeted lint/typecheck/tests.
5. For generated images, register static assets and verify previews are bundled.
6. For UI, verify in browser or simulator.
7. Run the security gate before final report.

## Verification Commands

- Web: `npm run lint`
- Web tests: `npm run test -- --exclude .claude/**`
- Shared: `npm run test:shared`
- Web typecheck: `npm run typecheck`
- Mobile lint: `npm --prefix apps/mobile run lint`
- Mobile typecheck: `npm --prefix apps/mobile run typecheck`
- Mobile simulator: `npm --prefix apps/mobile run ios`

## 90-Point Release Gate

Use this gate when the user asks for App Store readiness or a 90+ score:

```bash
zsh scripts/invitehub-release-gate.sh
```

Every surface must pass before claiming 90+:

- Product/PM: main user flow is template select -> builder -> preview -> publish/share.
- Marketing: Korean copy is natural and only claims shipped features.
- UI/UX: first screen is template-led, touch targets are usable, text does not overlap.
- Frontend: mobile lint, typecheck, focused tests, and release simulator build pass.
- Backend/API: authz, validation, JSON-only writes, payment/free-publish negative tests pass.
- Security: no hardcoded secrets, no high dependency audit findings, abuse controls documented.
- Store: production bundle id, production scheme, screenshots, privacy metadata, review notes ready.

## Final Report

Include:

- Result.
- Changed files.
- Verification evidence.
- Security gate result.
- Remaining risks.
- Next action only when it is concrete.
