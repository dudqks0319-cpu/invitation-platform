# InviteHub App Development Harness

This harness is advisory project guidance for Claude/Codex-style agents. It does
not replace the root `AGENTS.md`; when instructions conflict, follow `AGENTS.md`
and the active user request first.

## Recommended Base

Primary harness: `harness-100-main/ko/17-mobile-app-builder`

Reason: InviteHub is primarily a mobile invitation app with template selection,
editor, preview, publishing, sharing, and store-release work.

Use these overlays when relevant:

- `ko/16-fullstack-webapp`: Next.js, Supabase, API, auth, admin, publishing.
- `ko/36-design-system`: template visual system, editor controls, consistency.

## Product Scope

InviteHub is a Korean invitation platform:

- Mobile app: Expo / React Native under `apps/mobile`.
- Web/admin/publishing: Next.js app in the repository root.
- Data/auth/storage: Supabase and shared TypeScript contracts.
- Release path: simulator QA, real-device QA, TestFlight, App Store metadata.

## Team Roles

Use the smallest useful team. For one focused change, one implementer plus one
verification pass is enough.

- `product-manager`: user problem, acceptance criteria, scope, launch priority,
  and App Store readiness tradeoffs.
- `marketing-copywriter`: Korean product messaging, template naming,
  conversion copy, App Store copy, and tone consistency.
- `template-image-art-director`: GPT image model prompts, template preview
  art direction, asset acceptance, and visual consistency.
- `ux-designer`: invitation flows, template gallery, editor ergonomics,
  preview/publish/share, accessibility, touch targets, visual hierarchy.
- `mobile-frontend-engineer`: Expo / React Native screens, components,
  navigation, state, accessibility, and simulator-visible polish.
- `mobile-backend-engineer`: mobile-facing API contracts, Supabase reads/writes,
  offline drafts, publish/share data, store entitlement wiring.
- `app-developer`: Expo / React Native implementation in `apps/mobile`.
- `api-integrator`: Supabase, Next.js API, shared types, upload/publish/RSVP
  contracts, auth boundaries.
- `security-engineer`: secrets, authz, validation, abuse controls, privacy,
  and release security gate.
- `store-manager`: bundle identifiers, EAS/App Store Connect, privacy labels,
  screenshots, TestFlight readiness.
- `qa-engineer`: simulator/device validation from the user's point of view.
- `backend-web-guardian`: Next.js admin/publishing surface, validation,
  rate limits, and web regressions.

## Default Pipeline

1. Restate the concrete user outcome and acceptance criteria in Korean.
2. Inspect the current code before changing files.
3. Choose role coverage:
   - Broad product/mobile feature: `product-manager` -> `marketing-copywriter`
     -> `template-image-art-director` -> `ux-designer` ->
     `mobile-frontend-engineer` -> `mobile-backend-engineer` ->
     `security-engineer` -> `qa-engineer`.
   - UI/mobile feature: `marketing-copywriter` ->
     `template-image-art-director` -> `ux-designer` ->
     `mobile-frontend-engineer` -> `qa-engineer`.
   - Template image work: `template-image-art-director` ->
     `mobile-frontend-engineer` -> `qa-engineer`.
   - Publish/API/auth feature: `api-integrator` -> `app-developer` or
     `backend-web-guardian` -> `qa-engineer`.
   - Release task: `store-manager` -> `security-engineer` -> `qa-engineer`.
4. Keep edits scoped to the requested feature and existing app patterns.
5. Verify with the smallest command set that proves the claim.
6. Report changed files, verification, security controls, and residual risk.

## File Ownership

- Mobile app: `apps/mobile/app`, `apps/mobile/components`,
  `apps/mobile/lib`, `apps/mobile/hooks`, `apps/mobile/assets`.
- Web/admin/publishing: `app`, `components`, `lib`, `css`, `public`.
- Shared contracts: `packages/shared`.
- Supabase: `supabase`.
- Release/docs: `docs`, `eas.json`, `apps/mobile/app.config.ts`,
  native project files when present.
- Generated template previews:
  `apps/mobile/assets/template-previews/generated/**`,
  `apps/mobile/lib/template-preview-manifest.ts`, and
  `apps/mobile/lib/template-preview-source.ts`.

## Template Image Pipeline

When GPT image model output is used for a template preview:

1. Generate a vertical invitation preview image with no brand watermark.
2. Prefer 4:5 or 9:16 source art, then export an app-ready `.jpg`.
3. Save it under
   `apps/mobile/assets/template-previews/generated/<category>/<template-id>.jpg`.
4. Register the template id in `apps/mobile/lib/template-preview-manifest.ts`.
5. Add the static `require(...)` entry in
   `apps/mobile/lib/template-preview-source.ts`.
6. Verify `apps/mobile/lib/template-preview-source.test.ts` and simulator UI.

For App Store stability, bundled assets are preferred over remote image URLs.

Do not modify `.claude/worktrees/*` unless the user explicitly asks to inspect
or clean those generated worktrees.

## Verification Matrix

Use exact scripts when available:

- Web lint: `npm run lint`
- Web tests: `npm run test -- --exclude .claude/**`
- Shared type test: `npm run test:shared`
- Web build/typecheck: `npm run typecheck`
- Mobile lint: `npm --prefix apps/mobile run lint`
- Mobile typecheck: `npm --prefix apps/mobile run typecheck`
- Mobile simulator: `npm --prefix apps/mobile run ios`

For visual/mobile changes, build success alone is not enough. Capture at least
one simulator or browser screenshot and verify the real flow: template select,
edit, preview, publish/share, and error states as applicable.

## Security Gate

Before final handoff, check:

- No hardcoded secrets or leaked tokens in logs.
- Auth and authorization are explicit for private/admin/publish actions.
- User input is validated with typed schemas or equivalent guards.
- Uploads, RSVP, guestbook, and publish endpoints have abuse controls.
- Sensitive invitation/guest data is minimized and redacted in logs.
- Negative-path tests or manual checks cover rejected input and denied access.

Document residual risks with an owner and due date when a risk remains.

## Handoff Format

Use Korean by default:

- Result: what changed and current state.
- Changed files: concise list.
- Verification: commands run and outcome.
- Security: controls checked and remaining risks.
- Next actions: only concrete follow-ups that matter.
