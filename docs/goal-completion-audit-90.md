# InviteHub Goal Completion Audit - 90점 Release Readiness

Date: 2026-05-01
Latest update: 2026-05-01 18:06 KST

## Objective

InviteHub 앱을 App Store 제출 기준으로 프론트엔드, 백엔드, UI/UX, API,
보안, 스토어 제출 영역 모두 90점 이상 상태까지 끌어올리고, 각 영역별
하네스와 검증 증거를 남긴다.

## Concrete Success Criteria

- Frontend: Expo mobile lint/typecheck/tests and iOS Release simulator build pass.
- UI/UX: Home is simple and template-first; template selection opens a prefilled
  builder; preview renders a fixed invitation template canvas with editable text
  overlaid.
- Backend/API: publish/payment/template APIs validate input, enforce ownership,
  and have negative-path tests.
- Security: no hardcoded secrets, no high/critical dependency audit findings,
  authz/validation/rate-limit controls are documented and tested.
- Store: production bundle id/scheme/EAS profile/native Release settings align,
  and App Store Connect/TestFlight evidence exists for the current build.
- Harness: product, marketing, image, UX, mobile frontend/backend, API, security,
  QA, and store-manager surfaces are represented with concrete verification
  commands.
- Evidence: command output, screenshots, and external console state are captured
  before marking the goal complete.

## Prompt-to-Artifact Checklist

| Requirement | Artifact | Evidence | Status |
| --- | --- | --- | --- |
| Frontend 90+ | `apps/mobile/components/home/HeroSection.tsx`, `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/components/invitation/InvitationPreviewCard.tsx` | Latest iOS Release simulator build succeeded with 0 errors and 2 warnings; Release app opened on iPhone 17 as `com.invitehub.app`. | Pass locally |
| Simple first page | `apps/mobile/app/(tabs)/index.tsx`, bundled template previews | Release screenshot `/private/tmp/invitehub-release-home-current.png` shows a simple template-led first page with `청첩장`, `돌잔치`, `브라이덜샤워`, `환갑잔치`, and party sections in the accessibility tree. | Pass |
| Fixed template canvas preview | `InvitationPreviewCard.tsx`, `apps/mobile/lib/template-preview-source.ts`, `apps/mobile/lib/template-preview-manifest.ts`, `apps/mobile/assets/template-previews/custom/other/*.jpeg` | Screenshot `/private/tmp/invitehub-preview-fit-to-viewport.png` shows a fixed floral template canvas with name/date/venue/message overlaid, not a generated faux card. All 31 mobile templates now resolve to blank editable canvases rather than sample-text thumbnails. | Pass |
| Preview first-screen fit | `InvitationPreviewCard.tsx`, `apps/mobile/app/builder/preview.tsx` | Builder preview uses `fitToViewport`, and iPhone 17 Release screenshot `/private/tmp/invitehub-preview-fit-to-viewport.png` shows the whole invitation canvas before the map section starts. | Pass |
| Localized invitation date | `apps/mobile/lib/date-time.ts`, `apps/mobile/lib/date-time.test.ts` | Date display is formatted by a local Korean formatter, avoiding raw ISO strings such as `2026-05-01T16:00` in preview. | Pass |
| Template selection opens usable builder | `apps/mobile/lib/drafts.ts`, `apps/mobile/lib/invitation-shared.ts` | Simulator tap: `로즈 골드 보더 디자인 선택` opened Step 1 with title, date, venue, address, message, and names prefilled; continued through Step 5 to preview. | Pass |
| Map behavior without API key | `apps/mobile/lib/map-links.ts`, `InvitationPreviewCard.tsx` | Preview and Step 5 show Kakao/Naver buttons. Code generates search links from venue/address when explicit map URLs are blank, so embedded map API is not required for this release path. | Pass |
| Backend 90+ | Supabase ownership filters, publish/payment routes | `npm run test -- --exclude=**/.claude/**` passed 52 files / 152 tests, including guest publish, RSVP, guestbook, account deletion, public assets, and payment routes. | Pass locally |
| API 90+ | `app/api/payments/free-publish/route.ts`, `app/api/payments/store/verify/route.ts`, `app/api/templates/route.ts` | Focused mobile/API gate passed 9 files / 30 tests, including JSON validation, auth, ownership, store verification, and template API tests. | Pass locally |
| Security 90+ | `docs/security-gate-90.md`, `package-lock.json`, `lib/supabase/public-write.ts`, route tests | Local security gate documents no hardcoded production secrets, explicit authz, JSON/body validation, RLS, rate limits, negative tests, and a fresh `npm audit --audit-level=high` exit 0 with no high/critical findings. | Pass locally |
| Store config 90+ | `apps/mobile/app.config.ts`, `apps/mobile/eas.json`, native project | Production bundle id is `com.invitehub.app`; production scheme is `invitehub`; dev scheme is `invitehub-dev`; Xcode is 26.3. | Pass |
| Harness 90+ | `.claude/skills/invitehub-app-builder/skill.md`, `docs/invitehub-app-harness.md`, `scripts/invitehub-release-gate.sh` | Release gate covers lint, typecheck, tests, high audit, iOS Release simulator build. | Pass |
| Role harness coverage | `.claude/agents/*.md`, `.claude/skills/invitehub-app-builder/skill.md` | Verified agents exist: product-manager, marketing-copywriter, template-image-art-director, ux-designer, mobile-frontend-engineer, mobile-backend-engineer, api-integrator, security-engineer, qa-engineer, store-manager. | Pass |
| Verification evidence | Release gate output, simulator screenshots | `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh` passed web lint, web typecheck, 52-file web/API suite, mobile lint, mobile typecheck, and focused 9-file mobile/API tests. Escalated iOS Release build also passed separately. Screenshots: `/private/tmp/invitehub-release-home-current.png`, `/private/tmp/invitehub-preview-fit-to-viewport.png`. Screenshot size verifier passed for `output/store-screenshots-verified/05-preview-fit-to-viewport.png`. | Pass with audit caveat |
| App Store privacy/IAP map | `app/privacy/page.tsx`, `app/support/page.tsx`, `app/terms/page.tsx`, `app/faq/page.tsx`, `docs/app-store-readiness-90.md`, `docs/store-submission-metadata.md` | Bundle ID, production scheme, IAP product ID, privacy-label basis, support/privacy/terms URL content, map-link behavior, and env mapping are documented. | Pass |
| Current EAS/TestFlight evidence | EAS build list, EAS build command | Latest finished iOS STORE build is build 11 from 2026-04-23 and old commit `028cd04`; it does not include current 90점 changes. New `eas build --profile testflight --platform ios --non-interactive` requires explicit user approval because it uploads current project code to Expo/EAS. | Blocked on user approval |
| App Store Connect execution checklist | `docs/app-store-connect-execution-checklist.md`, `docs/store-screenshot-plan.md` | Official Apple submission/privacy/upcoming-requirements pages checked on 2026-05-01; EAS, TestFlight, IAP, privacy labels, screenshots, and review notes are mapped to required evidence. | Pass |
| App Review metadata accuracy | `docs/apple-review.md`, `docs/store-submission-metadata.md`, `docs/store-screenshot-plan.md` | Review notes now avoid claiming unverified profanity filter/report/block features. They document the implemented path: rate-limited RSVP/guestbook, host-approved guestbook publishing, and dashboard hide/approve moderation. | Pass |
| App Store Connect evidence | ASC metadata/privacy/IAP/screenshot save state | Not verified in App Store Connect in this run. | Missing |

