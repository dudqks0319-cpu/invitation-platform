# TestFlight Crash Triage - 2026-05-03

## Verdict

The current evidence does not support "two similar apps installed" as the crash
root cause. iOS can keep the production and development InviteHub apps separate
when their bundle identifiers differ, and this repo uses separate identifiers:

- Production/TestFlight: `com.invitehub.app`
- Development: `com.invitehub.app.dev`

The stronger current explanation is that the iPhone is still launching build 39
or build 38, both of which already have App Store Connect crash evidence. Build
40 is uploaded and assigned to the internal TestFlight group, but App Store
Connect does not yet show a build 40 install, session, or crash. Local
CoreDevice evidence captured on 2026-05-03 14:39 KST confirmed the connected
iPhone still has `InviteHub` bundle version `39` installed for
`com.invitehub.app`.

`InviteHub (40c8af)` is the App Store Connect app name, not the TestFlight build
number. A crash alert with that app name does not prove build 40 is installed.

## Evidence

- App Store Connect TestFlight iOS build table, read-only Safari audit on
  2026-05-03:
  - Build 40: status `제출 준비 완료`, group `Team (Expo)`, invites `1`,
    installs `-`, sessions `-`, crashes `-`.
  - Build 39: status `제출 준비 완료`, group `Team (Expo)`, invites `1`,
    installs `1`, sessions `-`, crashes `1`.
  - Build 38: status `제출 준비 완료`, group `Team (Expo)`, invites `1`,
    installs `1`, sessions `-`, crashes `3`.
  - Crash feedback page is empty, so there is no downloadable crash detail for
    symbol-level root cause yet.
- EAS build 40 state:
  - Build id `86a14873-bdfd-4390-87d1-81ae0ddd06dc`
  - Version `1.0.0`, build `40`
  - Submission `cf537e44-73dd-4a2d-8640-7d31e9facba8` finished with
    `error: null`
- Local native config:
  - `apps/mobile/eas.json` production profile sets `APP_BUNDLE_ID` to
    `com.invitehub.app`.
  - `apps/mobile/eas.json` development/preview profiles set `APP_BUNDLE_ID` to
    `com.invitehub.app.dev`.
  - `apps/mobile/app.config.ts` maps production to `com.invitehub.app` and dev
    to `com.invitehub.app.dev`.
  - Release simulator app bundle is `com.invitehub.app` and display name is
    `InviteHub`.
- Local regression check:
  - `npm run test -- apps/mobile/app.config.test.ts apps/mobile/react-native.config.test.ts --exclude='**/.claude/**'`
    passed 2 files / 10 tests on 2026-05-03.
  - These tests confirm production/dev bundle separation and default exclusion
    of optional Google, Kakao, IAP, and Nitro native dependencies.
- Real-device CoreDevice check on 2026-05-03 14:39 KST:
  - Device `8CCEF0FF-05C7-5A6F-BF68-38DF12FA83C4` was available and paired.
  - `invitehub-app.txt` showed `InviteHub`, bundle id `com.invitehub.app`,
    version `1.0.0`, bundle version `39`.
  - The launch attempt exited with code `1` because iOS denied opening
    `com.invitehub.app` while the phone was locked:
    `Unable to launch com.invitehub.app because the device was not, or could not be, unlocked`.
  - Evidence bundle:
    `output/testflight-device-watch/20260503-143921/evidence/20260503-143922`.
- iOS connection diagnostics on 2026-05-03 14:54 KST:
  - `devicectl` found the paired device, developer mode enabled, iOS
    `26.3.1 (a)`, but `tunnelState` remained `unavailable`.
  - `xcrun xctrace list devices` still listed `영빈 (26.3.1)
    (00008140-000470E13E10801C)`, so the phone is visible to Xcode tooling.
  - `devicectl device info lockState` failed with CoreDevice error `1011`,
    so TestFlight and InviteHub launch commands cannot run until the phone is
    unlocked/trusted and the CoreDevice tunnel becomes available.
  - Evidence bundle:
    `output/ios-device-diagnostics/20260503-145413`.

## Likely Cause

The iPhone has not updated to build 40 from TestFlight. The connected device
still reports installed bundle version `39` for `com.invitehub.app`. The visible
crash dialog uses the ASC app name `InviteHub (40c8af)`, which can appear for
build 38, 39, or 40.

Mac TestFlight build 40 has a separate confirmed crash. The macOS crash dialog
and unified logs show build `1.0.0 (40)` aborting with an unhandled JavaScript
exception:

```txt
Unhandled JS Exception: Error: No routes found
```

The stack points to Expo Router's `ContextNavigator` inside the release
`main.jsbundle`. The local cause was the custom `apps/mobile/index.js` entry and
`apps/mobile/package.json` main value calling `ExpoRoot` with
`require.context("./app")`, which bypassed Expo Router's generated
`expo-router/_ctx` route context. The fix is to use the supported
`expo-router/entry` entrypoint directly from `package.json`, use Expo's default
Metro config so `transform.routerRoot` reaches the Babel transformer, and
explicitly load Expo Router's Babel env transform for `EXPO_ROUTER_APP_ROOT` in
`apps/mobile/babel.config.js`.
That extra Babel hook is required in this workspace because `babel-preset-expo`
is resolved from the monorepo root while `expo-router` is installed in the
mobile workspace. After the fix, `npx expo export --platform ios --output-dir
/tmp/invitehub-ios-export-entry-fix-20260503-1531` passed and produced the iOS
Hermes bundle.

## Required Next Check

On the iPhone:

1. Open TestFlight.
2. Open `InviteHub (40c8af)`.
3. Confirm the installed build shows `40`.
4. If it shows an update button, update first.
5. Launch from TestFlight once.

For machine verification, the iPhone must be unlocked, trusted by the Mac, and
available to `xcrun devicectl`. The latest machine check reached the phone, but
launch was blocked by the iOS locked-device state and the installed InviteHub
bundle was still build `39`. A later connection diagnostic showed Xcode can see
the phone through `xctrace`, but `devicectl` still reports the CoreDevice tunnel
as `unavailable`.

When the phone is available, collect focused local evidence with:

```bash
bash scripts/collect-testflight-device-evidence.sh
```

After the user is ready to observe the phone, launch the app and capture the
launch result with:

```bash
bash scripts/collect-testflight-device-evidence.sh --launch
```

The script writes a timestamped bundle under
`output/testflight-device-evidence/`. It filters app inventory to
`com.invitehub.app` and process inventory to `InviteHub` to avoid collecting a
full device app list.

To wait for the phone and collect as soon as CoreDevice becomes available:

```bash
bash scripts/await-testflight-device.sh
```

To wait and then launch the app for an observed smoke test:

```bash
bash scripts/await-testflight-device.sh --launch
```

To wait and then open TestFlight itself on the phone so the user can update or
inspect the installed InviteHub build:

```bash
bash scripts/await-testflight-device.sh --open-testflight
```

If CoreDevice keeps reporting the iPhone as `unavailable`, collect connection
diagnostics before retrying:

```bash
bash scripts/diagnose-ios-device-connection.sh
```

This writes watch output under `output/testflight-device-watch/`, then nests the
focused evidence bundle when the phone becomes available.
