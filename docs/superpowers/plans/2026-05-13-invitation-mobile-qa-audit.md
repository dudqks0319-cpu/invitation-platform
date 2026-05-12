# Invitation Mobile QA Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a pre-launch QA audit report that tells whether InviteHub works as a real Korean mobile invitation service across creation, preview, publishing, sharing, guest interaction, dashboard operations, and mobile/Expo flows.

**Architecture:** This is an audit workflow, not a product implementation. The work is split into evidence collection, automated verification, static flow review, browser/mobile viewport QA, platform integration review, and final report writing. The final report is the single deliverable, with P0/P1/P2 findings and launch-readiness recommendations.

**Tech Stack:** Next.js 16, React 19, Vitest, ESLint, TypeScript, Expo/React Native, Supabase, Kakao JavaScript SDK integration, local Browser or equivalent visual QA tooling.

---

## File Structure

Create these files during execution:

- `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`: final audit report.
- `docs/qa/evidence/2026-05-13-command-results.md`: command output summary and pass/fail notes.
- `docs/qa/evidence/2026-05-13-visual-checks.md`: viewport and route-by-route visual QA notes.
- `docs/qa/evidence/2026-05-13-platform-integrations.md`: Kakao, login, maps, export, GA4, Expo notes.

Do not modify product code while executing this plan. If a product bug is found, record it in the report with reproduction steps and recommended fix.

## Task 1: Prepare Audit Workspace

**Files:**
- Create: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`
- Create: `docs/qa/evidence/2026-05-13-command-results.md`
- Create: `docs/qa/evidence/2026-05-13-visual-checks.md`
- Create: `docs/qa/evidence/2026-05-13-platform-integrations.md`

- [ ] **Step 1: Confirm branch and clean state**

Run:

```bash
git branch --show-current
git status --short
git log -1 --oneline
```

Expected:

```text
codex/invitation-review-fixes
```

`git status --short` should be empty before audit evidence files are created. Record the latest commit hash in `docs/qa/evidence/2026-05-13-command-results.md`.

- [ ] **Step 2: Create QA evidence directories**

Run:

```bash
mkdir -p docs/qa/evidence
```

Expected: command exits with status 0.

- [ ] **Step 3: Create command evidence skeleton**

Add this exact structure to `docs/qa/evidence/2026-05-13-command-results.md`:

```markdown
# Command Results

Date: 2026-05-13
Branch: codex/invitation-review-fixes
Head:

## Automated Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Not run | Waiting for execution |
| `npm run lint` | Not run | Waiting for execution |
| `npm run typecheck` | Not run | Waiting for execution |
| `npm run lint --workspace @invitehub/mobile` | Not run | Waiting for execution |
| `npm run typecheck --workspace @invitehub/mobile` | Not run | Waiting for execution |
| `npx expo install --check` | Not run | Waiting for execution |
| `npx expo-doctor --verbose` | Not run | Waiting for execution |
| `npm audit --omit=dev --audit-level=high` | Not run | Waiting for execution |
| `git diff --check` | Not run | Waiting for execution |

## Known Structural Caveats

- Expo Doctor may report the existing non-CNG config sync warning because native `ios/` and `android/` folders exist with app config fields.
- Expo transitive `postcss` moderate advisory may remain if fixing it would force an Expo downgrade.
```

- [ ] **Step 4: Create visual QA evidence skeleton**

Add this exact structure to `docs/qa/evidence/2026-05-13-visual-checks.md`:

```markdown
# Visual QA Evidence

Date: 2026-05-13

## Viewports

- 360 x 800
- 390 x 844
- 430 x 932
- 768 x 1024
- 1440 x 900

## Routes

| Route | 360 | 390 | 430 | 768 | 1440 | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Not checked | Not checked | Not checked | Not checked | Not checked |  |
| `/builder` | Not checked | Not checked | Not checked | Not checked | Not checked |  |
| `/preview` | Not checked | Not checked | Not checked | Not checked | Not checked |  |
| `/checkout` | Not checked | Not checked | Not checked | Not checked | Not checked |  |
| `/dashboard` | Not checked | Not checked | Not checked | Not checked | Not checked |  |
| `/invitations/demo` | Not checked | Not checked | Not checked | Not checked | Not checked | Use available demo/public slug or note unavailable |
| `/dashboard/invitations/{id}/publish-recovery` | Not checked | Not checked | Not checked | Not checked | Not checked | Use available id or note unavailable |

