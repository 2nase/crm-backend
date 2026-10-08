#!/bin/bash
# SessionStart (cloud sessions only): make the typecheck gate work in a fresh VM.
# Idempotent: installs only when node_modules is missing or package-lock.json changed.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR"
input=""
[ -t 0 ] || input=$(cat)

# No usage telemetry from Prisma, no opencollective ping from @nestjs/core's postinstall.
export CHECKPOINT_DISABLE=1 OPENCOLLECTIVE_HIDE=1

stamp=node_modules/.install-stamp
if [ ! -f "$stamp" ] || [ package-lock.json -nt "$stamp" ]; then
  # npm ci: exact lockfile, never rewrites package-lock.json (npm install did, leaving a dirty tree).
  # Runs only on first start or lockfile change; the cached container keeps node_modules.
  npm ci --no-audit --no-fund --no-update-notifier --loglevel=error >/dev/null
  touch "$stamp"
fi
if [ ! -d node_modules/.prisma/client ] || [ prisma/schema.prisma -nt node_modules/.prisma/client ]; then
  npx --no-install prisma generate >/dev/null
fi
[ -f .env ] || cp .env.example .env

# Reference point for the typecheck Stop hook: only files changed after this get checked.
# Set it on startup only, so resume, clear and compact keep unverified edits in view.
if [ ! -f .claude/.session-start ] || printf '%s' "$input" | grep -q '"source": *"startup"'; then
  touch .claude/.session-start
fi
