#!/usr/bin/env bash
set -uo pipefail
umask 077

DEVICE_ID="${DEVICE_ID:-iPhone 12 Pro}"
BUNDLE_ID="${BUNDLE_ID:-com.invitehub.app}"
TESTFLIGHT_BUNDLE_ID="${TESTFLIGHT_BUNDLE_ID:-com.apple.TestFlight}"
INVITEHUB_PROCESS_FILTER="executable.path ENDSWITH 'InviteHub.app/InviteHub'"
OUT_ROOT="${OUT_ROOT:-output/testflight-device-evidence}"
STAMP="$(date '+%Y%m%d-%H%M%S')"
OUT_DIR="${OUT_DIR:-$OUT_ROOT/$STAMP}"
LAUNCH=0
OPEN_TESTFLIGHT=0
CAPTURE_FAILED=0

usage() {
  cat <<EOF
Usage: DEVICE_ID=<device-id> BUNDLE_ID=<bundle-id> $0 [--launch] [--open-testflight]

Collect focused TestFlight real-device evidence for InviteHub.

Defaults:
  DEVICE_ID=$DEVICE_ID
  BUNDLE_ID=$BUNDLE_ID
  TESTFLIGHT_BUNDLE_ID=$TESTFLIGHT_BUNDLE_ID
  OUT_DIR=$OUT_DIR

Options:
  --launch   Launch the app on the connected device after collecting read-only
             state. Use only when the user is ready to observe the phone.
  --open-testflight
             Launch TestFlight on the connected device so the user can update
             or inspect the installed InviteHub build.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --launch)
      LAUNCH=1
      shift
      ;;
    --open-testflight)
      OPEN_TESTFLIGHT=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 64
      ;;
  esac
done

if [[ -L "$OUT_DIR" ]]; then
  echo "Refusing symlink evidence directory: $OUT_DIR" >&2
  exit 1
fi
mkdir -p -- "$OUT_DIR"
DEVICE_LABEL="redacted target"

run_json_capture() {
  local name="$1"
  shift

  echo "== $name =="
  echo "+ $*" > "$OUT_DIR/$name.command.txt"
  "$@" --json-output "$OUT_DIR/$name.json" > "$OUT_DIR/$name.txt" 2>&1
  local status=$?
  echo "$status" > "$OUT_DIR/$name.exit-code.txt"
  if [[ $status -ne 0 ]]; then
    echo "ERROR: $name exited with $status. See $OUT_DIR/$name.txt" >&2
    return "$status"
  fi
  return 0
}

run_json_capture devices xcrun devicectl list devices --filter "Name == '$DEVICE_ID' OR identifier == '$DEVICE_ID'" || CAPTURE_FAILED=1
run_json_capture lock-state xcrun devicectl device info lockState --device "$DEVICE_ID" || CAPTURE_FAILED=1
run_json_capture testflight-app xcrun devicectl device info apps --device "$DEVICE_ID" --bundle-id "$TESTFLIGHT_BUNDLE_ID" --columns '*' || CAPTURE_FAILED=1
run_json_capture invitehub-app xcrun devicectl device info apps --device "$DEVICE_ID" --bundle-id "$BUNDLE_ID" --columns '*' || CAPTURE_FAILED=1
run_json_capture invitehub-processes xcrun devicectl device info processes --device "$DEVICE_ID" --filter "$INVITEHUB_PROCESS_FILTER" --columns '*' || CAPTURE_FAILED=1

if [[ "$CAPTURE_FAILED" -ne 0 ]]; then
  echo "TESTFLIGHT DEVICE EVIDENCE RESULT" >&2
  echo "- Output: $OUT_DIR" >&2
  echo "- Status: fail (one or more device commands failed)" >&2
  exit 1
fi

if ! node scripts/verify-testflight-build66-evidence.mjs "$OUT_DIR"; then
  echo "- Status: fail (installed app metadata does not match 1.0.3 (66))" >&2
  exit 1
fi

