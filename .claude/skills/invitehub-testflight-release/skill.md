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

When the build finishes, confirm submit status. Some EAS CLI versions do not
provide `submit:list`; if it is unavailable, use the EAS build output,
App Store Connect, TestFlight, and processing email as the evidence source:

```bash
eas submit:list --platform ios --limit 5
```

If EAS CLI lacks `submit:list`, do not treat that as a release failure. Record:

- `eas build:view <build-id>` status, build number, bundle id, and git commit.
- `node scripts/eas-build-submission-status.mjs <build-id>` output.
- EAS submit URL printed by `eas build --auto-submit`.
- App Store Connect TestFlight page state after Apple processing.
- Any App Store Connect export-compliance prompt state.

`eas metadata:pull` can inspect App Store metadata only after Apple Developer
authentication. If it prompts for Apple ID/2FA, stop and ask for user handoff or
explicit login approval; do not treat the prompt as permission.

## Apple-Side Confirmation

After EAS reports "Submitted your app to Apple App Store Connect", wait for
Apple processing, then verify in App Store Connect:

1. Open `https://appstoreconnect.apple.com/apps/6763630299/testflight/ios`.
2. Confirm the uploaded build number is visible, for example `1.0.0 (38)`.
3. If export compliance appears, answer consistently with the native config:
   `ITSAppUsesNonExemptEncryption=false`.
4. Assign the build to internal group `TE Team (Expo)`.
5. Confirm tester `dudqks2@gmail.com` can see the build in TestFlight.

On the iPhone:

1. Open TestFlight.
2. Install or update InviteHub to the target build number.
3. Launch the app once.
4. Capture or report the build number and whether the first screen opens.
5. Smoke test: home template gallery -> select template -> builder Step 1 ->
   preview.

## Handoff

Report:

- Git branch, commit hash, and pushed remote.
- Local gates run and results.
- EAS build id/URL and submit/TestFlight status.
- Whether the build is visible in TestFlight for the user's iPhone.
- Any remaining Apple-side delay, processing, IAP, privacy, or screenshot risks.
