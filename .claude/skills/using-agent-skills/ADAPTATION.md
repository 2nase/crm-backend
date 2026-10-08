# agent-skills — audited adaptation

Source: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) @1401c8b (MIT, see `LICENSE` in each skill directory and `.claude/references/LICENSE`), plugin version 0.6.12.

## What is installed where

| Upstream | Installed as |
|---|---|
| `skills/<name>/` (25 skills) | `.claude/skills/<name>/` |
| `references/*.md` (7 shared checklists) | `.claude/references/` — keeps the upstream `../../references/` links valid |
| `agents/*.md` (code-reviewer, security-auditor, test-engineer, web-performance-auditor) | `.claude/agents/` |
| `.claude/commands/*.md` (9) | `.claude/commands/as-<name>.md` |

Not installed: hooks (`session-start.sh` is not wired for Claude Code upstream either; `sdd-cache`, `simplify-ignore`), plugin manifests, `.toml` command variants for other hosts, docs, evals.

## Mechanical changes

- All nine slash commands carry an `as-` prefix (`/as-plan`, `/as-review`, `/as-spec`, `/as-build`, `/as-test`, `/as-code-simplify`, `/as-ship`, `/as-constraints`, `/as-webperf`), because `/plan` and `/review` would shadow built-in Claude Code commands. All 60 mentions in skills, references, agents and commands were renamed by script; a check confirms none is left.
- The plugin namespace `agent-skills:` was removed from 14 skill references (skills are installed without the plugin).
- `idea-refine/SKILL.md`: script path adjusted to `.claude/skills/idea-refine/scripts/idea-refine.sh`.

## Security edits (two independent audit agents, all 52 files read in full)

1. `browser-testing-with-devtools`: adding the `chrome-devtools-mcp@latest` MCP server only with the user's approval; suggests pinning a version.
2. `constraint-driven-development`: every tool install needs the user's confirmation, especially machine-wide ones.
3. `deprecation-and-migration`: run `down` migrations only against a local or disposable database.
4. `git-workflow-and-versioning`: `git reset --hard HEAD` discards uncommitted work, so confirm with the user first.
5. `as-constraints`: list tools and install commands and get approval first; prefer project-local dev dependencies.
6. `performance-optimization`: `npx lhci` → `npx @lhci/cli` (the unscoped name would fetch a different package).

## Known notes (left as is)

- `doubt-driven-development` can send code to the Gemini or Codex CLIs for a second opinion. This only happens with explicit consent each run. Don't use it for code containing customer data.
- Several skills commit each slice locally without asking (`incremental-implementation`, `as-build`); commits stay local until pushed.
- The four subagents declare no tools or model, so they inherit the session's tools and model and nothing is pre-approved.
- Dangling upstream links: `../docs/agents.md` in the agents, `/ideate` in idea-refine examples, a "future `/audit`" command.
