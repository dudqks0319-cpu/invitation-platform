# InviteHub App Development Harness

## Recommendation

Use `harness-100-main/ko/17-mobile-app-builder` as the main harness.

InviteHub is not only a web template product. The highest-risk work is mobile
app quality, editor usability, preview accuracy, publishing, and App Store
readiness, so the mobile app builder harness is the best default.

Use these as overlays:

- `ko/16-fullstack-webapp` for Next.js, Supabase, API, auth, and admin work.
- `ko/36-design-system` for invitation template consistency and Figma handoff.

## Installed Project Harness

The active harness files are:

- `.claude/CLAUDE.md`
- `.claude/agents/product-manager.md`
- `.claude/agents/marketing-copywriter.md`
- `.claude/agents/template-image-art-director.md`
- `.claude/agents/ux-designer.md`
- `.claude/agents/mobile-frontend-engineer.md`
- `.claude/agents/mobile-backend-engineer.md`
- `.claude/agents/security-engineer.md`
- `.claude/agents/app-developer.md`
- `.claude/agents/api-integrator.md`
- `.claude/agents/store-manager.md`
- `.claude/agents/qa-engineer.md`
- `.claude/agents/backend-web-guardian.md`
- `.claude/skills/invitehub-app-builder/skill.md`

## Default Product Team

For broad mobile app work, run the harness in this order:

1. `product-manager`: define the user outcome and release priority.
2. `marketing-copywriter`: make Korean copy natural, warm, and conversion-safe.
3. `template-image-art-director`: define GPT image prompts and approve image quality.
4. `ux-designer`: shape the screen hierarchy and interaction.
5. `mobile-frontend-engineer`: implement Expo / React Native UI and navigation.
6. `mobile-backend-engineer`: verify mobile-facing API, drafts, publish, and entitlements.
7. `security-engineer`: check secrets, authz, validation, abuse, and privacy.
8. `qa-engineer`: validate the real flow in simulator/device.
9. `store-manager`: confirm App Store specific readiness when release is in scope.

## GPT Image Model Workflow

Generated images can be used in templates when they are saved and registered as
bundled assets.

1. Create vertical invitation preview art with the GPT image model.
2. Keep output free of watermarks, logos, real third-party characters, and
   copyrighted artwork.
3. Save final `.jpg` files under
   `apps/mobile/assets/template-previews/generated/<category>/<template-id>.jpg`.
4. Register ids in `apps/mobile/lib/template-preview-manifest.ts`.
5. Add static `require(...)` entries in
   `apps/mobile/lib/template-preview-source.ts`.
6. Run:

```bash
npx vitest run apps/mobile/lib/template-preview-source.test.ts --exclude='**/.claude/**'
npm --prefix apps/mobile run lint
npm --prefix apps/mobile run typecheck
```

7. Confirm the images render in the iOS simulator before release.

## How To Ask

Copy one of these prompts:

```txt
초대장 앱의 템플릿 갤러리와 편집기 UX를 개선해줘. .claude/skills/invitehub-app-builder/skill.md 기준으로 진행하고, iOS 시뮬레이터에서 확인해줘.
```

```txt
초대장 앱 App Store 출시 준비 상태를 점검해줘. store-manager와 qa-engineer 관점으로 번들 ID, TestFlight, 개인정보, 스크린샷, 실제 앱 흐름을 확인해줘.
```

```txt
초대장 발행/공유/RSVP 흐름을 고쳐줘. api-integrator와 backend-web-guardian 기준으로 Supabase 계약, 검증, 보안까지 확인해줘.
```

```txt
Figma 디자인을 초대장 템플릿으로 적용해줘. 원본을 그대로 복사하지 말고 기존 템플릿 구조에 맞게 색, 타이포, 섹션 리듬만 반영해줘.
```

## Verification Defaults

Use the smallest commands that prove the work:

```bash
npm run lint
npm run test -- --exclude .claude/**
npm run test:shared
npm run typecheck
npm --prefix apps/mobile run lint
npm --prefix apps/mobile run typecheck
```

For UI work, add browser or iOS simulator screenshots. For release work, compare
Expo config, EAS config, native project identifiers, and App Store state before
claiming readiness.

## 90+ App Store Readiness Harness

Use this when the target is "all areas 90점 이상".

```bash
zsh scripts/invitehub-release-gate.sh
```

For a fast store-manager-only packet check:

```bash
node scripts/verify-app-store-packet.mjs
```

For final active-goal completion, use the stricter completion verifier. It is
expected to return `blocked` until Apple-side evidence is captured in
`docs/app-store-external-evidence.json` with `status`, `capturedAt`,
`evidence`, and `artifact` fields. `artifact` must be an `https://` URL,
existing local file path, or `user-confirmation:` reference. The filled
evidence file is gitignored; commit only the template:

```bash
node scripts/verify-goal-completion.mjs
```

To fill the ignored evidence manifest safely:

```bash
node scripts/record-app-store-evidence.mjs --list
node scripts/record-app-store-evidence.mjs --key <evidence-key> --evidence "<what was verified>" --artifact "<https-url-or-local-file-or-user-confirmation>" --capturedAt <YYYY-MM-DDTHH:mm:ss+09:00>
```

The score cannot be reported as 90+ unless each role signs off:

| Role | 90+ Standard |
| --- | --- |
| Product Manager | Template selection, builder, preview, publish/share, RSVP/guestbook value is coherent and reachable. |
| Marketing Copywriter | Korean copy is natural, concise, and does not promise unavailable paid/store features. |
| Template Image Art Director | Main/home templates use bundled images, no watermark/logo/copyrighted character risk. |
| UX Designer | First screen is simple, template-led, and does not bury the primary action. |
| Mobile Frontend Engineer | Mobile lint/typecheck/tests pass, Release simulator build runs, core flow is tapped in Simulator. |
| Mobile Backend Engineer | Draft, publish, payment verification, template API contracts are tested with negative paths. |
| API Integrator | JSON-only write APIs, auth tokens, ownership filters, and error responses are explicit. |
| Security Engineer | No high audit findings, secrets are not hardcoded, authz/validation/rate limits are present. |
| Store Manager | `app.config.ts`, `app.json`, `eas.json`, native Release bundle id/scheme, App Store packet, support contact, IAP fallback, and build evidence align. |
| QA Engineer | Screenshots and user-path evidence exist for home, builder, preview, publish/share, and account screens. |

External console checks still required before final App Store submission:

- TestFlight build uploaded and selectable in App Store Connect.
- App privacy labels saved in App Store Connect.
- Screenshot set uploaded for required device sizes.
- In-app purchase products approved or paid claims removed from metadata.
- Review notes include the login path, no-login draft path, publish path, and support contact.

Do not mark the broader goal complete until
`node scripts/verify-goal-completion.mjs` passes with external evidence.
