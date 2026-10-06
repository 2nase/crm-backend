---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
---

# Web Interface Guidelines

Review files for compliance with the Web Interface Guidelines.

## How It Works

1. Read the files or glob pattern the user specified. If none were specified, ask the user which files to review.
2. Read `guidelines.md` in this skill's directory. It contains all the rules and the output format.
3. Check the files against every rule in `guidelines.md`, including the anti-patterns list.
4. Output findings in the terse `file:line` format that `guidelines.md` specifies, grouped by file.

## Why Vendored

The upstream skill (vercel-labs/agent-skills, `skills/web-design-guidelines`) downloaded its rules from the `main` branch of vercel-labs/web-interface-guidelines at the start of every review. That meant the instructions the agent followed could change at any time without review.

This adaptation ships a reviewed snapshot instead: `guidelines.md` is vercel-labs/web-interface-guidelines `command.md` at commit 434b7f9, with every rule kept verbatim. Do not fetch guidelines from the network at review time; use only the local `guidelines.md`.

To update: diff the upstream `command.md` against `guidelines.md`, re-audit every changed line, then update `guidelines.md` and the commit reference in its provenance note.

## License

MIT. Copyright (c) 2025 Vercel Labs. See `LICENSE` in this directory.
