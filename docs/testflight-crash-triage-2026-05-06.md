# TestFlight Crash Triage - 2026-05-06

## Verdict

Do not roll back to builds 38, 39, or 40. Those builds already have launch-crash
evidence or a confirmed Expo Router release-entry crash path. Build 41 also
cannot be treated as proven anymore because the latest user report says the
TestFlight app still crashes, and the earlier machine evidence only proved that
`devicectl` returned exit code `0`, not that the process stayed alive.

The stronger current native crash candidate is duplicate React Native SwiftUI
runtime classes from the prebuilt React Native core framework being embedded
beside app-linked React Native code. A Release simulator run before the patch
logged duplicate implementations for these classes:

- `_TtC10RCTSwiftUI23RCTSwiftUIContainerView`
- `_TtC10RCTSwiftUI18ContainerViewModel`
- `RCTSwiftUIContainerViewWrapper`

The log warning explicitly says this can cause spurious casting failures and
mysterious crashes. That matches a launch-time native abort better than an app
name conflict.

## Decision

Prepare build 42 as the emergency crash-fix candidate instead of reverting.
The patch removes the prebuilt React Native core embedding path and delays
optional native modules that are not needed for the first home render.

## Evidence

- Build 41 device evidence on 2026-05-06 19:03 KST:
  - `devicectl` launch returned exit code `0`.
  - The follow-up process query did not show a running InviteHub process after
    launch, so this is not valid real-device launch-pass evidence.
  - Evidence path: `output/testflight-device-evidence/20260506-190312`.
- A later real-device retry is currently blocked by local CoreDevice tooling:
  - `xcrun devicectl list devices --timeout 30` and the 60-second retry timed
    out while waiting for `CoreDeviceService` to initialize.
  - No fresh iPhone crash report was available under local
    `~/Library/Logs/CrashReporter/MobileDevice`.
- Historical local crash logs for build 40 showed `EXC_CRASH SIGABRT` on
  `com.meta.react.turbomodulemanager.queue`, with
  `facebook::react::ObjCTurboModule::performVoidMethodInvocation` in the stack.
  This does not prove the build 41 crash cause, but it keeps native
  TurboModule/startup work in scope.
- Pre-patch Release simulator logs showed duplicate `RCTSwiftUI` classes coming
  from both the embedded `React.framework` and the app binary.

## Patch

- `apps/mobile/ios/Podfile.properties.json` now sets
  `ios.buildReactNativeFromSource` to `true`.
- `pod install` removed `React-Core-prebuilt` and `ReactNativeDependencies`
  from the installed Pods graph.
- `apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj` no longer embeds
  `React.framework` or `ReactNativeDependencies.framework`; the build embeds
  `hermesvm.framework` only.
- `apps/mobile/hooks/useAuth.ts` no longer imports
  `expo-apple-authentication` or `expo-web-browser` at module load.
- `apps/mobile/lib/share.ts` lazy-loads `expo-web-browser` only when opening an
  external InviteHub URL.
- `apps/mobile/lib/native-startup-safety.test.ts` locks the startup-safety and
  source-built React Native settings.

## Local Verification

- `pod install` completed with:
  - `[ReactNativeDependencies] Building from source: true`
  - `[ReactNativeCore] Building from source: true`
  - `Removing React-Core-prebuilt`
  - `Removing ReactNativeDependencies`
- Release simulator build for build 42 succeeded:
  - Command:
    `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild -workspace apps/mobile/ios/InviteHub.xcworkspace -scheme InviteHub -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /private/tmp/invitehub-source-build-check build`
  - Result: `** BUILD SUCCEEDED **`
  - Built app: `/tmp/invitehub-source-build-check/Build/Products/Release-iphonesimulator/InviteHub.app`
  - `CFBundleIdentifier`: `com.invitehub.app`
  - `CFBundleVersion`: `42`
  - Embedded frameworks: `hermesvm.framework` only.
- `npm run test -- apps/mobile/lib/native-startup-safety.test.ts apps/mobile/entry.test.ts apps/mobile/app.config.test.ts` passed.
- `npm --prefix apps/mobile run typecheck` passed.
- `npm --prefix apps/mobile run lint` passed.
- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`
  passed on 2026-05-06 KST:
  - web lint/typecheck
  - 60-file web/API test suite, 183 tests
  - mobile lint/typecheck
  - 9-file mobile/API focused test suite, 34 tests
  - App Store packet verification

## Rollback Rule

Only roll back if build 42 fails to compile or fails the same local gate before
TestFlight upload. Do not roll back to build 38, 39, or 40 for user testing
because they already have stronger crash evidence than the build 42 local
candidate.

## Next Check

Upload build 42 to TestFlight after explicit approval, assign it to the internal
group, then verify on the user's iPhone. Do not claim the crash is fixed until build 42 is installed from TestFlight and the user or CoreDevice evidence shows
the app remains open past launch.
