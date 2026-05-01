---
name: invitehub-testflight-release
description: Push InviteHub release changes to GitHub and upload the current iOS build to TestFlight through EAS, with audit, release gate, and App Store evidence checks.
---

# InviteHub TestFlight Release

Use this skill when the user asks to push current InviteHub changes and make the
app visible on their iPhone through TestFlight.

## Scope

This workflow handles:

- Git hygiene, commit, and push.
- Local release verification.
- Network dependency audit.
- EAS iOS store build with auto-submit to TestFlight.
- Evidence capture and residual-risk reporting.

Do not use this for final App Store review submission unless the user explicitly
asks for App Review submission.

## Preflight

1. Work from `/Users/jyb-m3max/Desktop/codex/invitation-platform`.
2. Check `git status --branch --short` and current branch.
3. Exclude local/generated files from staging:
   - `.env*` except `.env.example`
   - `.DS_Store`
   - `.artifacts/`
   - `.claude/worktrees/`
   - `apps/mobile/dist/`
   - `logs/`
   - `output/`
   - `supabase/.temp/`
4. Confirm `apps/mobile/eas.json` has:
   - build profile `testflight` extending production
   - bundle id `com.invitehub.app`
   - submit profile `testflight.ios.ascAppId`

## Required Local Gates

Run these before committing:

```bash
npm audit --audit-level=high
SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh
git diff --check
```

If recent work touched mobile UI, also run a Release simulator build:

```bash
npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler
```

## Commit And Push

Stage only intended source, docs, config, scripts, skill, and asset files.

Use Conventional Commits, for example:

```bash
git commit -m "feat(mobile): prepare invitehub testflight release"
git push origin HEAD
```

After pushing, verify:

```bash
git status --branch --short
git log --oneline --decorate -3
```

## TestFlight Upload

Use EAS Build auto-submit so the completed iOS artifact is submitted to App
Store Connect/TestFlight:

```bash
cd apps/mobile
eas build --profile testflight --platform ios --non-interactive --auto-submit --what-to-test "InviteHub template-first invitation builder, fixed canvas preview, map links, privacy/support copy, and store release checks."
```

Capture the build id and URL from EAS output. If the command does not wait for
completion, poll:

```bash
eas build:list --platform ios --limit 3
eas build:view <build-id>
```

When the build finishes, confirm submit status:

```bash
eas submit:list --platform ios --limit 5
```

If EAS CLI lacks `submit:list`, use `eas build:view <build-id>` and App Store
Connect/TestFlight as the evidence source.

## Handoff

Report:

- Git branch, commit hash, and pushed remote.
- Local gates run and results.
- EAS build id/URL and submit/TestFlight status.
- Whether the build is visible in TestFlight for the user's iPhone.
- Any remaining Apple-side delay, processing, IAP, privacy, or screenshot risks.
