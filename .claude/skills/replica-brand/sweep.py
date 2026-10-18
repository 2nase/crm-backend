#!/usr/bin/env python3
"""Rebrand sweep for replica-brand and replica-deploy. Standard library only.

Searches your clone's codebase for anything that still belongs to the original
app: its name, its domain, its brand colours. Run it before every launch. It
exits 1 if it finds anything, so it can block a deploy.

    python3 sweep.py . --avoid "Calendly"
    python3 sweep.py . --avoid "Calendly,Calendly LLC" --domains calendly.com \\
        --colors "#006bff,#0ae8f0"
    python3 sweep.py . --config replica/brand.json --json

--config reads {"avoid": [...], "domains": [...], "colors": [...]}, the same
"avoid" list listing.py uses.

Names match case-insensitively anywhere, including inside identifiers
(CalendlyButton, calendly_sync), because those ship too. Colours match in any
case and in short form (#06f matches #0066ff). File and folder names are
checked as well as contents.

Skipped: .git, node_modules, build output folders, lock files, binary files,
and the replica/ planning folder (where the original's name belongs). Pass
--include-replica to check that too, for example if it sits inside public/.
Also skipped, because they are not part of the app: Claude Code's .claude/
folder and CLAUDE.md files (the skills and settings), virtualenvs (any folder
with a pyvenv.cfg), tool working folders (.playwright-cli, .scrapling_cache,
.unlazy, .pgdata and similar), and research_notes/, reports/, crawl_data/ and
dev_cache/ at the top level.

Files that commonly hold secrets are still searched, but a hit there shows
only the file and line, never the line itself: .env and .env.*, .npmrc, .netrc,
.pgpass and similar dotfiles, key, certificate, keystore and VPN files,
Terraform variables, Android local.properties, Docker and kube configs, auth
state, and other files named like credentials, secrets, service accounts or
kubeconfig. Web source code (.ts, .tsx, .js, .vue, .svelte, .astro, .html,
.css and the like) and CI workflows directly in .github/workflows/ are the
exception to that last group: CredentialsForm.tsx or lib/secrets.ts prints its
lines like any other file. Every other file in a folder named like that
(secrets/, prod-secrets/, config/credentials/, service-accounts/) is hidden
too, code included, and those hits name the nearest such folder, since an
ordinary feature folder can have such a name. The list covers the usual names,
not every file a secret could be in. Other files print the start of the
matching line.
"""

import argparse
import fnmatch
import json
import os
import re
import sys

SKIP_DIRS = {".git", "node_modules", ".next", ".nuxt", ".svelte-kit", "dist", "build",
             "out", ".vercel", ".turbo", ".cache", "coverage", "__pycache__", ".venv",
             "venv", "Pods", ".expo", "DerivedData", ".gradle",
             # Claude Code config and tool working folders, not the app
             ".claude", ".venv-scrapling", ".playwright-cli", ".auth", ".scrapling_cache",
             ".unlazy", ".pgdata", ".mypy_cache", ".pytest_cache", ".ruff_cache", ".tox",
             ".nox"}
# Research and crawl output: skipped at the top level only, so app folders with
# these names (src/reports/) are still searched.
SKIP_TOP_DIRS = {"research_notes", "reports", "crawl_data", "dev_cache"}
SKIP_FILES = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
              "Podfile.lock", "Cargo.lock", "poetry.lock", "CLAUDE.md", "CLAUDE.local.md"}
# Searched, but a hit shows only file and line (matched on the lower-case file name).
SECRET_FILES = (".env", ".env.*", "*.env", ".envrc", ".dev.vars", ".npmrc", ".yarnrc.yml",
                ".netrc", ".pypirc", ".pgpass", ".htpasswd", ".s3cfg", ".dockercfg",
                "*.pem", "*.key", "*.p8", "*.ppk", "*.asc", "*.ovpn", "id_rsa*", "id_dsa*",
                "id_ecdsa*", "id_ed25519*", "credentials", "credentials.json",
                "*service-account*.json", "google-services.json", "googleservice-info.plist",
                "auth.json", "*auth-state*.json", "*storage-state*.json", "*storagestate*.json",
                "*firebase-adminsdk*", "*.p12", "*.pfx", "*.keystore", "*.jks", "*.crt", "*.cer",
                "*.tfvars", "*.tfvars.json", "local.properties")