## Visual Risk Notes

- Horizontal overflow:
- Text overlap:
- CTA visibility:
- Preview/public mismatch:
- Modal accessibility:
- Dashboard action density:
```

- [ ] **Step 5: Create platform integration evidence skeleton**

Add this exact structure to `docs/qa/evidence/2026-05-13-platform-integrations.md`:

```markdown
# Platform Integration Evidence

Date: 2026-05-13

## Kakao

| Item | Status | Evidence |
| --- | --- | --- |
| `NEXT_PUBLIC_KAKAO_JS_KEY` lookup | Not checked |  |
| Platform key precedence | Not checked |  |
| SDK script loading | Not checked |  |
| `Kakao.Share.sendDefault` payload | Not checked |  |
| Fallback to Web Share or clipboard | Not checked |  |
| Real device Kakao app share | Watch | Requires staging/production domain and physical device |

## Login

| Item | Status | Evidence |
| --- | --- | --- |
| Supabase auth route | Not checked |  |
| Social login provider readiness | Not checked |  |
| Logged-in mobile home state | Not checked |  |

## Maps And Payments

| Item | Status | Evidence |
| --- | --- | --- |
| Kakao map link | Not checked |  |
| Naver/Google map fallback expectations | Not checked |  |
| KakaoPay link hidden/visible behavior | Not checked |  |
| Store payment publish-blocked state | Not checked |  |

## Export And Analytics

| Item | Status | Evidence |
| --- | --- | --- |
| RSVP CSV download | Not checked |  |
| CSV privacy warning | Not checked |  |
| GA4 `trackEvent` no-op without `gtag` | Not checked |  |
| GA4 real collection | Watch | Requires deployed GA4 tag and DebugView |
```

- [ ] **Step 6: Commit evidence skeletons**

Run:

```bash
git add docs/qa/2026-05-13-invitation-mobile-qa-audit.md docs/qa/evidence/2026-05-13-command-results.md docs/qa/evidence/2026-05-13-visual-checks.md docs/qa/evidence/2026-05-13-platform-integrations.md
git commit -m "docs: scaffold invitation mobile QA audit"
```

Expected: commit succeeds. If the final report file is still empty, add the report skeleton from Task 7 Step 1 before committing.

## Task 2: Run Automated Verification

**Files:**
- Modify: `docs/qa/evidence/2026-05-13-command-results.md`

- [ ] **Step 1: Run web and shared tests**

Run:

```bash
npm test
```

Expected: all Vitest suites pass. Record test file count and test count in `docs/qa/evidence/2026-05-13-command-results.md`.

- [ ] **Step 2: Run web lint**

Run:

```bash
npm run lint
```

Expected: command exits with status 0. Record result.

- [ ] **Step 3: Run web typecheck**

Run:

```bash
npm run typecheck
```

Expected: command exits with status 0. Record result. If `next build --webpack` emits warnings, record the warning text.

- [ ] **Step 4: Run mobile lint**

Run:

```bash
npm run lint --workspace @invitehub/mobile
```

Expected: command exits with status 0. Record result.

- [ ] **Step 5: Run mobile typecheck**

Run:

```bash
npm run typecheck --workspace @invitehub/mobile
```

Expected: command exits with status 0. Record result.

- [ ] **Step 6: Run Expo dependency check**

Run:

```bash
cd apps/mobile
npx expo install --check
```

Expected: `Dependencies are up to date`. Record whether this used online or offline dependency map.

- [ ] **Step 7: Run Expo Doctor**

Run:

```bash
cd apps/mobile
npx expo-doctor --verbose
```

Expected: either 18/18 pass or the known 17/18 non-CNG config sync warning. Record exact output summary.

- [ ] **Step 8: Run audit with high threshold**

Run:

```bash
npm audit --omit=dev --audit-level=high
```

Expected: command exits with status 0. Record any remaining moderate advisories separately.

- [ ] **Step 9: Run whitespace diff check**

Run:

```bash
git diff --check
```

Expected: command exits with status 0.

- [ ] **Step 10: Commit command evidence**

Run:

```bash
git add docs/qa/evidence/2026-05-13-command-results.md
git commit -m "docs: record invitation QA command evidence"
```

Expected: commit succeeds.

## Task 3: Static Product Flow Review

**Files:**
- Modify: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`
- Modify: `docs/qa/evidence/2026-05-13-platform-integrations.md`

