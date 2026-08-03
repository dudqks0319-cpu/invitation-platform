#!/bin/zsh
set -euo pipefail

typeset -r SCRIPT_DIR="${0:A:h}"
typeset -r ROOT="${SCRIPT_DIR:h}"
typeset -r GIT_ROOT="$(git -C "$ROOT" rev-parse --show-toplevel)"

if [[ "${GIT_ROOT:A}" != "${ROOT:A}" ]]; then
  echo "Release gate root mismatch: expected $ROOT, found $GIT_ROOT" >&2
  exit 64
fi

if [[ -n "${RELEASE_STATUS_PATH:-}" ||
      -n "${CURRENT_RELEASE_STATE_PATH:-}" ||
      -n "${RELEASE_LEDGER_PATH:-}" ||
      "${ALLOW_RELEASE_FIXTURE_PATHS:-0}" != "0" ]]; then
  echo "Release evidence path overrides are forbidden in the production gate." >&2
  exit 64
fi

cd "$ROOT"
RELEASE_BLOCKED=0

run_step() {
  local name="$1"
  shift

  echo "==> $name"
  "$@"
}

run_step "release candidate identity preflight" node scripts/verify-release-candidate.mjs build
run_step "web lint" npm run lint
run_step "web typecheck" npm run typecheck
run_step "web/api tests" npm run test -- --exclude='**/.claude/**'
run_step "mobile lint" npm --prefix apps/mobile run lint
run_step "mobile typecheck" npm --prefix apps/mobile run typecheck
run_step "mobile focused tests" npx vitest run \
  apps/mobile/app.config.test.ts \
  apps/mobile/lib/template-gallery.test.ts \
  apps/mobile/lib/template-preview-source.test.ts \
  apps/mobile/lib/builder-validation.test.ts \
  apps/mobile/lib/invitations.test.ts \
  apps/mobile/lib/payments/store-verification.test.ts \
  app/api/payments/free-publish/route.test.ts \
  app/api/payments/store/verify/route.test.ts \
  app/api/templates/route.test.ts \
  --exclude='**/.claude/**'

run_step "App Store packet verification" node scripts/verify-app-store-packet.mjs

if [[ "${SKIP_AUDIT:-0}" == "1" ]]; then
  echo "==> dependency audit skipped; release remains blocked"
  RELEASE_BLOCKED=1
elif [[ "${ALLOW_ONLINE_AUDIT:-0}" == "1" ]]; then
  run_step "high severity dependency audit" npm audit --audit-level=high
else
  run_step "offline runtime dependency audit (supplemental only)" npm audit --omit=dev --offline
  run_step "offline full-tree dependency audit (supplemental only)" npm audit --offline
  echo "==> online dependency audit not authorized; release remains blocked"
  RELEASE_BLOCKED=1
fi

if [[ "${SKIP_IOS_RELEASE_BUILD:-0}" != "1" ]]; then
  run_step "iOS release simulator build" npm --prefix apps/mobile run ios -- --device "${DEVICE_NAME:-iPhone 17}" --configuration Release --no-bundler
else
  echo "==> iOS release simulator build skipped; this invocation is not complete release proof"
  RELEASE_BLOCKED=1
fi

if [[ "$RELEASE_BLOCKED" -ne 0 ]]; then
  cat <<'EOF'
RELEASE GATE RESULT
- Status: blocked
- Required follow-up: authorize the online dependency audit and run the iOS
  Release build, then verify TestFlight installation and App Store Connect
  metadata before external submission.
EOF
  exit 2
fi

cat <<'EOF'
RELEASE GATE RESULT
- Status: pass
- Required follow-up: verify TestFlight install and App Store Connect metadata in the Apple console before external submission.
EOF
