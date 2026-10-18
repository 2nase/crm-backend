# Sourced by both hooks. Lists what the typecheck gate watches: the files tsc compiles
# (.ts, .tsx, .mts, .cts, and JSON under src/ because of resolveJsonModule) outside
# node_modules, dist and top-level dot folders, plus the Prisma schema and TS/npm config.
# -L follows symlinked folders, as tsc does.
# Pass the find actions as arguments, always ending in an action such as -print or -exec
# (e.g. -newer REF -print -quit).
watched() {
  find -L . \( -path ./node_modules -o -path ./dist -o -path './.*' \) -prune -o \
    \( -name '*.ts' -o -name '*.tsx' -o -name '*.mts' -o -name '*.cts' -o -path './src/*.json' \
      -o -name schema.prisma -o -name 'tsconfig*.json' -o -name 'package*.json' \) "$@" 2>/dev/null
}

# One sorted "checksum size path" line per watched file. Unlike modification times, it also
# changes on a swap by renames, a cp -p or a restored backup.
fingerprint() {
  watched -exec cksum {} + | LC_ALL=C sort
}

# Checksums of the Prisma schema and of the copy Prisma keeps next to the client, one per line.
schema_sums() {
  cksum < prisma/schema.prisma && cksum < node_modules/.prisma/client/schema.prisma
}

# True when the Prisma client is known to be built from the current schema. Prisma's copy is
# formatted, so an unformatted schema (alignment, trailing spaces, CRLF) never matches it byte
# for byte; for that case generate_client records both checksums. Only the hooks' own generates
# are recorded: a client generated outside them from an unformatted schema counts as stale once.
client_current() {
  local sums
  cmp -s prisma/schema.prisma node_modules/.prisma/client/schema.prisma && return 0
  [ -f .claude/.typecheck-schema ] && sums=$(schema_sums 2>/dev/null) &&
    [ "$sums" = "$(cat .claude/.typecheck-schema)" ]
}

# prisma generate, then the record that client_current reads. Prisma's own output passes through.
# Fails only when the schema cannot be read or prisma generate fails.
generate_client() {
  local s m=.claude/.typecheck-gen.$$
  rm -f .claude/.typecheck-schema 2>/dev/null || :
  touch "$m" 2>/dev/null || :
  s=$(cksum < prisma/schema.prisma) || { rm -f "$m"; return 1; }
  if ! node_modules/.bin/prisma generate; then rm -f "$m"; return 1; fi
  # No record when the schema was written while Prisma ran, even if it was changed back since:
  # the client may come from the other version.
  if [ -f "$m" ] && [ -z "$(find -L prisma/schema.prisma -cnewer "$m" 2>/dev/null)" ] &&
    [ "$(cksum < prisma/schema.prisma 2>/dev/null)" = "$s" ]; then
    { printf '%s\n' "$s"; cksum < node_modules/.prisma/client/schema.prisma; } \
      > .claude/.typecheck-schema 2>/dev/null || rm -f .claude/.typecheck-schema 2>/dev/null
  fi
  rm -f "$m" 2>/dev/null || :
  return 0
}