- [ ] **Step 1: Inspect first-visit and template code**

Read:

```bash
sed -n '1,260p' app/page.tsx
sed -n '1,260p' components/landing/template-browser.tsx
sed -n '1,220p' components/landing/template-browser.test.tsx
```

Record whether these are true:

- Landing explains mobile invitation creation, sharing, and RSVP operations.
- Template cards show free/photo-paid policy according to release flag.
- Template preview and use CTAs are visible and tested.
- Sticky category behavior has mobile overflow protection.

- [ ] **Step 2: Inspect builder and preview code**

Read:

```bash
sed -n '1,260p' components/builder/builder-studio.tsx
sed -n '260,620p' components/builder/builder-studio.tsx
sed -n '620,1220p' components/builder/builder-studio.tsx
sed -n '1,220p' components/builder/builder-live-preview.tsx
sed -n '1,160p' app/preview/page.tsx
```

Record whether these are true:

- Required fields are represented in a checklist.
- Missing-field items can move the user to the right step.
- Photo paid policy is visible before publish.
- Builder preview and public invitation share the same normalized payload assumptions.

- [ ] **Step 3: Inspect publish, recovery, and payment code**

Read:

```bash
sed -n '1,360p' components/payments/checkout-flow.tsx
sed -n '1,260p' components/payments/publish-recovery-panel.tsx
sed -n '1,260p' app/api/payments/free-publish/route.ts
sed -n '1,320p' app/api/payments/store/verify/route.ts
sed -n '1,260p' app/api/payments/publish-recovery/route.ts
```

Record whether these are true:

- Server validates publish readiness.
- Free publish rejects paid/photo payloads.
- Store verification distinguishes payment confirmed + publish blocked.
- Recovery requires owner and paid payment.
- Share/copy fallbacks exist.

- [ ] **Step 4: Inspect public invitation code**

Read:

```bash
sed -n '1,280p' app/invitations/[slug]/page.tsx
sed -n '1,640p' components/invitations/invitation-view.tsx
sed -n '1,220p' components/invitations/invitation-view.test.tsx
```

Record whether these are true:

- Public route only exposes published invitations.
- Kakao SDK share is isolated to public invitation share.
- Account copy gives feedback.
- RSVP no sets guest count to 0.
- Guestbook approval notice is clear.
- KakaoPay missing link does not render a dead link.

- [ ] **Step 5: Inspect dashboard operations code**

Read:

```bash
sed -n '1,680p' components/dashboard/dashboard-shell.tsx
sed -n '1,260p' components/dashboard/dashboard-shell.test.tsx
sed -n '1,220p' components/dashboard/dashboard-delete-policy.ts
```

Record whether these are true:

- Today-to-check summary exists.
- RSVP search/filter/full list exists.
- CSV download includes privacy warning.
- Status-specific actions do not mislead paid/recovery states.
- Mobile action density risk is acceptable or logged.

- [ ] **Step 6: Commit static review evidence**

Run:

```bash
git add docs/qa/2026-05-13-invitation-mobile-qa-audit.md docs/qa/evidence/2026-05-13-platform-integrations.md
git commit -m "docs: record invitation QA static review"
```

Expected: commit succeeds.

## Task 4: Browser And Mobile Viewport QA

**Files:**
- Modify: `docs/qa/evidence/2026-05-13-visual-checks.md`
- Modify: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`

- [ ] **Step 1: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Next.js starts and reports a local URL, usually `http://localhost:3000`. Keep the server running until Task 4 is complete.

- [ ] **Step 2: Confirm key routes respond**

