#!/bin/bash
# Stop hook: Claude cannot finish while the project-wide typecheck is red.
# Runs tsc only when src/, prisma/ or TS/npm config changed since the last green run
# (or since session start). Whole project on purpose: tsc on single files ignores
# tsconfig.json, and NestJS decorators need experimentalDecorators/emitDecoratorMetadata.
cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)

# Documented loop guard: on the retry turn let Claude stop and report instead of looping.
printf '%s' "$input" | grep -q '"stop_hook_active": *true' && exit 0

watched="src prisma tsconfig.json package.json"
ok=.claude/.typecheck-ok
ref=$ok
[ -f "$ref" ] || ref=.claude/.session-start
if [ -f "$ref" ]; then
  # shellcheck disable=SC2086
  [ -z "$(find $watched -newer "$ref" -print -quit 2>/dev/null)" ] && exit 0
else
  # shellcheck disable=SC2086
  [ -z "$(git status --porcelain -- $watched 2>/dev/null)" ] && exit 0
fi

if [ ! -x node_modules/.bin/tsc ]; then
  echo "Typecheck gate: node_modules missing. Run 'npm ci && npx prisma generate' (do NOT edit tsconfig to silence TS5101)." >&2
  exit 2
fi
if [ ! -f "$ok" ] || [ prisma/schema.prisma -nt "$ok" ]; then
  node_modules/.bin/prisma generate >/dev/null 2>&1 || true
fi
if out=$(node_modules/.bin/tsc --noEmit -p tsconfig.json 2>&1); then
  touch "$ok"
  exit 0
fi
{
  echo "Typecheck is red. Fix the root cause (no any/@ts-ignore), then finish:"
  printf '%s\n' "$out" | head -40
} >&2
exit 2
