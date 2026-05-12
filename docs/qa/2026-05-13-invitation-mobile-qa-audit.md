# InviteHub Mobile Invitation QA Audit

Date: 2026-05-13
Branch: codex/invitation-review-fixes
Head at execution start: fdc623c docs: scaffold invitation mobile QA audit

## 1. Executive Summary

Current verdict: Launch hold, PR is close.

InviteHub now feels much closer to a Korean mobile invitation operations product than a generic builder. Landing, template cards, builder readiness, checkout, public invitation, dashboard operations, RSVP export, and Expo checks are all materially stronger than the earlier branch state.

No P0 issue was confirmed in this audit. The remaining blockers are P1 launch-quality risks around editing published invitations, demo values appearing as real input, Kakao/share fallback reliability, CSV injection, auth context preservation, mobile local draft isolation, and native login readiness.

The next best action is to fix the P1 list below, then run one staging pass on real iPhone Safari, Android Chrome, and KakaoTalk in-app browser.

## 2. Launch Readiness Decision

Decision: Do not launch to public traffic yet.

Merge/QA candidate: yes, if this branch is meant to continue hardening behind staging.

Production launch: hold until P1 findings are fixed and real-device Korean platform checks pass.

## 3. P0 Findings

No P0 findings confirmed.

## 4. P1 Findings

### P1-1. Published invitation edit can collide with unique `slug`

- Surface: host edits an already published invitation from dashboard.
- Evidence: `components/builder/builder-studio.tsx:609`, `components/builder/builder-studio.tsx:649`, `supabase/schema.sql:13`.
- Risk: the builder can attempt to create or save with an existing slug while the database enforces unique slug. Host sees a failed save after editing a live invitation.
- Fix direction: separate published revision editing from new draft insert, or generate a new draft slug/version and only promote it after publish confirmation.

### P1-2. Builder demo values still behave like real input values

- Surface: first-time builder at `/builder`.
- Evidence: `lib/invitation-payload.ts:73-120` fills title/date/venue/names with demo values; `components/builder/builder-studio.tsx:785-835` renders them as `value`.
- Browser evidence: `/builder` at `390 x 844` rendered `결혼식 초대장`, `2026-04-12T14:00`, `서울 더파인 웨딩홀`, `홍길동`, `김부인` as actual input values.
- Risk: users think the invitation is complete, then publish readiness rejects the same placeholder-like values. This feels like a broken validation loop.
- Fix direction: keep real payload fields empty, move examples into `placeholder`, and show demo copy only inside a clearly labeled preview mode.

### P1-3. Public invitation share/copy fallback is weaker than checkout/recovery

- Surface: guest or host opens `/invitations/[slug]` and taps `카카오톡 공유` or `링크 복사`.
- Evidence: `components/invitations/invitation-view.tsx:154-157`, `components/invitations/invitation-view.tsx:532-546`, `components/invitations/invitation-view.tsx:552-561`.
- Risk: if Kakao SDK is unavailable, `navigator.share` rejects, or clipboard permission is blocked, users may get no reliable prompt-based fallback. This is especially risky inside KakaoTalk in-app browser and mobile Safari.
- Fix direction: apply the existing `copyTextWithFallback` style to public invitation share/copy and catch native share rejection before falling back to clipboard/prompt.

### P1-4. RSVP CSV export is vulnerable to formula injection

- Surface: host downloads RSVP CSV and opens it in Excel/Sheets.
- Evidence: `components/dashboard/dashboard-shell.tsx:27-44`, `components/dashboard/dashboard-shell.tsx:333-345`, public RSVP accepts guest name at `components/invitations/invitation-view.tsx:443-448`.
- Risk: a guest can submit a name or memo starting with `=`, `+`, `-`, or `@`; spreadsheet apps may interpret it as a formula.
- Fix direction: escape formula-leading cells before CSV generation, for example by prefixing a tab or apostrophe after normal CSV quote escaping.

### P1-5. Auth redirect loses invitation context

- Surface: logged-out user opens `/checkout?invitationId=...` or `/dashboard/invitations/{id}/publish-recovery`.
- Evidence: `app/checkout/page.tsx:21-23`, `app/dashboard/invitations/[id]/publish-recovery/page.tsx:25-27`.
- Risk: after sign-in, the user returns to `/checkout` or `/dashboard` without the specific invitation id. This can break payment/recovery flows at the most sensitive moment.
- Fix direction: preserve the full current path and query in `next`, not only the generic destination.

### P1-6. Public invitation can expose host/editor fallback copy to guests

- Surface: public invitation with missing contact/account/KakaoPay data.
- Evidence: `components/invitations/invitation-view.tsx:333-366`, browser `/invitations/kim-lee-demo` at `390 x 844`.
- Risk: guests see "연락처를 입력해 주세요.", "계좌 정보를 입력해 주세요.", or "카카오페이 송금 링크가 등록되지 않았습니다." That reads like an unfinished editor screen.
- Fix direction: hide optional empty sections on public pages, or use neutral guest copy such as "등록된 연락처가 없습니다." only where disclosure is useful.