In a second terminal, run:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/builder
curl -I http://localhost:3000/preview
curl -I http://localhost:3000/checkout
curl -I http://localhost:3000/dashboard
```

Expected: each route returns HTTP 200 or an expected auth redirect. Record exact status codes.

- [ ] **Step 3: Inspect landing and template UX in viewports**

Use Browser or equivalent visual tooling to open:

```text
http://localhost:3000/
```

Check 360 x 800, 390 x 844, 430 x 932, 768 x 1024, and 1440 x 900.

Record:

- hero copy visibility
- template card width
- sticky category tab behavior
- preview CTA visibility
- pricing/release flag copy
- horizontal overflow

- [ ] **Step 4: Inspect builder and preview visual consistency**

Use Browser or equivalent visual tooling to open:

```text
http://localhost:3000/builder
http://localhost:3000/preview
```

Record:

- builder step controls fit on mobile
- live preview does not crop critical text
- publish checklist stays readable
- preview page makes share limitations clear
- builder preview and preview page feel like the same invitation

- [ ] **Step 5: Inspect checkout and recovery screens**

Use Browser or equivalent visual tooling to open:

```text
http://localhost:3000/checkout
```

If a recovery invitation id is available, also open:

```text
http://localhost:3000/dashboard/invitations/{id}/publish-recovery
```

Record:

- free publish policy links fit on mobile
- share/copy CTAs are not misleading
- disabled state is understandable
- fallback message area is visible

- [ ] **Step 6: Inspect public invitation guest experience**

Use an available published slug. If no published slug exists locally, use the demo fallback route or record that no real published slug was available.

Open:

```text
http://localhost:3000/invitations/{slug}
```

Record:

- date/place visible quickly
- map CTA visible
- account copy feedback visible
- RSVP form fits and no-selection state is clear
- guestbook approval copy is visible
- share section is not confused with host-only tools

- [ ] **Step 7: Inspect dashboard operations**

Open:

```text
http://localhost:3000/dashboard
```

Record:

- today-to-check summary visibility
- row/card density at mobile widths
- RSVP filters and CSV controls fit
- destructive actions are not visually primary
- moderation section can be reached after selecting an invitation

- [ ] **Step 8: Stop local dev server**

Stop the server with `Ctrl-C` in the server terminal.

Expected: no dev server remains running for this audit task.

- [ ] **Step 9: Commit visual QA evidence**

Run:

```bash
git add docs/qa/evidence/2026-05-13-visual-checks.md docs/qa/2026-05-13-invitation-mobile-qa-audit.md
git commit -m "docs: record invitation visual QA evidence"
```

Expected: commit succeeds.

## Task 5: Kakao, Login, Export, And Korean Platform Fit

**Files:**
- Modify: `docs/qa/evidence/2026-05-13-platform-integrations.md`
- Modify: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`

- [ ] **Step 1: Inspect Kakao key and SDK path**

Run:

```bash
rg "NEXT_PUBLIC_KAKAO_JS_KEY|Kakao|sendDefault|kakaoJsKey" -n app components lib apps/mobile
```

Expected: output points to `app/invitations/[slug]/page.tsx`, `components/invitations/invitation-view.tsx`, and payload/config definitions. Record whether platform key overrides draft key.

- [ ] **Step 2: Inspect Kakao share payload**

Read:

```bash
sed -n '1,180p' components/invitations/invitation-view.tsx
sed -n '500,570p' components/invitations/invitation-view.tsx
```

Record:

- title, description, image URL, and web URL payload
- SDK load fallback
- native share fallback
- clipboard fallback
- any missing domain or app-key caveat

- [ ] **Step 3: Inspect login readiness**

Run:

```bash
rg "signInWithOAuth|provider|kakao|google|apple|Supabase" -n app components apps/mobile lib
```

Record whether web and mobile login expose Korean-friendly social login options. If Kakao login is not available, record it as `P1` or `P2` depending on how much the current auth flow blocks invitation publishing.

- [ ] **Step 4: Inspect maps and KakaoPay handling**

Run:

```bash
rg "kakaoMapLink|map.kakao.com|naver|google|kakaoPayLink|카카오페이" -n app components lib apps/mobile
```

Record:

- whether Kakao map link exists
- whether fallback search link exists
- whether Naver/Google expectations are documented or absent
- whether empty KakaoPay link is hidden or replaced with guidance

- [ ] **Step 5: Inspect RSVP export**

Run:

```bash
rg "CSV|csv|downloadRsvp|rsvp" -n components app lib
```

Record:

