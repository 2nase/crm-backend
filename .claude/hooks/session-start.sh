#!/bin/bash
# SessionStart: sets the typecheck Stop hook's reference point, local sessions included. In
# hosted cloud sessions it also makes the gate work in a fresh VM (dependencies, Prisma client,
# .env). Idempotent: installs only when node_modules/.install-stamp is missing or older than
# package-lock.json.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:?}"
[ -t 0 ] || cat > /dev/null  # the hook input is not needed
. .claude/hooks/watched.sh    # fingerprint, client_current, generate_client

# Reference point for the typecheck Stop hook until its first green run: files changed after
# this get checked. Set once per checkout, so later, parallel, resumed or cleared sessions keep
# unverified edits in view. Set before the installs, so a failed install cannot skip it.
if [ ! -f .claude/.session-start ]; then
  # Before the first green run the gate compares against this fingerprint to see deletes,
  # renames and restored copies.
  if [ ! -f .claude/.typecheck-ok ]; then
    fingerprint > .claude/.typecheck-files || true
  fi
  touch .claude/.session-start
fi

# Hosted cloud only: a self-hosted environment can be the owner's own machine.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && [ "${CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE:-}" != "self_hosted" ]; then
  # No usage telemetry from Prisma, no opencollective ping from @nestjs/core's postinstall.
  export CHECKPOINT_DISABLE=1 OPENCOLLECTIVE_HIDE=1

  stamp=node_modules/.install-stamp
  if [ ! -f "$stamp" ] || [ package-lock.json -nt "$stamp" ]; then
    # npm ci: exact lockfile, never rewrites package-lock.json (npm install did, leaving a dirty tree).
    # Runs on first start, on a lockfile change, or after an install that left no stamp (a setup
    # script or a manual npm ci); the cached container keeps node_modules.
    npm ci --no-audit --no-fund --no-update-notifier --loglevel=error >/dev/null
    touch "$stamp"
  fi
  if ! client_current; then
    generate_client >/dev/null
  fi
  [ -f .env ] || cp .env.example .env
fi