if [[ "$OPEN_TESTFLIGHT" -eq 1 ]]; then
  echo "== open-testflight =="
  echo "+ xcrun devicectl device process --timeout 30 --json-output $OUT_DIR/open-testflight.json launch --device $DEVICE_ID --terminate-existing $TESTFLIGHT_BUNDLE_ID" > "$OUT_DIR/open-testflight.command.txt"
  xcrun devicectl device process --timeout 30 --json-output "$OUT_DIR/open-testflight.json" launch --device "$DEVICE_ID" --terminate-existing "$TESTFLIGHT_BUNDLE_ID" > "$OUT_DIR/open-testflight.txt" 2>&1
  open_testflight_status=$?
  echo "$open_testflight_status" > "$OUT_DIR/open-testflight.exit-code.txt"
  if [[ $open_testflight_status -ne 0 ]]; then
    echo "ERROR: open-testflight exited with $open_testflight_status. See $OUT_DIR/open-testflight.txt" >&2
    CAPTURE_FAILED=1
  fi

  sleep 2
fi

if [[ "$LAUNCH" -eq 1 ]]; then
  echo "== launch =="
  echo "+ xcrun devicectl device process --timeout 30 --json-output $OUT_DIR/launch.json launch --device $DEVICE_ID --terminate-existing $BUNDLE_ID" > "$OUT_DIR/launch.command.txt"
  xcrun devicectl device process --timeout 30 --json-output "$OUT_DIR/launch.json" launch --device "$DEVICE_ID" --terminate-existing "$BUNDLE_ID" > "$OUT_DIR/launch.txt" 2>&1
  launch_status=$?
  echo "$launch_status" > "$OUT_DIR/launch.exit-code.txt"
  if [[ $launch_status -ne 0 ]]; then
    echo "ERROR: launch exited with $launch_status. See $OUT_DIR/launch.txt" >&2
    CAPTURE_FAILED=1
  fi

  sleep 3
  run_json_capture invitehub-processes-after-launch xcrun devicectl device info processes --device "$DEVICE_ID" --filter "$INVITEHUB_PROCESS_FILTER" --columns '*' || CAPTURE_FAILED=1
  if ! node scripts/verify-testflight-build66-evidence.mjs "$OUT_DIR" --require-launch; then
    echo "ERROR: launch evidence did not prove a running metadata-matching process." >&2
    CAPTURE_FAILED=1
  fi
fi

cat > "$OUT_DIR/summary.md" <<EOF
# TestFlight Device Evidence

- Captured at: $(date '+%Y-%m-%d %H:%M:%S %Z')
- Device: \`$DEVICE_LABEL\` (redacted)
- Bundle id: \`$BUNDLE_ID\`
- TestFlight bundle id: \`$TESTFLIGHT_BUNDLE_ID\`
- TestFlight launch attempted: \`$OPEN_TESTFLIGHT\`
- Launch attempted: \`$LAUNCH\`

Review:

- \`devices.txt\` / \`devices.json\`
- \`lock-state.txt\` / \`lock-state.json\`
- \`testflight-app.txt\` / \`testflight-app.json\`
- \`invitehub-app.txt\` / \`invitehub-app.json\`
- \`invitehub-processes.txt\` / \`invitehub-processes.json\`
- \`open-testflight.txt\` / \`open-testflight.json\` when
  \`--open-testflight\` is used
- \`launch.txt\` / \`launch.json\` when \`--launch\` is used
- \`invitehub-processes-after-launch.txt\` /
  \`invitehub-processes-after-launch.json\` when \`--launch\` is used
EOF

echo "TESTFLIGHT DEVICE EVIDENCE RESULT"
echo "- Output: $OUT_DIR"
echo "- Device: $DEVICE_LABEL (redacted)"
echo "- Bundle: $BUNDLE_ID"
echo "- TestFlight bundle: $TESTFLIGHT_BUNDLE_ID"
echo "- TestFlight launch attempted: $OPEN_TESTFLIGHT"
echo "- Launch attempted: $LAUNCH"

if [[ "$CAPTURE_FAILED" -ne 0 ]]; then
  echo "- Status: fail (one or more device commands failed)" >&2
  exit 1
fi