- CSV filename behavior
- UTF-8 BOM or Korean Excel compatibility
- privacy warning
- filter/search inclusion in exported rows

- [ ] **Step 6: Inspect GA4 event readiness**

Run:

```bash
sed -n '1,120p' lib/analytics.ts
rg "trackEvent\\(" -n app components lib
```

Record:

- tracked events
- no-op behavior without `gtag`
- missing deployed GA4 tag caveat
- DebugView verification requirement

- [ ] **Step 7: Commit platform integration evidence**

Run:

```bash
git add docs/qa/evidence/2026-05-13-platform-integrations.md docs/qa/2026-05-13-invitation-mobile-qa-audit.md
git commit -m "docs: record Korean platform integration QA"
```

Expected: commit succeeds.

## Task 6: Mobile App And Store Payment Flow Review

**Files:**
- Modify: `docs/qa/evidence/2026-05-13-platform-integrations.md`
- Modify: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`

- [ ] **Step 1: Inspect mobile home and template flow**

Read:

```bash
sed -n '1,260p' 'apps/mobile/app/(tabs)/index.tsx'
sed -n '1,260p' apps/mobile/components/home/HeroSection.tsx
sed -n '1,220p' apps/mobile/app/templates.tsx
```

Record:

- logged-in user button label
- "continue my invitation" placement
- new design scroll behavior
- template CTA clarity

- [ ] **Step 2: Inspect mobile builder steps**

Read:

```bash
sed -n '1,220p' apps/mobile/app/builder/step1-basic.tsx
sed -n '1,220p' apps/mobile/app/builder/step2-people.tsx
sed -n '1,260p' apps/mobile/app/builder/step3-photos.tsx
sed -n '1,260p' apps/mobile/app/builder/preview.tsx
```

Record:

- required field guidance
- photo paid policy
- preview and publish readiness
- publish CTA placement

- [ ] **Step 3: Inspect store purchase hook**

Read:

```bash
sed -n '1,320p' apps/mobile/hooks/useStorePurchase.ts
sed -n '1,240p' apps/mobile/components/payments/StorePurchaseCard.tsx
sed -n '1,220p' apps/mobile/lib/payments/store-verification.ts
```

Record:

- payment confirmed + publish blocked handling
- transaction finish timing
- user message for blocked publish
- recovery path clarity

- [ ] **Step 4: Commit mobile flow evidence**

Run:

```bash
git add docs/qa/evidence/2026-05-13-platform-integrations.md docs/qa/2026-05-13-invitation-mobile-qa-audit.md
git commit -m "docs: record mobile app QA evidence"
```

Expected: commit succeeds.

## Task 7: Write Final Audit Report

**Files:**
- Modify: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`

- [ ] **Step 1: Add final report skeleton**

Write this structure into `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`:

```markdown
# InviteHub Mobile Invitation QA Audit

Date: 2026-05-13
Branch: codex/invitation-review-fixes
Head:

## 1. Executive Summary

## 2. Launch Readiness Decision

Decision:

## 3. P0 Findings

No P0 findings confirmed yet.

## 4. P1 Findings

No P1 findings confirmed yet.

## 5. P2 Findings

No P2 findings confirmed yet.

## 6. Journey Status

| Journey | Status | Notes |
| --- | --- | --- |
| First visit | Not assessed |  |
| Template selection | Not assessed |  |
| Builder | Not assessed |  |
| Preview/public match | Not assessed |  |
| Publish/share | Not assessed |  |
| Guest RSVP/guestbook | Not assessed |  |
| Dashboard operations | Not assessed |  |
| Mobile app/Expo | Not assessed |  |

## 7. Viewport Status

| Viewport | Status | Notes |
| --- | --- | --- |
| 360 x 800 | Not assessed |  |
| 390 x 844 | Not assessed |  |
| 430 x 932 | Not assessed |  |
| 768 x 1024 | Not assessed |  |
| 1440 x 900 | Not assessed |  |

## 8. Korean Platform Fit

## 9. Marketing, Design, Developer, Operator Notes

## 10. Commands Run

## 11. Staging And Physical Device Checklist

## 12. Recommended Next Steps
```

- [ ] **Step 2: Fill executive summary**

Use the evidence files to write a concise summary with this shape:

