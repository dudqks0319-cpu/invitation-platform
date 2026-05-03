#!/usr/bin/env bash
set -u

DEVICE_ID="${DEVICE_ID:-8CCEF0FF-05C7-5A6F-BF68-38DF12FA83C4}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-600}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-5}"
OUT_ROOT="${OUT_ROOT:-output/testflight-device-watch}"
STAMP="$(date '+%Y%m%d-%H%M%S')"
OUT_DIR="${OUT_DIR:-$OUT_ROOT/$STAMP}"
COLLECT_ON_READY=1
LAUNCH_ON_READY=0
OPEN_TESTFLIGHT_ON_READY=0

usage() {
  cat <<EOF
Usage: DEVICE_ID=<device-id> $0 [--timeout seconds] [--interval seconds] [--no-collect] [--launch] [--open-testflight]

Wait until a paired iPhone becomes available to CoreDevice, then optionally
collect focused InviteHub TestFlight evidence.

Defaults:
  DEVICE_ID=$DEVICE_ID
  TIMEOUT_SECONDS=$TIMEOUT_SECONDS
  INTERVAL_SECONDS=$INTERVAL_SECONDS
  OUT_DIR=$OUT_DIR

Options:
  --timeout seconds   Stop waiting after this many seconds.
  --interval seconds  Seconds between device checks.
  --no-collect        Only wait and report readiness.
  --launch            Run the evidence collector with --launch when ready.
  --open-testflight   Run the evidence collector with --open-testflight when
                      ready so the user can update or inspect InviteHub.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --timeout)
      TIMEOUT_SECONDS="${2:?missing value for --timeout}"
      shift 2
      ;;
    --interval)
      INTERVAL_SECONDS="${2:?missing value for --interval}"
      shift 2
      ;;
    --no-collect)
      COLLECT_ON_READY=0
      shift
      ;;
    --launch)
      LAUNCH_ON_READY=1
      shift
      ;;
    --open-testflight)
      OPEN_TESTFLIGHT_ON_READY=1
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

mkdir -p "$OUT_DIR"
START_SECONDS="$(date '+%s')"
LAST_STATE="unknown"

while true; do
  NOW_SECONDS="$(date '+%s')"
  ELAPSED_SECONDS="$((NOW_SECONDS - START_SECONDS))"
  JSON_PATH="$OUT_DIR/devices-$ELAPSED_SECONDS.json"
  TEXT_PATH="$OUT_DIR/devices-$ELAPSED_SECONDS.txt"

  xcrun devicectl --json-output "$JSON_PATH" list devices > "$TEXT_PATH" 2>&1
  DEVICESTATUS=$?

  if [[ "$DEVICESTATUS" -eq 0 ]]; then
    STATE="$(node -e "const fs=require('fs'); const p=process.argv[1]; const id=process.argv[2]; const data=JSON.parse(fs.readFileSync(p,'utf8')); const d=(data.result?.devices||[]).find((item)=>item.identifier===id || item.hardwareProperties?.udid===id || item.deviceProperties?.name===id); if(!d){process.stdout.write('missing'); process.exit(0);} process.stdout.write(d.connectionProperties?.tunnelState || 'unknown');" "$JSON_PATH" "$DEVICE_ID")"
    LAST_STATE="$STATE"
    echo "[$ELAPSED_SECONDS/$TIMEOUT_SECONDS] device tunnelState=$STATE"

    if [[ "$STATE" != "missing" && "$STATE" != "unknown" && "$STATE" != "unavailable" ]]; then
      echo "TESTFLIGHT DEVICE READY"
      echo "- Device: $DEVICE_ID"
      echo "- State: $STATE"
      echo "- Output: $OUT_DIR"

      if [[ "$COLLECT_ON_READY" -eq 1 ]]; then
        collector_args=()
        if [[ "$LAUNCH_ON_READY" -eq 1 ]]; then
          collector_args+=(--launch)
        fi
        if [[ "$OPEN_TESTFLIGHT_ON_READY" -eq 1 ]]; then
          collector_args+=(--open-testflight)
        fi
        OUT_ROOT="$OUT_DIR/evidence" scripts/collect-testflight-device-evidence.sh "${collector_args[@]}"
      fi

      exit 0
    fi
  else
    LAST_STATE="devicectl-error"
    echo "[$ELAPSED_SECONDS/$TIMEOUT_SECONDS] devicectl exited with $DEVICESTATUS"
  fi

  if [[ "$ELAPSED_SECONDS" -ge "$TIMEOUT_SECONDS" ]]; then
    echo "TESTFLIGHT DEVICE WAIT RESULT"
    echo "- Status: timeout"
    echo "- Device: $DEVICE_ID"
    echo "- Last State: $LAST_STATE"
    echo "- Output: $OUT_DIR"
    exit 1
  fi

  sleep "$INTERVAL_SECONDS"
done
