#!/bin/zsh
set -euo pipefail

ROOT="${ROOT:-/Users/jyb-m3max/Desktop/codex/invitation-platform}"
cd "$ROOT"

run_step() {
  local name="$1"
  shift

  echo "==> $name"
  "$@"
}

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

if [[ "${SKIP_AUDIT:-0}" != "1" ]]; then
  run_step "high severity dependency audit" npm audit --audit-level=high
fi

if [[ "${SKIP_IOS_RELEASE_BUILD:-0}" != "1" ]]; then
  run_step "iOS release simulator build" npm --prefix apps/mobile run ios -- --device "${DEVICE_NAME:-iPhone 17}" --configuration Release --no-bundler
fi

cat <<'EOF'
RELEASE GATE RESULT
- Status: pass
- Required follow-up: verify TestFlight install and App Store Connect metadata in the Apple console before external submission.
EOF