```markdown
Current verdict: [Pass / Watch / Fix Recommended / Blocker]

InviteHub is strongest at:
- ...

Launch risk remains around:
- ...

The next best action is:
- ...
```

- [ ] **Step 3: Fill P0/P1/P2 findings**

For each finding, use this format:

```markdown
### P1-1. [Finding title]

Perspective: User / Guest / Designer / Marketer / Developer / Operator
Impact: [specific impact]
Reproduction: [exact route, viewport, or command]
Evidence: [file path or command evidence]
Recommendation: [specific next action]
```

If no findings exist in a priority, keep one sentence explaining why.

- [ ] **Step 4: Fill journey and viewport tables**

Use only one of these status values:

- `Pass`
- `Watch`
- `Fix Recommended`
- `Blocker`
- `Not Available Locally`

- [ ] **Step 5: Fill Korean platform fit section**

Cover:

- Kakao Talk share
- Kakao login or social login readiness
- KakaoPay link
- Kakao/Naver/Google map strategy
- RSVP CSV/Excel export
- GA4 collection readiness

- [ ] **Step 6: Fill physical device checklist**

Include this checklist exactly:

```markdown
- [ ] Kakao Developers에 staging/production domain 등록
- [ ] 실제 iPhone Safari에서 공개 초대장 열기
- [ ] 실제 Android Chrome에서 공개 초대장 열기
- [ ] 카카오톡 인앱 브라우저에서 공개 초대장 열기
- [ ] 카카오톡 공유창 실제 호출 확인
- [ ] 링크 복사 권한 거부 상태 확인
- [ ] RSVP 제출 후 대시보드 반영 확인
- [ ] CSV 파일을 macOS Numbers와 Windows Excel에서 열기
- [ ] 스토어 결제 보류 후 발행 복구 확인
- [ ] GA4 DebugView에서 주요 이벤트 수집 확인
```

- [ ] **Step 7: Commit final report**

Run:

```bash
git add docs/qa/2026-05-13-invitation-mobile-qa-audit.md
git commit -m "docs: complete invitation mobile QA audit"
```

Expected: commit succeeds.

## Task 8: Final Verification And Handoff

**Files:**
- Modify: `docs/qa/2026-05-13-invitation-mobile-qa-audit.md`
- Modify: `docs/qa/evidence/2026-05-13-command-results.md`

- [ ] **Step 1: Run final document checks**

Run:

```bash
rg "Not run|Not checked|Not assessed|T[B]D|TO[D]O|FIX[M]E" docs/qa
```

Expected: no incomplete-marker matches. `Not Available Locally` is allowed only for flows requiring real staging data or physical devices. Replace remaining `Not run`, `Not checked`, and `Not assessed` with actual results or explicit `Not Available Locally` notes.

- [ ] **Step 2: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: command exits with status 0.

- [ ] **Step 3: Run staged secret scan**

Run after staging final docs:

```bash
git add docs/qa
gitleaks protect --staged --no-banner
```

Expected: no leaks found.

- [ ] **Step 4: Commit final evidence cleanup if needed**

Run only if Step 1 or Step 2 changed files:

```bash
git add docs/qa
git commit -m "docs: finalize invitation QA audit evidence"
```

Expected: commit succeeds or there are no changes to commit.

- [ ] **Step 5: Produce user handoff**

Final response should include:

- current branch and final commit hash
- final readiness verdict
- P0/P1/P2 counts
- highest-risk remaining items
- commands run
- physical-device checks still required
- file links to final report and evidence

## Self-Review

Spec coverage:

- User, guest, designer, marketer, developer, and operator perspectives are covered in Tasks 3, 4, 5, 6, and 7.
- Landing, template, builder, preview, publish, share, RSVP, guestbook, dashboard, mobile app, Expo, Kakao, login, maps, export, and GA4 are covered.
- The plan creates evidence files before final report writing, so claims can be traced to commands or route checks.

Placeholder scan:

- No incomplete task instructions remain.
- `Not run`, `Not checked`, and `Not assessed` appear only as initial evidence seed values that Task 8 explicitly requires replacing.

Scope check:

- The plan does not implement product changes.
- Product bugs are recorded as findings with reproduction and recommendation.
- Physical-device Kakao app validation is explicitly separated from local audit work.
