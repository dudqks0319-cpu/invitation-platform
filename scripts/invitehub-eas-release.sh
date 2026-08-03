#!/bin/zsh
set -euo pipefail

typeset -r SCRIPT_DIR="${0:A:h}"
typeset -r ROOT="${SCRIPT_DIR:h}"
typeset -r ACTION="${1:-}"

cd "$ROOT"

case "$ACTION" in
  build)
    if [[ "$#" -ne 1 ]]; then
      echo "Usage: $0 build" >&2
      exit 64
    fi
    node scripts/verify-release-candidate.mjs build
    exec eas build --platform ios --profile production --non-interactive --wait
    ;;
  upload)
    if [[ "$#" -ne 2 ]]; then
      echo "Usage: $0 upload <candidate.ipa>" >&2
      exit 64
    fi
    typeset -r ARTIFACT="$2"
    node scripts/verify-release-candidate.mjs upload --artifact "$ARTIFACT"
    exec eas submit --platform ios --profile production --path "$ARTIFACT" --non-interactive
    ;;
  *)
    echo "Usage: $0 <build|upload> [candidate.ipa]" >&2
    exit 64
    ;;
esac
