#!/bin/zsh
set -euo pipefail

ROOT="${ROOT:-/Users/jyb-m3max/Desktop/codex/invitation-platform}"
SCREENSHOT_DIR="${1:-$ROOT/output/store-screenshots-current}"

if [[ ! -d "$SCREENSHOT_DIR" ]]; then
  echo "Screenshot directory not found: $SCREENSHOT_DIR" >&2
  exit 1
fi

files=("$SCREENSHOT_DIR"/*.png(N) "$SCREENSHOT_DIR"/*.jpg(N) "$SCREENSHOT_DIR"/*.jpeg(N))

if (( ${#files[@]} == 0 )); then
  echo "No PNG/JPG screenshots found in $SCREENSHOT_DIR" >&2
  exit 1
fi

if (( ${#files[@]} > 10 )); then
  echo "Too many screenshots: ${#files[@]} found, App Store Connect accepts 1 to 10 per display set." >&2
  exit 1
fi

is_accepted_size() {
  local size="$1"

  case "$size" in
    1260x2736|2736x1260|1290x2796|2796x1290|1320x2868|2868x1320) return 0 ;; # iPhone 6.9"
    1284x2778|2778x1284|1242x2688|2688x1242) return 0 ;; # iPhone 6.5"
    1179x2556|2556x1179|1206x2622|2622x1206) return 0 ;; # iPhone 6.3"
    1170x2532|2532x1170|1125x2436|2436x1125|1080x2340|2340x1080) return 0 ;; # iPhone 6.1"
    1242x2208|2208x1242|750x1334|1334x750|640x1096|640x1136|1136x600|1136x640|640x920|640x960|960x600|960x640) return 0 ;;
    *) return 1 ;;
  esac
}

echo "STORE SCREENSHOT CHECK"
echo "- Directory: $SCREENSHOT_DIR"
echo "- Count: ${#files[@]}"

for file in "${files[@]}"; do
  width="$(sips -g pixelWidth "$file" 2>/dev/null | awk '/pixelWidth/ {print $2}')"
  height="$(sips -g pixelHeight "$file" 2>/dev/null | awk '/pixelHeight/ {print $2}')"
  size="${width}x${height}"

  if ! is_accepted_size "$size"; then
    echo "- FAIL: $(basename "$file") has unsupported size $size" >&2
    exit 1
  fi

  echo "- PASS: $(basename "$file") $size"
done

cat <<'EOF'

Manual visual checks still required:
- No iOS "Open in InviteHub" confirmation prompt.
- No dev warning overlay.
- No simulator toolbar/window chrome.
- Screenshots match the current App Store metadata and IAP state.
EOF
