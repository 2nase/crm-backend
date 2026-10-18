# ponytail — audited adaptation

Source: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) @552acd5 (MIT, see `LICENSE`), plugin version 4.13.0.

## What is installed

The six skills, as project skills: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`.

## What is deliberately not installed

- **Hooks** (`hooks/*.js`, `claude-codex-hooks.json`): on SessionStart, SubagentStart and UserPromptSubmit they write flag/config files (`$CLAUDE_CONFIG_DIR`, `~/.config/ponytail`) and inject "ponytail mode" into every session and every subagent. No network access was found, but always-on injection costs tokens every turn and overrides other skills' guidance in subagents. The skills work on demand without them.
- Status-line scripts, plugin/marketplace manifests, rules for other IDEs (Cursor, Windsurf, Cline, Qoder, Copilot), images.

## Changes to upstream text

1. `ponytail/SKILL.md`, *Boundaries*: added that it is a skills-only install and that it limits what gets built while the `unlazy` gates still decide when work is done.
2. `ponytail-help/SKILL.md`: replaced *Configure Default Mode* and *Update* (only meaningful with hooks/plugin install) with *Installation in this project*.
3. `ponytail-gain`, `ponytail-help`: added `disable-model-invocation: true`; they are manual one-shot cards, so their descriptions no longer occupy the skill listing.

## Audit notes

All six SKILL.md files (395 lines) were read in full; hooks were reviewed for network, process and file access. No prompt injection, hidden content, telemetry or promotional directives. `ponytail-gain` shows the author's published benchmark averages and explicitly refuses to invent per-repo numbers.

## Fixes from the PR review of 2026-10-08

Before these fixes, the six SKILL.md files were diffed against the raw upstream files at 552acd5. The only differences were changes 1 to 3 above. The upstream files have 395 lines in total.

- `ponytail` description: it said "Use on ANY coding task" and also fired on complaints about over-engineering, so it switched itself on for routine work. That is the always-on effect the hooks were left out for, and it contradicted the help card's "no auto-activation". It now fires only when the user asks: `/ponytail` or one of its phrases ("ponytail", "be lazy", "lazy mode", "simplest solution", "minimal solution", "yagni", "do less", "shortest path"). `disable-model-invocation` was not added, because that needs the owner's OK, so the phrases still work.
- `ponytail` *Persistence*: "ACTIVE EVERY RESPONSE ... Still active if unsure" became: active from the user's request until the current task is done, unless the user says to keep it on. `/ponytail off` is now a real switch (also in `argument-hint`), because the help card already promised it.
- `ponytail` *Boundaries*: it applies only on request and ends with the task, and CLAUDE.md comes first: its ask-first rules still apply, and its Definition of done decides when work is done. This replaces "or when a coding task triggers it" from change 1. The pointer to Caveman, a third-party skill that is neither installed nor reviewed, was removed.
- `ponytail-help`: the level line, *Deactivate* and *Installation in this project* now match: it starts with `/ponytail` or when asked, ends with the task, and `/ponytail off` works.
- `ponytail-gain`: the source line pointed to `benchmarks/results/2026-06-18-agentic.md` and "the README", which are not installed here (README.md in this repo is the CRM's). It now names the upstream repo and commit. The scoreboard figures were checked against that upstream file and match: 12 feature tasks at -54% lines, -22% tokens, -20% cost and -27% time; 6 safety tasks, 100% safe.

## Fixes from the second PR review of 2026-10-17

- `ponytail` (body, after the heading): "Start only when the user asks for it (see the description); do not start it on your own for other coding tasks." Why: the guard was only in the description, and Claude Code 2.1.302 shows skill descriptions only within a size budget (about 8,000 characters at 200k context, per the review's reading of the binary) and lists the rest by name only. This PR's skills and commands need about 21,500 characters, so the description may not be shown. `disable-model-invocation` would make it request-only for sure, but that needs the owner's OK.

