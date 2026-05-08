# InviteHub App Store Connect Build 43 Packet

Date: 2026-05-08

Build `1.0.0 (43)` is the next TestFlight candidate after build 42 failed real
iPhone launch. It contains the post-build-42 startup-surface reduction patch.

EAS Build and EAS Submit are finished. Apple accepted the upload and App Store
Connect processing is pending.

Do not select build 43 for the App Store version until App Store Connect
processing is complete, internal TestFlight assignment is verified, and the
user's real iPhone launches the build from TestFlight without the crash dialog.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.0` |
| Build number | `43` |
| Source commit captured before upload | `4af7f3c` |
| EAS build id | `9a4a25a7-c362-4ba0-9c01-fdac8b0f942c` |
| EAS submission id | `595cd20f-6d0d-4c72-887f-ffcc7b614dd6` |
| EAS build status | `FINISHED` |
| EAS submission status | `FINISHED`, `error: null` |
| IPA artifact | `https://expo.dev/artifacts/eas/k435zPEohnNNZiQAiAB9Wq.ipa` |
| Build created | `2026-05-08T09:41:02.424Z` |
| Build completed | `2026-05-08T09:47:22.960Z` |
| App Store Connect state | Uploaded to Apple; processing pending |

## What Changed From Build 42

- The home screen no longer imports auth, Supabase, or draft storage at module
  load.
- Template draft creation is lazy-loaded only after the user taps a template.
- Startup-safety tests assert that the home first render avoids
  `@/hooks/useAuth`, `@/lib/drafts`, and `@/lib/auth-access`.
- Evidence gates now require current-build keys instead of failed build 42
  selection.

## Upload Evidence

Command run from `apps/mobile` after approval:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Important command output:

```txt
Incremented buildNumber from 42 to 43.
Build ID    :  9a4a25a7-c362-4ba0-9c01-fdac8b0f942c
App Version :  1.0.0
Build number:  43
Submission details: https://expo.dev/accounts/jyb1126/projects/invitehub/submissions/595cd20f-6d0d-4c72-887f-ffcc7b614dd6
Submitted your app to Apple App Store Connect.
Your binary has been successfully uploaded to App Store Connect.
It is now being processed by Apple.
```

Verification command:

```bash
node scripts/eas-build-submission-status.mjs 9a4a25a7-c362-4ba0-9c01-fdac8b0f942c
```

Result:

```json
{
  "found": true,
  "id": "9a4a25a7-c362-4ba0-9c01-fdac8b0f942c",
  "status": "FINISHED",
  "platform": "IOS",
  "appVersion": "1.0.0",
  "appBuildVersion": "43",
  "gitCommitHash": null,
  "submissions": [
    {
      "id": "595cd20f-6d0d-4c72-887f-ffcc7b614dd6",
      "status": "FINISHED",
      "platform": "IOS",
      "error": null
    }
  ]
}
```

## Required Next Sequence

1. Wait for Apple processing to finish.
2. Verify App Store Connect shows build `1.0.0 (43)` processed/available.
3. Verify export compliance is not blocking build 43.
4. Assign or confirm build 43 in internal group `Team (Expo)`.
5. Record structured evidence:
   - `currentTestFlightBuildProcessed`
   - `currentBuildExportComplianceSaved`
   - `currentBuildAssignedToInternalGroup`
6. Install/update InviteHub from TestFlight on the user's iPhone and smoke test:
   home -> template selection -> builder Step 1 -> preview.
7. Record `realIphoneTestFlightInstallLaunchPassed` only after the user's
   iPhone launches build 43 without the crash dialog.

API status check harness:

```bash
node scripts/app-store-connect-build-status.mjs --build 43
```

This requires `APPLE_APP_STORE_ISSUER_ID`, `APPLE_APP_STORE_KEY_ID`, and
`APPLE_APP_STORE_PRIVATE_KEY`. The current local `.env.local` has issuer/key id
values but `APPLE_APP_STORE_PRIVATE_KEY` is empty, so App Store Connect browser
login is still required unless the private key is supplied.

Final Add for Review and Submit for Review still require separate explicit user
confirmation.