# The same, matched on the end of the lower-case path.
SECRET_PATHS = ("/.docker/config.json", "/.kube/config")
# Names that also fit ordinary app code (CredentialsForm.tsx, lib/secrets.ts), matched on the
# file name and on every folder of the path (secrets/prod.json, prod-secrets/). A file name hides
# the lines of files other than web code and CI workflows; a folder hides every file in it, and
# its hits name the nearest such folder, since an ordinary feature folder can be named like this.
BROAD_SECRET_NAMES = ("*credentials*", "*secret*", "*serviceaccount*", "*service_account*",
                      "*service-account*", "*kubeconfig*")
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts", ".vue", ".svelte",
            ".astro", ".css", ".scss", ".sass", ".less", ".html"}
HIDDEN = "(line not shown: this file can hold secrets)"
HIDDEN_DIR = "(line not shown: it is in %s/, a folder whose name suggests secrets)"
BINARY_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".icns", ".pdf", ".zip",
              ".gz", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp4", ".mov", ".mp3",
              ".wav", ".avif", ".heic", ".psd", ".sketch", ".fig", ".jar", ".so", ".dylib"}
HEX = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])")
BINARY_ASSET_HINT = re.compile(r"\.(png|jpe?g|svg|webp|gif|ico|woff2?|ttf|otf)$", re.I)


def norm_hex(h):
    h = h.lower().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return "#" + h


def build_patterns(avoid, domains):
    pats = []
    for name in avoid:
        name = name.strip()
        if not name:
            continue
        # "Acuity Scheduling" also matches AcuityScheduling and acuity-scheduling
        parts = [re.escape(p) for p in re.split(r"[\s_-]+", name) if p]
        pats.append(("name", name, re.compile(r"[\s_-]?".join(parts), re.I)))
    for d in domains:
        d = d.strip().lower()
        if d:
            pats.append(("domain", d, re.compile(re.escape(d), re.I)))
    return pats


def is_binary(path):
    if os.path.splitext(path)[1].lower() in BINARY_EXT:
        return True
    try:
        with open(path, "rb") as fh:
            return b"\0" in fh.read(4096)
    except OSError:
        return True


def hidden_text(rel):
    """What a hit in this file shows instead of its line, or None to show the line."""
    path = rel.replace(os.sep, "/")
    rel = path.lower()
    parts = rel.split("/")
    if any(fnmatch.fnmatchcase(parts[-1], pat) for pat in SECRET_FILES):
        return HIDDEN
    if ("/" + rel).endswith(SECRET_PATHS):
        return HIDDEN
    ext = os.path.splitext(parts[-1])[1]
    # GitHub runs only the workflow files directly in .github/workflows/.
    workflow = (path.startswith(".github/workflows/") and path.count("/") == 2
                and path.endswith((".yml", ".yaml")))
    code = ext in CODE_EXT or workflow  # web app code and CI workflows, written for the clone
    if not code and any(fnmatch.fnmatchcase(parts[-1], pat) for pat in BROAD_SECRET_NAMES):
        return HIDDEN
    for i in range(len(parts) - 2, -1, -1):  # the nearest such folder, in its original case
        if any(fnmatch.fnmatchcase(parts[i], pat) for pat in BROAD_SECRET_NAMES):
            return HIDDEN_DIR % "/".join(path.split("/")[:i + 1])
    return None


