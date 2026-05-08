# InviteHub App Store Connect Build 42 Packet

Date: 2026-05-07

Build `1.0.0 (42)` is the emergency crash-fix candidate after the user reported
that the current TestFlight app still crashes on iPhone while the simulator
build works.

EAS Build and EAS Submit are finished. App Store Connect now shows build
`1.0.0 (42)` processed, export compliance not blocking, and internal group
`Team (Expo)` assigned. However, the user-provided real iPhone recording from
2026-05-07 23:43 KST shows build 42 crashing on launch. Do not mark it as
proven on the user's iPhone.

## Candidate Build

| Field | Value |
| --- | --- |
| App Store Connect app id | `6763630299` |
| Bundle id | `com.invitehub.app` |
| EAS project | `@jyb1126/invitehub` |
| App version | `1.0.0` |
| Build number | `42` |
| Source commit | `73872e2` |
| Crash-fix code commit | `0d21924` |
| EAS build id | `88c911f5-3c21-41e8-a6a2-a04939fa6179` |
| EAS submission id | `ba6727cf-2c1d-464f-a005-6ce9670d4f81` |
| EAS submission status | `FINISHED`, `error: null` |
| IPA artifact | `https://expo.dev/artifacts/eas/hTEP9Gx8wMFmK6w9aKSmcc.ipa` |
| Latest EAS status recheck | `2026-05-07 21:44 KST` |
| Latest App Store Connect check | `2026-05-07 21:49 KST` |
| TestFlight state | Processed in App Store Connect; `Team (Expo)` assigned; real iPhone launch failed |

## Why Build 42 Exists

Build 42 supersedes build 41 for current TestFlight crash verification. The
user reports that the TestFlight app continues to crash on iPhone, and the
2026-05-06
`devicectl` launch evidence is now treated as inconclusive because the
follow-up process query did not show a running InviteHub process.

Pre-patch Release simulator logs showed duplicate React Native SwiftUI runtime
classes coming from both the embedded `React.framework` and the app binary:

- `_TtC10RCTSwiftUI23RCTSwiftUIContainerView`
- `_TtC10RCTSwiftUI18ContainerViewModel`
- `RCTSwiftUIContainerViewWrapper`

That was a stronger native startup-crash candidate than an app-name conflict,
but build 42 still crashes on the user's iPhone after that patch. The current
follow-up is tracked in `docs/testflight-crash-triage-2026-05-07.md`.

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

## Upload Evidence

Command:

```bash
EAS_NO_VCS=1 eas build -p ios --profile production --non-interactive --auto-submit
```

Result:

- EAS build status: `FINISHED`
- EAS submission status: `FINISHED`
- EAS submission error: `null`
- App Store Connect upload: accepted by Apple
- App Store Connect processing: complete; iOS build upload list shows
  `1.0.0 (42)` status `완료`
- Internal TestFlight group: `Team (Expo)` assigned with invite count `1`
- Export compliance: not blocking the build 42 row; the only visible export
  compliance warning is on legacy build 28

Verification command:

```bash
node scripts/eas-build-submission-status.mjs 88c911f5-3c21-41e8-a6a2-a04939fa6179
```

## Required Next Sequence

1. Do not use build 42 as the App Store version candidate.
2. Capture or share the build 42 crash report from the user's iPhone if
   possible.
3. Prepare a newer startup-surface reduction build and verify it through
   TestFlight on the user's iPhone.
4. Capture real-device launch evidence. Do not count simulator launch as TestFlight proof.
5. Continue App Store version metadata, screenshots, privacy labels, review
   notes, contact, IAP state, and build-selection work only with the required
   user approvals.

Review/contact fields still require the account holder's real contact
information. Do not fabricate these fields. Enter the user's current App Review
contact name, phone, and email in App Store Connect. Do not use it as the App
Review contact unless the mailbox is verified.

Final Add for Review and Submit for Review still require separate explicit user
confirmation.

do not use it as the App Review contact until the mailbox is verified, and
submit only after the user explicitly confirms the final App Store review
action.
