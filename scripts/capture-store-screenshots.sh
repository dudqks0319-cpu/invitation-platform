#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
ROOT="${SCRIPT_DIR:h}"
IOS_WORKSPACE="$ROOT/apps/mobile/ios"
IOS_APP="${IOS_APP:-$HOME/Library/Developer/Xcode/DerivedData/InviteHub-hevapvaabsdjcdfsxondvdutghav/Build/Products/Release-iphonesimulator/InviteHub.app}"
DEVICE_NAME="${DEVICE_NAME:-iPhone 17}"
OUTPUT_DIR="${1:-$ROOT/output/store-screenshots}"
BUNDLE_ID="${APP_BUNDLE_ID:-com.invitehub.app}"
APP_SCHEME="${APP_SCHEME:-invitehub}"
LAUNCH_WAIT_SECONDS="${LAUNCH_WAIT_SECONDS:-5}"
ROUTE_WAIT_SECONDS="${ROUTE_WAIT_SECONDS:-2}"
DEV_BUNDLE_IDS=(
  "com.invitehub.app.dev"
  "com.invitehub.app.dev-default"
)

cd "$ROOT"
node scripts/verify-release-candidate.mjs install --artifact "$IOS_APP"

mkdir -p "$OUTPUT_DIR"

DEVICE_ID="$(/usr/bin/xcrun simctl list devices booted | awk -v name="$DEVICE_NAME" '$0 ~ name {gsub(/[()]/, "", $NF); print $NF; exit}')"

if [[ -z "$DEVICE_ID" ]]; then
  echo "No booted simulator found for $DEVICE_NAME" >&2
  exit 1
fi

echo "Using device: $DEVICE_NAME ($DEVICE_ID)"

for candidate in "$BUNDLE_ID" "${DEV_BUNDLE_IDS[@]}"; do
  /usr/bin/xcrun simctl terminate "$DEVICE_ID" "$candidate" >/dev/null 2>&1 || true
done

for candidate in "${DEV_BUNDLE_IDS[@]}"; do
  /usr/bin/xcrun simctl uninstall "$DEVICE_ID" "$candidate" >/dev/null 2>&1 || true
done

/usr/bin/xcrun simctl install "$DEVICE_ID" "$IOS_APP" >/dev/null
/usr/bin/xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
/usr/bin/xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID" >/dev/null
sleep "$LAUNCH_WAIT_SECONDS"
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/01-home.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" "$APP_SCHEME:///templates" >/dev/null
sleep "$ROUTE_WAIT_SECONDS"
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/02-templates.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" "$APP_SCHEME:///builder/step1-basic" >/dev/null
sleep "$ROUTE_WAIT_SECONDS"
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/03-builder-step1.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" "$APP_SCHEME:///builder/step3-photos" >/dev/null
sleep "$ROUTE_WAIT_SECONDS"
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/04-builder-step3.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" "$APP_SCHEME:///builder/preview" >/dev/null
sleep "$ROUTE_WAIT_SECONDS"
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/05-preview.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" "$APP_SCHEME:///mypage" >/dev/null
sleep "$ROUTE_WAIT_SECONDS"
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/06-mypage.png" >/dev/null

cat <<EOF
Saved screenshots to:
  $OUTPUT_DIR

Automatic captures:
  01-home.png
  02-templates.png
  03-builder-step1.png
  04-builder-step3.png
  05-preview.png
  06-mypage.png

Important:
  simctl openurl may show an iOS "Open in InviteHub" confirmation prompt.
  Do not use any screenshot that contains that prompt for App Store submission.

Manual captures still recommended:
  - public invitation page
  - RSVP state filled with sample data
  - guestbook with sample entries
  - operations/dashboard screen with realistic data
EOF