def sweep(root, avoid=(), domains=(), colors=(), include_replica=False, max_size=2_000_000):
    pats = build_patterns(avoid, domains)
    cols = {norm_hex(c) for c in colors if HEX.fullmatch(c.strip())}
    hits = []
    root = os.path.abspath(root)
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = os.path.relpath(dirpath, root)
        keep = []
        for d in dirnames:
            if d in SKIP_DIRS:
                continue
            if d == "replica" and rel_dir == "." and not include_replica:
                continue
            if d in SKIP_TOP_DIRS and rel_dir == ".":
                continue
            if os.path.isfile(os.path.join(dirpath, d, "pyvenv.cfg")):
                continue  # a virtualenv, whatever its name
            keep.append(d)
        dirnames[:] = sorted(keep)
        for d in dirnames:
            for kind, label, rx in pats:
                if kind == "name" and rx.search(d):
                    hits.append({"file": os.path.normpath(os.path.join(rel_dir, d)) + "/",
                                 "line": 0, "kind": "path", "match": label,
                                 "text": "folder name"})
        for fn in sorted(filenames):
            if fn in SKIP_FILES:
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.normpath(os.path.join(rel_dir, fn))
            hidden = hidden_text(rel)
            for kind, label, rx in pats:
                if kind == "name" and rx.search(fn):
                    hits.append({"file": rel, "line": 0, "kind": "path", "match": label,
                                 "text": "file name"})
            try:
                if os.path.getsize(path) > max_size or is_binary(path):
                    continue
                with open(path, encoding="utf-8", errors="replace") as fh:
                    lines = fh.readlines()
            except OSError:
                continue
            for i, line in enumerate(lines, 1):
                for kind, label, rx in pats:
                    if rx.search(line):
                        hits.append({"file": rel, "line": i, "kind": kind, "match": label,
                                     "text": hidden or line.strip()[:160]})
                if cols:
                    for m in HEX.finditer(line):
                        if norm_hex(m.group(0)) in cols:
                            hits.append({"file": rel, "line": i, "kind": "color",
                                         "match": norm_hex(m.group(0)),
                                         "text": hidden or line.strip()[:160]})
    return hits


def render(hits):
    if not hits:
        return "Clean. Nothing of the original's name, domain or colours found."
    out = []
    by_kind = {}
    for h in hits:
        by_kind.setdefault(h["kind"], 0)
        by_kind[h["kind"]] += 1
        loc = h["file"] if not h["line"] else "%s:%d" % (h["file"], h["line"])
        out.append("%-7s %-18s %s  %s" % (h["kind"], h["match"][:18], loc, h["text"]))
    out.append("")
    out.append("%d hits (%s). Replace every one before you launch."
               % (len(hits), ", ".join("%s %d" % kv for kv in sorted(by_kind.items()))))
    return "\n".join(out)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("root", nargs="?", default=".")
    ap.add_argument("--avoid", default="", help="comma-separated names")
    ap.add_argument("--domains", default="", help="comma-separated domains")
    ap.add_argument("--colors", default="", help="comma-separated hex colours")
    ap.add_argument("--config", help="JSON with avoid / domains / colors lists")
    ap.add_argument("--include-replica", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    avoid = [x for x in args.avoid.split(",") if x.strip()]
    domains = [x for x in args.domains.split(",") if x.strip()]
    colors = [x for x in args.colors.split(",") if x.strip()]
    if args.config:
        try:
            with open(args.config, encoding="utf-8") as fh:
                cfg = json.load(fh)
        except (OSError, ValueError) as exc:
            print("sweep: %s" % exc, file=sys.stderr)
            return 2
        avoid += cfg.get("avoid", [])
        domains += cfg.get("domains", [])
        colors += cfg.get("colors", [])
    if not (avoid or domains or colors):
        print("sweep: nothing to look for. Pass --avoid with the original app's name.",
              file=sys.stderr)
        return 2
    hits = sweep(args.root, avoid, domains, colors, args.include_replica)
    print(json.dumps(hits, indent=2) if args.json else render(hits))
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main())
