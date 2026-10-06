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
