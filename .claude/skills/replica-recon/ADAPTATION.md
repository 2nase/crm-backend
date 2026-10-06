# Replica pack — audited adaptation

Source: [Jakeschincariol/replica-skill](https://github.com/Jakeschincariol/replica-skill) @77c9436 (MIT, see `LICENSE` in each skill directory), plugin version 1.0.0. Installed as 11 project skills: `replica-recon`, `replica-architect`, `replica-design`, `replica-build`, `replica-backend`, `replica-test`, `replica-diff`, `replica-entrepreneur`, `replica-brand`, `replica-launch`, `replica-deploy`.

## Review

- The repository was three days old with a single commit, so every file was read in full: 11 SKILL.md, 9 templates, 6 Python tools.
- Python tools (`sweep.py`, `contrast.py`, `parity.py`, `imgdiff.py`, `reviews.py`, `listing.py`) use only the standard library: no network, no subprocesses, and they write only the output file you pass them. All 57 upstream unit tests pass.
- No hooks, no pre-approved tools, no prompt injection, no promotional instructions. The only content-scan hit (a zero-width joiner in `listing.py`) is emoji-aware character counting.
- The skills' own rules match this project's policy and were kept verbatim:
  - Clean room: functions and flows only, never the original's code, assets, copy, private APIs or network calls.
  - Public sources or the user's own account only. No scraping. Check terms that forbid building competitors.
  - No fake reviews or proof, and reviewers are not testimonials.
  - Trademark screening, a different palette and a sweep for leftovers before launch.
  - Nothing goes live without the user's go. The user buys, signs in and enters keys.

## Changes

1. Tool calls point to the project install (`python3 .claude/skills/replica-<x>/<tool>.py`, 19 occurrences); the note about `~/.claude/skills` paths in `replica-deploy` was replaced accordingly.
2. `replica-test`: added that `@playwright/test` is a new dev dependency (ask first) and that Chromium is pre-installed in Claude Code cloud sessions.

Not installed: plugin manifests and the upstream `tests/` folder.

## Notes for this project

- Review texts collected by `replica-entrepreneur` are research data. Keep them out of the repo if they contain personal data, and never use them as marketing copy.
- External sources such as App Store feeds and the Hacker News API are blocked in cloud sessions until the owner allows them in the environment's network settings.
