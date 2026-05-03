#!/usr/bin/env bash
set -u

DEVICE_ID="${DEVICE_ID:-8CCEF0FF-05C7-5A6F-BF68-38DF12FA83C4}"
OUT_ROOT="${OUT_ROOT:-output/ios-device-diagnostics}"
STAMP="$(date '+%Y%m%d-%H%M%S')"
OUT_DIR="${OUT_DIR:-$OUT_ROOT/$STAMP}"

usage() {
  cat <<EOF
Usage: DEVICE_ID=<device-id> $0

Collect iPhone connection diagnostics for TestFlight validation blockers.

Defaults:
  DEVICE_ID=$DEVICE_ID
  OUT_DIR=$OUT_DIR
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

mkdir -p "$OUT_DIR"

run_capture() {
  local name="$1"
  shift

  echo "== $name =="
  echo "+ $*" > "$OUT_DIR/$name.command.txt"
  "$@" > "$OUT_DIR/$name.txt" 2>&1
  local status=$?
  echo "$status" > "$OUT_DIR/$name.exit-code.txt"
  if [[ $status -ne 0 ]]; then
    echo "WARN: $name exited with $status. See $OUT_DIR/$name.txt"
  fi
  return 0
}

echo "== devicectl-devices =="
echo "+ xcrun devicectl --json-output $OUT_DIR/devicectl-devices.json list devices" > "$OUT_DIR/devicectl-devices.command.txt"
xcrun devicectl --json-output "$OUT_DIR/devicectl-devices.json" list devices > "$OUT_DIR/devicectl-devices.txt" 2>&1
devicectl_status=$?
echo "$devicectl_status" > "$OUT_DIR/devicectl-devices.exit-code.txt"
if [[ $devicectl_status -ne 0 ]]; then
  echo "WARN: devicectl-devices exited with $devicectl_status. See $OUT_DIR/devicectl-devices.txt"
fi

run_capture xctrace-devices xcrun xctrace list devices
run_capture usb-devices system_profiler SPUSBDataType
run_capture lock-state xcrun devicectl device info lockState --device "$DEVICE_ID"

if [[ -f "$OUT_DIR/devicectl-devices.json" ]]; then
  node -e "
const fs = require('fs');
const path = process.argv[1];
const id = process.argv[2];
const out = process.argv[3];
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const devices = data.result?.devices || [];
const device = devices.find((item) =>
  item.identifier === id ||
  item.hardwareProperties?.udid === id ||
  item.deviceProperties?.name === id
);
const summary = device ? {
  found: true,
  identifier: device.identifier,
  name: device.deviceProperties?.name,
  tunnelState: device.connectionProperties?.tunnelState || 'unknown',
  pairingState: device.connectionProperties?.pairingState || 'unknown',
  developerMode: device.deviceProperties?.developerModeStatus || 'unknown',
  osVersion: device.deviceProperties?.osVersionNumber || 'unknown',
  udid: device.hardwareProperties?.udid || 'unknown',
  recommendedNextStep: device.connectionProperties?.tunnelState === 'unavailable'
    ? 'Unlock the iPhone, keep it cabled, approve Trust This Computer if prompted, then rerun the TestFlight harness.'
    : 'Run scripts/await-testflight-device.sh --open-testflight or --launch.'
} : {
  found: false,
  requestedDevice: id,
  recommendedNextStep: 'Reconnect the iPhone by cable, unlock it, and verify it appears in xcrun devicectl list devices.'
};
fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
" "$OUT_DIR/devicectl-devices.json" "$DEVICE_ID" "$OUT_DIR/device-summary.json" > "$OUT_DIR/device-summary.txt" 2>&1
fi

cat > "$OUT_DIR/summary.md" <<EOF
# iOS Device Connection Diagnostics

- Captured at: $(date '+%Y-%m-%d %H:%M:%S %Z')
- Device: \`$DEVICE_ID\`

Review:

- \`device-summary.txt\` / \`device-summary.json\`
- \`devicectl-devices.txt\` / \`devicectl-devices.json\`
- \`xctrace-devices.txt\`
- \`usb-devices.txt\`
- \`lock-state.txt\`
EOF

echo "IOS DEVICE DIAGNOSTICS RESULT"
echo "- Output: $OUT_DIR"
echo "- Device: $DEVICE_ID"
