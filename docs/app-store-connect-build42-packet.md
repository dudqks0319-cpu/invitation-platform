# InviteHub App Store Connect Build 42 Packet

Date: 2026-05-07

Build `1.0.0 (42)` is the local emergency crash-fix candidate after the user
reported that the current TestFlight app still crashes on iPhone while the
simulator build works.

This build has not been uploaded to EAS/TestFlight yet. Do not mark it as
available on the user's iPhone until EAS Build, EAS Submit, App Store Connect
processing, internal group assignment, and real-device TestFlight launch
evidence are captured.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.0` |
| Build number | `42` |
| Source commit | `0d21924` |
| EAS build id | Pending |
| EAS submission id | Pending |
| IPA artifact | Pending |
| TestFlight state | Not uploaded |

## Why Build 42 Exists

Build 41 is still the newest uploaded TestFlight build. The user reports that
the TestFlight app continues to crash on iPhone, and the 2026-05-06
`devicectl` launch evidence is now treated as inconclusive because the
follow-up process query did not show a running InviteHub process.

Pre-patch Release simulator logs showed duplicate React Native SwiftUI runtime
classes coming from both the embedded `React.framework` and the app binary:

- `_TtC10RCTSwiftUI23RCTSwiftUIContainerView`
- `_TtC10RCTSwiftUI18ContainerViewModel`
- `RCTSwiftUIContainerViewWrapper`

That is a stronger native startup-crash candidate than an app-name conflict.

## What Changed From Build 41

- `apps/mobile/ios/Podfile.properties.json` sets
  `ios.buildReactNativeFromSource` to `true`.
- `pod install` removed `React-Core-prebuilt` and `ReactNativeDependencies`
  from `apps/mobile/ios/Podfile.lock`.
- `apps/mobile/ios/InviteHub.xcodeproj/project.pbxproj` no longer embeds
  `React.framework` or `ReactNativeDependencies.framework`.
- `apps/mobile/hooks/useAuth.ts` lazy-loads `expo-apple-authentication` only
  when Apple sign-in starts.
- `apps/mobile/lib/share.ts` lazy-loads `expo-web-browser` only when opening an
  external InviteHub URL.
- `apps/mobile/lib/native-startup-safety.test.ts` locks those startup-safety
  expectations.

## Local Verification

- Release simulator build for build 42 passed:
  `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild -workspace apps/mobile/ios/InviteHub.xcworkspace -scheme InviteHub -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /private/tmp/invitehub-source-build-check build`
- Built app:
  `/tmp/invitehub-source-build-check/Build/Products/Release-iphonesimulator/InviteHub.app`
- Built app `CFBundleIdentifier`: `com.invitehub.app`
- Built app `CFBundleVersion`: `42`
- Built app embedded frameworks: `hermesvm.framework` only.
- `npm run test -- apps/mobile/lib/native-startup-safety.test.ts apps/mobile/entry.test.ts apps/mobile/app.config.test.ts`: passed.
- `npm --prefix apps/mobile run typecheck`: passed.
- `npm --prefix apps/mobile run lint`: passed.
- `SKIP_AUDIT=1 SKIP_IOS_RELEASE_BUILD=1 zsh scripts/invitehub-release-gate.sh`: passed.
- `node scripts/verify-app-store-packet.mjs`: passed.

## Required Upload Sequence

After explicit user approval:

```bash
cd /Users/jyb-m3max/Desktop/codex/invitation-platform/apps/mobile
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

After EAS returns a build id:

1. Record EAS build id, submission id, IPA URL, and source commit in this file.
2. Run `node scripts/eas-build-submission-status.mjs <build-id>`.
3. Confirm App Store Connect shows build `1.0.0 (42)` processed.
4. Assign build 42 to internal group `Team (Expo)` if needed, after explicit
   user approval.
5. Install/update InviteHub from TestFlight on the user's iPhone.
6. Capture real-device launch evidence. Do not count simulator launch as TestFlight proof.
