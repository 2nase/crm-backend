#!/bin/bash
# Stop hook: Claude cannot finish while the project typecheck or Prisma client generation is red.
# Runs only when a watched file (see watched.sh) was added, edited, deleted, renamed or replaced
# since the last green run (before the first one: since the first session in this checkout).
# Whole project on purpose: tsc on single files ignores tsconfig.json, and NestJS decorators
# need experimentalDecorators/emitDecoratorMetadata.
cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)
export CHECKPOINT_DISABLE=1 OPENCOLLECTIVE_HIDE=1

# Documented loop guard: on the retry turn let Claude stop and report instead of looping.
printf '%s' "$input" | grep -q '"stop_hook_active": *true' && exit 0

. .claude/hooks/watched.sh
ok=.claude/.typecheck-ok       # its mtime is the start of the last green run
list=.claude/.typecheck-files  # fingerprint of the watched files at that point (or at session start)
ref=$ok
[ -f "$ref" ] || ref=.claude/.session-start
if [ -f "$ref" ]; then
  changed=$(watched -newer "$ref" -print -quit)
  # A delete, rename or restored copy leaves no newer file behind, so compare contents too.
  if [ -z "$changed" ] && { [ -f "$list" ] || [ -f "$ok" ]; }; then
    [ "$(fingerprint)" = "$(cat "$list" 2>/dev/null)" ] || changed=list
  fi
else
  changed=$(git status --porcelain -- '*.ts' '*.tsx' '*.mts' '*.cts' 'src/*.json' \
    prisma/schema.prisma 'tsconfig*.json' 'package*.json' 2>/dev/null)
fi
[ -z "$changed" ] && exit 0

if [ ! -x node_modules/.bin/tsc ]; then
  echo "Typecheck gate: node_modules missing. Run 'npm ci && npm run prisma:generate' (do NOT edit tsconfig to silence TS5101)." >&2
  exit 2
fi
# Taken before the check: an edit made while it runs stays newer than the next reference.
start=.claude/.typecheck-start.$$
touch "$start"
snapshot=$(fingerprint)
# Every run regenerates the Prisma client that tsc checks against: a restored schema can keep
# an old modification time.
if ! gen=$(node_modules/.bin/prisma generate 2>&1); then
  rm -f "$start"
  {
    echo "prisma generate failed. Fix prisma/schema.prisma, then finish:"
    printf '%s\n' "$gen" | tail -25
  } >&2
  exit 2
fi
if out=$(node_modules/.bin/tsc --noEmit -p tsconfig.json 2>&1); then
  printf '%s\n' "$snapshot" > "$list.$$" && mv -f "$list.$$" "$list"
  mv -f "$start" "$ok"
  exit 0
fi
rm -f "$start"
{
  echo "Typecheck is red. Fix the root cause (no any/@ts-ignore), then finish:"
  printf '%s\n' "$out" | head -40
} >&2
exit 2