## Completion Verdict

The local codebase is close to the 90+ release bar and the latest UI complaint
about the invitation preview has been fixed and simulator-verified.

The full active goal is not complete yet because:

- The current changes have not been uploaded as a new EAS/TestFlight build.
- App Store Connect metadata, privacy labels, screenshots, and IAP product
  approval/save state have not been verified.

## Next Required Action

Start a new iOS EAS `testflight` build from the current workspace with
auto-submit, then verify the resulting build in TestFlight/App Store Connect.

Do not mark the goal complete until:

- A current EAS build for these changes finishes successfully.
- The build is selectable or installed in TestFlight.
- App Store Connect metadata, privacy labels, screenshots, review notes, and IAP
  product state are verified.
- App Store Connect processing shows the build is available to internal testers.

## Latest Local Evidence

- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`:
  web lint, web typecheck, 52-file web/API test suite, mobile lint, mobile
  typecheck, and focused 9-file mobile/API tests passed.
- Escalated iOS Release simulator build:
  `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`;
  passed with 0 errors and 2 warnings; installed and opened `com.invitehub.app`
  on iPhone 17.
- `npm run test -- --exclude=**/.claude/**`: 52 test files / 152 tests passed.
- Focused mobile/API tests: 9 test files / 30 tests passed.
- Latest Release home screenshot:
  `/private/tmp/invitehub-release-home-current.png`.
- Latest fixed template preview screenshot from real Simulator taps:
  `/private/tmp/invitehub-preview-fit-to-viewport.png`.
- Latest post-canvas Release screenshot from real Simulator taps:
  `/private/tmp/invitehub-post-canvas-preview.png`; copied to
  `output/store-screenshots-verified/06-preview-fixed-canvas.png`.
- Blank editable canvas coverage:
  `apps/mobile/lib/template-preview-source.test.ts` now requires every mobile
  template to have a blank canvas asset; missing housewarming, baby, graduation,
  and business canvases were generated under
  `apps/mobile/assets/template-previews/custom/other/`.
- Latest escalated iOS Release simulator build after the preview fit update:
  `npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler`;
  passed with 0 errors and 2 warnings.
- Verified screenshot size command:
  `scripts/verify-store-screenshots.sh output/store-screenshots-verified`;
  passed for `05-preview-fit-to-viewport.png` and
  `06-preview-fixed-canvas.png` at `1206x2622`.
- Fresh dependency audit:
  `npm audit --audit-level=high` exited 0 on 2026-05-01 18:06 KST. Current
  audit output has moderate-only transitive findings for PostCSS and uuid in
  Expo/Next tooling chains.
- `zsh scripts/capture-store-screenshots.sh output/store-screenshots-current`
  generated six images, but `simctl openurl` can trigger an iOS "Open in
  InviteHub" confirmation prompt. Treat that script as a capture helper, not
  final App Store screenshot evidence unless the prompt is manually cleared
  before each route capture.
- External execution checklist: `docs/app-store-connect-execution-checklist.md`.
- Security gate: `docs/security-gate-90.md`.

## Current Blocker

The next external build command is:

```bash
cd /Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile
eas build --profile testflight --platform ios --non-interactive
```

This command uploads the current project code and metadata to Expo/EAS. It must
not be run until the user explicitly approves that external code export.

Use `--auto-submit` for the TestFlight upload path so the completed iOS artifact
is sent to App Store Connect:

```bash
cd /Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile
eas build --profile testflight --platform ios --non-interactive --auto-submit --what-to-test "InviteHub template-first invitation builder, fixed canvas preview, map links, privacy/support copy, and store release checks."
```