### P1-7. Mobile local drafts are not isolated by account/session

- Surface: shared device, logout/login switch, anonymous-to-account transition.
- Evidence: `apps/mobile/lib/drafts.ts:80-83`, `apps/mobile/app/(tabs)/my-invitations.tsx:33-47`, `apps/mobile/app/builder/step1-basic.tsx:30`.
- Risk: local drafts from one user can appear to another user on the same device because listing returns all local drafts.
- Fix direction: namespace local storage by user/session and filter list results by current owner id.

### P1-8. Mobile Google login readiness can fail Android-only setup

- Surface: Android app with only web client id configured.
- Evidence: `apps/mobile/lib/auth-native-config.ts:8-13`, `apps/mobile/hooks/useAuth.ts:60-83`.
- Risk: readiness requires iOS client/url scheme values even on Android, so Android Google login can be incorrectly blocked.
- Fix direction: split native Google readiness by platform and validate only the platform-specific fields required for the current device.

### P1-9. Public invitation page can crash when admin client is unavailable

- Surface: public invitation in an environment without `SUPABASE_SERVICE_ROLE_KEY`.
- Evidence: `app/invitations/[slug]/page.tsx:115-136`, `app/invitations/[slug]/page.tsx:193-205`.
- Risk: invitation loading can fall back to server client, but guestbook loading later calls `(admin ?? createSupabaseAdminClient())!`, which can null-dereference.
- Fix direction: reuse the same safe client, or skip guestbook loading with a controlled empty state when admin access is unavailable.

## 5. P2 Findings

- RSVP duplicate handling can overwrite 동명이인 responses when phone is omitted: `app/api/public/[slug]/rsvp/route.ts:98-124`.
- View count dedupe uses user-agent only, so many iOS/KakaoTalk users can be undercounted: `app/invitations/[slug]/page.tsx:96-112`.
- Mobile "운영 화면 열기" routes by `serverId ?? localId`; offline or anonymous flows can fail remote-first lookup before stable local fallback: `apps/mobile/app/(tabs)/my-invitations.tsx:146-149`.
- Apple IAP verification environment uses `__DEV__` only, which can be wrong for TestFlight/preview: `apps/mobile/hooks/useStorePurchase.ts:104-114`.
- Mobile OAuth callback helper always returns `invitehub://auth/callback` while development app config can use `invitehub-dev`: `apps/mobile/lib/supabase.ts:25-27`, `apps/mobile/app.config.ts:7-13`.
- Kakao map mobile custom-scheme inputs lack web fallback when the Kakao app is not installed: `apps/mobile/lib/map-links.ts:55-64`, `apps/mobile/app/builder/step5-location.tsx:131-138`.
- KakaoPay URL normalization is weak for inputs without a scheme, such as `qr.kakaopay.com/...`.
- `.env.example` and README omit `NEXT_PUBLIC_KAKAO_JS_KEY`, so real KakaoTalk Share can be missed in deployment setup.
- GA4 `trackEvent` calls exist, but `app/layout.tsx` does not inject GA4/GTM. Production collection depends on external deployment setup.
- Direct `/checkout` without invitation context shows a disabled publish button but no clear "go back to builder/select invitation" recovery action.
- Privacy/terms pages are useful, but still need Korean service legal review for processor, retention, deletion, dispute, and contact details.

## 6. Journey Status

| Journey | Status | Notes |
| --- | --- | --- |
| First visit | Pass | Landing communicates "mobile invitation + RSVP operations" clearly. Korean market references show this is the right positioning. |
| Template selection | Pass | Template card policy/feature copy is present and release-flag aware. |
| Builder | Watch | Layout passes, but real input fields still contain demo defaults. |
| Preview/public match | Watch | Same component surface is used, but preview/demo data can look too real and public optional empty sections expose editor copy. |
| Publish/share | Watch | Checkout/recovery sharing is stronger; public invitation share still needs robust fallback and real Kakao SDK staging test. |
| Guest RSVP/guestbook | Watch | UX basics work; CSV injection and duplicate response policy need hardening. |
| Dashboard operations | Pass with Watch | Empty state, "today to check", RSVP CSV, and moderation sections are present. Data-filled row action density still needs device QA. |
| Mobile app/Expo | Watch | Lint/typecheck/Expo checks pass except known Expo Doctor caveat; local draft isolation and native login readiness remain. |

## 7. Viewport Status

| Viewport | Status | Notes |
| --- | --- | --- |
| 360 x 800 | Pass with Watch | No global overflow on sampled routes. Builder/demo and public guest-copy issues remain. |
| 390 x 844 | Pass with Watch | Main evidence viewport. No global overflow reproduced across core routes. |
| 430 x 932 | Pass with Watch | Landing and public invitation sampled without overflow. |
| 768 x 1024 | Pass | Dashboard sampled without overflow. |
| 1440 x 900 | Pass | Landing sampled without overflow. |

