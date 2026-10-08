#!/bin/bash
# Stop hook: Claude cannot finish while the project typecheck or Prisma client generation is red.
# Runs only when a .ts file, prisma/schema.prisma or TS/npm config changed since the last green
# run (or since session start). Whole project on purpose: tsc on single files ignores
# tsconfig.json, and NestJS decorators need experimentalDecorators/emitDecoratorMetadata.
cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)
export CHECKPOINT_DISABLE=1 OPENCOLLECTIVE_HIDE=1

# Documented loop guard: on the retry turn let Claude stop and report instead of looping.
printf '%s' "$input" | grep -q '"stop_hook_active": *true' && exit 0

ok=.claude/.typecheck-ok
ref=$ok
[ -f "$ref" ] || ref=.claude/.session-start
if [ -f "$ref" ]; then
  # Same files tsc compiles: every .ts outside node_modules, dist and dot-directories.
  changed=$(find . \( -path ./node_modules -o -path ./dist -o -path './.*' \) -prune -o \
    \( -name '*.ts' -o -name schema.prisma -o -name 'tsconfig*.json' -o -name 'package*.json' \) \
    -newer "$ref" -print -quit 2>/dev/null)
else
  changed=$(git status --porcelain -- '*.ts' prisma/schema.prisma 'tsconfig*.json' 'package*.json' 2>/dev/null)
fi
[ -z "$changed" ] && exit 0

if [ ! -x node_modules/.bin/tsc ]; then
  echo "Typecheck gate: node_modules missing. Run 'npm ci && npm run prisma:generate' (do NOT edit tsconfig to silence TS5101)." >&2
  exit 2
fi
if [ ! -f "$ok" ] || [ prisma/schema.prisma -nt "$ok" ]; then
  if ! gen=$(node_modules/.bin/prisma generate 2>&1); then
    {
      echo "prisma generate failed. Fix prisma/schema.prisma, then finish:"
      printf '%s\n' "$gen" | tail -25
    } >&2
    exit 2
  fi
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
