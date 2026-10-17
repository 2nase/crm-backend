# Sourced by both hooks. Lists what the typecheck gate watches: the files tsc compiles
# (.ts, .tsx, .mts, .cts, and JSON under src/ because of resolveJsonModule) outside
# node_modules, dist and top-level dot folders, plus the Prisma schema and TS/npm config.
# Pass the find actions as arguments, always ending in an action such as -print or -exec
# (e.g. -newer REF -print -quit).
watched() {
  find . \( -path ./node_modules -o -path ./dist -o -path './.*' \) -prune -o \
    \( -name '*.ts' -o -name '*.tsx' -o -name '*.mts' -o -name '*.cts' -o -path './src/*.json' \
      -o -name schema.prisma -o -name 'tsconfig*.json' -o -name 'package*.json' \) "$@" 2>/dev/null
}

# One sorted "checksum size path" line per watched file. Unlike modification times, it also
# changes on a swap by renames, a cp -p or a restored backup.
fingerprint() {
  watched -exec cksum {} + | LC_ALL=C sort
}