## 8. Korean Platform Fit

InviteHub has the right Korean service primitives: Kakao login path, KakaoTalk share path, Naver/Kakao maps, KakaoPay link field, account copy, RSVP, guestbook, dashboard CSV, and mobile app store-purchase recovery.

The Korean-market gap is not "build everything from scratch". Kakao Developers already provides KakaoTalk Share through the JavaScript SDK and Kakao Login through OAuth/SDK flows; Naver and Kakao map links can be external web/app links; React Native can use the system share sheet. InviteHub should lean on those platform SDKs, but the app must make configuration and fallback behavior production-grade.

Practical expectation from Korean invitation services sampled: Kakao/SMS/SNS sharing, RSVP, maps, account copy, guestbook, QR or link sharing, and Excel-compatible response export. InviteHub covers most of this; missing pieces are QR sharing, hard Kakao setup documentation, CSV injection safety, and real-device in-app browser QA.

## 9. Marketing, Design, Developer, Operator Notes

Marketing:
- Positioning is now credible: "mobile invitation creation + RSVP operations".
- "5 minutes" copy should be validated with a real first-time user test or softened.
- GA4 events are not enough until GA4/GTM script loading is present and DebugView confirms collection.

Design:
- Layout did not break in sampled viewports.
- The most visible design trust issue is not spacing; it is semantic polish: demo values and guest-facing "input missing" copy.
- Public invitation optional sections should be hidden or redesigned so guests never see editor instructions.

Developer:
- Automated checks are healthy.
- The risky implementation seams are state identity: published edit revision, auth redirect target, local draft owner, RSVP duplicate key, and admin-client fallback.
- Kakao, Google, and Apple flows need platform-specific config tests instead of generic "configured/not configured" booleans.

Consumer/host:
- Host can understand the product value quickly.
- Host may still be confused by demo defaults and failed edit/save after publication.
- Guest can find RSVP/maps/share, but missing optional fields and share failure paths can make the invitation feel unfinished.

## 10. Commands Run

See `docs/qa/evidence/2026-05-13-command-results.md`.

Summary:
- `npm test`: pass, 70 files / 208 tests.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run lint --workspace @invitehub/mobile`: pass.
- `npm run typecheck --workspace @invitehub/mobile`: pass.
- `npx expo install --check`: pass.
- `npx expo-doctor --verbose`: watch, 17/18 with known non-CNG config sync warning.
- `npm audit --omit=dev --audit-level=high`: pass at high threshold; Expo transitive `postcss` moderate advisory remains.
- `git diff --check`: pass.

## 11. External References Checked

- Kakao Developers KakaoTalk Share JavaScript SDK: https://developers.kakao.com/docs/latest/en/kakaotalk-share/js-link
- Kakao Developers Kakao Login tutorial: https://developers.kakao.com/docs/latest/en/tutorial/login
- Naver Cloud Naver Maps URL scheme: https://guide.ncloud-docs.com/docs/en/maps-url-scheme
- Kakao Maps web guide and URL patterns: https://apis.map.kakao.com/web/guide/
- Korean invitation market references sampled: Paper Moments, Snap Post, MakeInvite, Makedear, PageSisters.

## 12. Staging And Physical Device Checklist

- [ ] Kakao Developers에 staging/production domain 등록
- [ ] `NEXT_PUBLIC_KAKAO_JS_KEY` 배포 환경 주입 및 README/.env 예시 반영
- [ ] 실제 iPhone Safari에서 공개 초대장 열기
- [ ] 실제 Android Chrome에서 공개 초대장 열기
- [ ] 카카오톡 인앱 브라우저에서 공개 초대장 열기
- [ ] 카카오톡 공유창 실제 호출 확인
- [ ] 링크 복사 권한 거부 상태 확인
- [ ] RSVP 제출 후 대시보드 반영 확인
- [ ] CSV 파일을 macOS Numbers와 Windows Excel에서 열기
- [ ] 스토어 결제 보류 후 발행 복구 확인
- [ ] GA4 DebugView에서 주요 이벤트 수집 확인

## 13. Recommended Next Steps

1. Fix P1-1 through P1-5 first: published edit collision, demo defaults, public share fallback, CSV injection, auth redirect context.
2. Fix P1-6 through P1-9 next: public optional copy, mobile draft isolation, Android Google readiness, admin-client null fallback.
3. Add tests for CSV formula escaping, full `next` redirect preservation, public share fallback, and empty optional public sections.
4. Run staging real-device QA for KakaoTalk share, KakaoTalk in-app browser, iOS Safari, Android Chrome, RSVP submission, dashboard CSV, and paid publish recovery.
