#!/bin/zsh
set -euo pipefail

ROOT="/Users/jyb-m3max/Desktop/codex/invitation-platform"
IOS_WORKSPACE="$ROOT/apps/mobile/ios"
IOS_APP="$HOME/Library/Developer/Xcode/DerivedData/InviteHub-hevapvaabsdjcdfsxondvdutghav/Build/Products/Release-iphonesimulator/InviteHub.app"
DEVICE_NAME="${DEVICE_NAME:-iPhone 17}"
OUTPUT_DIR="${1:-$ROOT/output/store-screenshots}"

mkdir -p "$OUTPUT_DIR"

DEVICE_ID="$(/usr/bin/xcrun simctl list devices booted | awk -v name="$DEVICE_NAME" '$0 ~ name {gsub(/[()]/, "", $NF); print $NF; exit}')"

if [[ -z "$DEVICE_ID" ]]; then
  echo "No booted simulator found for $DEVICE_NAME" >&2
  exit 1
fi

echo "Using device: $DEVICE_NAME ($DEVICE_ID)"

/usr/bin/xcrun simctl install "$DEVICE_ID" "$IOS_APP" >/dev/null
/usr/bin/xcrun simctl terminate "$DEVICE_ID" com.invitehub.app.dev >/dev/null 2>&1 || true
/usr/bin/xcrun simctl launch "$DEVICE_ID" com.invitehub.app.dev >/dev/null
sleep 1
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/01-home.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" 'invitehub:///templates' >/dev/null
sleep 1
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/02-templates.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" 'invitehub:///builder/step1-basic' >/dev/null
sleep 1
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/03-builder-step1.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" 'invitehub:///builder/step3-photos' >/dev/null
sleep 1
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/04-builder-step3.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" 'invitehub:///builder/preview' >/dev/null
sleep 1
/usr/bin/xcrun simctl io "$DEVICE_ID" screenshot "$OUTPUT_DIR/05-preview.png" >/dev/null

/usr/bin/xcrun simctl openurl "$DEVICE_ID" 'invitehub:///mypage' >/dev/null
sleep 1
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

Manual captures still recommended:
  - public invitation page
  - RSVP state filled with sample data
  - guestbook with sample entries
  - operations/dashboard screen with realistic data
EOF
