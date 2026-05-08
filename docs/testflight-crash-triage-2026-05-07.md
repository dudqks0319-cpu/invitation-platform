# TestFlight Crash Triage - 2026-05-07

## Verdict

Build `1.0.0 (42)` is not a valid release candidate. The user-provided real
iPhone screen recording from 2026-05-07 23:43 KST shows build 42 installed from
TestFlight and then crashing immediately on launch.

Do not record `realIphoneTestFlightInstallLaunchPassed` for build 42. The
current release goal remains blocked until a newer TestFlight build launches on
the user's iPhone without the iOS crash dialog.

## Real iPhone Evidence

Source recording:

```txt
/Users/jyb-m3max/Downloads/ScreenRecording_05-07-2026 23-43-37_1.MP4
```

Extracted local evidence frames:

```txt
output/testflight-device-watch/20260507-234337/evidence/testflight-build42-list.png
output/testflight-device-watch/20260507-234337/evidence/testflight-build42-detail.png
output/testflight-device-watch/20260507-234337/evidence/testflight-build42-open.png
output/testflight-device-watch/20260507-234337/evidence/build42-crash-prompt.png
```

The `output/` folder is intentionally gitignored, so this document is the
tracked evidence index.

Observed sequence:

- TestFlight list shows `InviteHub (40c8af)`, version `1.0.0(42)`, and the
  update action.
- TestFlight detail shows developer `Youngbeen Jung`, version `1.0.0`, build
  `42`, release date `2026. 5. 7`, size `17.1MB`, and expiry `90일`.
- After update/open, iOS returns to the home screen.
- iOS shows the crash prompt:
  `'InviteHub (40c8af)' 앱이 충돌함` and asks whether to share additional
  information with the developer.

## Artifact Inspection

The build 42 IPA was downloaded from the EAS artifact URL and inspected locally:

```txt
https://expo.dev/artifacts/eas/hTEP9Gx8wMFmK6w9aKSmcc.ipa
```

Inspection results:

- `CFBundleIdentifier`: `com.invitehub.app`
- `CFBundleShortVersionString`: `1.0.0`
- `CFBundleVersion`: `42`
- `RCTNewArchEnabled`: `true`
- `MinimumOSVersion`: `15.1`
- `DTSDKName`: `iphoneos26.2`
- embedded frameworks: `hermesvm.framework` only
- `React.framework` and `ReactNativeDependencies.framework` are not embedded

This means the build 42 patch did make it into the TestFlight artifact, and the
previous duplicate prebuilt React framework hypothesis no longer explains this
specific build 42 crash.

## Current Root-Cause Direction

The strongest remaining direction is launch-time React Native New Architecture /
TurboModule startup rather than an app-name or duplicate-app collision.

Reasons:

- Historical build 40 crash reports aborted on
  `com.meta.react.turbomodulemanager.queue`.
- React Native 0.83 keeps New Architecture enabled; local
  `RCT_NEW_ARCH_ENABLED=0` is not a supported rollback path anymore.
- Build 42 still has `RCTNewArchEnabled=true`, and the app crashes on iPhone
  before a usable home screen appears.
- The build 42 IPA no longer contains the duplicate `React.framework`
  embedding path, so the next reduction should target modules loaded during the
  first home render.

## Applied Next Patch

For the next build candidate, the mobile home screen no longer imports auth,
Supabase, or draft storage at module load. Template draft creation is loaded
only after the user taps a template.

Files:

- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/lib/native-startup-safety.test.ts`

This keeps the first render focused on Expo Router, React Native views, safe
area, and bundled template images. It delays `@react-native-async-storage`,
Supabase auth, and other auth/storage startup work until user interaction.

## Local Verification After Patch

On 2026-05-08 17:25 KST, the patched Release simulator build passed and opened
on iPhone 17:

```txt
npm --prefix apps/mobile run ios -- --device "iPhone 17" --configuration Release --no-bundler
```

Result:

- Build succeeded with 0 errors and 4 warnings.
- `com.invitehub.app` installed and opened on iPhone 17.
- Screenshot evidence:
  `output/testflight-device-watch/20260508-codex-update/evidence/release-simulator-home.png`
- Recent simulator log query returned no `InviteHub` process errors in the last
  two minutes.

This is local simulator evidence only. It does not replace a newer TestFlight
build and real iPhone launch pass.

## Required User Action

If the crash prompt is still visible, tap `공유`. If it is gone, reproduce the
crash once more from TestFlight and tap `공유` on the crash prompt.

That shared report is required to identify the exact native exception in App
Store Connect. Until that report or a connected-device crash log is available,
the fix can only be driven by startup-surface reduction and TestFlight retesting.
