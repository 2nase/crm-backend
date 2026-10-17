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

- `doubt-driven-development` can send code to the Gemini or Codex CLIs for a second opinion. This only happens with explicit consent each run. Don't use it for code containing customer data. Since the PR review it is opt-in, and the skill itself carries this warning (see below).
- Several skills commit locally without asking (`incremental-implementation`, `as-build`, `git-workflow-and-versioning`, `code-simplification`, `performance-optimization`, `ci-cd-and-automation`); commits stay local until pushed, and pushing to main needs the owner's OK.
- The four subagents declare no tools or model, so they inherit the session's tools and model and nothing is pre-approved.
- Dangling upstream links: `/ideate` in idea-refine examples, a "future `/audit`" command. (The agents' `../docs/agents.md` links were removed in commit 4997d1c.)

## Fixes from the PR review (2026-10-08)

Before these fixes, the files below were diffed against the raw upstream files at 1401c8b. The only differences were the `as-` renames and security edits 2, 3, 4 and 6 above.

- `deprecation-and-migration`: the sample deprecation notice told consumers to run `npx migrate-check`. That npm name is a placeholder held by an unknown private account, which can publish code under it at any time, and npx runs it without a prompt when there is no TTY. The step now checks for leftover imports with `grep` and runs `npm run typecheck`. A new sentence says to name only checks the project really has.
- `performance-optimization` (Enforce in CI): `npx bundlesize` and `npx @lhci/cli` are pinned (`bundlesize@0.18.2`, `@lhci/cli@0.15.1`, checked on npm on 2026-10-17) behind an ask-first note. Neither tool is installed in this repo.
- `.claude/references/performance-checklist.md` (Measurement Commands): the same for `lighthouse`, `webpack-bundle-analyzer`, `vite-bundle-visualizer` and `bundlesize`.
- `.claude/references/accessibility-checklist.md` (Testing Tools): `npx axe-core` could not run, because the axe-core package has no CLI. It is now `npx @axe-core/cli@4.13.0 <url>`; `pa11y` is pinned too (`pa11y@10.0.0`), and both sit behind an ask-first note.
- `ci-cd-and-automation`: a note under *Basic CI Pipeline* says that this repo's `ci.yml` already exists (what it runs), that there is no lint or test script yet, and to extend that file instead of replacing it. The type check steps use `npm run typecheck` and the migration step `npm run prisma:deploy` (this repo's scripts) instead of `npx tsc` and `npx prisma`. The Playwright steps use `npx --no-install`, with a note that `@playwright/test` is a new dependency. The Vercel deploy and rollback examples are pinned (`npx vercel@62.0.0`, checked on npm on 2026-10-17; the newer 62.x releases up to 63.0.0 are deprecated) and sit behind a deploy gate.
- `git-workflow-and-versioning` (pre-commit checks) and `context-engineering` (CLAUDE.md template): `npx tsc --noEmit` became `npm run typecheck`, the repo's gate.
- `git-workflow-and-versioning`: the description no longer says "Use when making any code change", and "When to Use" no longer says "Always". The skill is for committing, branching, pull requests, pushing and releases. The pre-commit test and lint steps apply only when package.json has those scripts; this repo has neither yet.
- `test-driven-development`: the description now fires when the owner asks for tests, or when the project already has a test runner. "When NOT to use" adds projects without a test runner, since adding one is a new dependency.
- `source-driven-development`: fires on an explicit request or an unfamiliar, new or changed API, no longer on "any framework or library". Citations go in the reply; source URLs go into code comments only when asked.
- `constraint-driven-development`: the description and "When to Use" now need an explicit request, because the skill runs an interview and installs tools. The triggers "no quality bar is written down" and "an agent writes more code than anyone will read" were removed; CLAUDE.md already holds a written bar.
- `using-agent-skills`: no longer triggers at session start. The decision-tree branch "No quality bar written down?" became "Asked for a quality bar?".
- `context-engineering`: no longer triggers at session start (description and "When to Use").
- `security-and-hardening` (Secrets) and `references/hardening-patterns.md` (Secrets Management): both said "rotate it first, then purge history" with no gate. A leaked secret now means: stop and tell the owner which secret and where, without repeating its value. The owner rotates it. Purging history (a rewrite plus force-push) only with the owner's explicit OK.
- `git-workflow-and-versioning`: new ask-first rule for merging into or pushing to `main`, tags, releases, force-pushes and other history rewrites, and deleting branches. The tag example says that pushing a tag publishes a release. The confirmation for `git reset --hard HEAD` now covers every other command that discards uncommitted work (`git checkout -- .`, `git restore .`, `git clean -fd`, `git stash drop`).
- `shipping-and-launch`: new ask-first rule for deploys, rollbacks, production flag changes, pushes to `main` and release announcements. The rollback template pushes the revert only once the owner approves.
- `ci-cd-and-automation`: the CI fix loop pushes to the PR branch, never to main without the owner's OK. Changing branch protection or auto-merge, or merging into main, needs the owner's OK. A note before the deployment workflows says deploys, rollbacks and a hosting platform need the owner's OK first.
- `constraint-driven-development`: "I don't know" in the first interview question now means the floor only (it used to mean coverage plus security scanning). Before the owner picks security scanning, the skill says what leaves the machine: Semgrep fetches its registry rules from semgrep.dev and sends usage metrics, and osv-scanner sends package names and versions to api.osv.dev. The Semgrep commands carry `--metrics=off`. The CLAUDE.md line is added only after asking, and `AGENTS.md` only if the project already has one. Level 2 runs the checks through `/as-build` and CI; a post-edit hook needs the owner's explicit OK.

The fixes below cover `doubt-driven-development`, `spec-driven-development`, `incremental-implementation`, `using-agent-skills` (*Verify, Don't Assume*) and `.claude/references/` (`definition-of-done.md`, `orchestration-patterns.md`). Before them, those files were also diffed against the raw upstream files at 1401c8b. Apart from the `using-agent-skills` changes above, the only differences were the `as-` renames.

- `doubt-driven-development` (*Cross-model escalation*): it offered the Codex (OpenAI) and Gemini (Google) CLIs in every interactive doubt cycle, without saying that code leaves the machine, and ran them from the repo, where they can read `.env`. Cross-model is now opt-in and runs only when the user asks. The consent question says plainly that code from this repo goes to OpenAI or Google, that it may cost money, and that the CLI must be installed and signed in; "skip" is the recommended answer. The CLI runs from a new, empty temp directory (Codex needs `--skip-git-repo-check` there). The skill says this reduces the exposure but does not remove it, because Codex's read-only sandbox can still read files elsewhere by absolute path. No customer data, secrets or `.env` values in the prompt, and no installing a CLI. The rationalization, red flag and verification lines match.
- `doubt-driven-development` (description): the catch-all trigger "any time a confident output would be cheaper to verify now than to debug later" was removed, since it matched almost any task. The description now says the reviewer is a fresh subagent of the same model and other vendors' models run only on the user's explicit request. The high-stakes triggers stay, in line with the owner's decision on adversarial verification in CLAUDE.md.
- `doubt-driven-development`: the role-based reviewers are in `.claude/agents/`, not `agents/`.
- `spec-driven-development` (*Phase 4*): the `skills/<name>/SKILL.md` paths (there is no root `skills/` here) became plain skill names.
- `.claude/references/definition-of-done.md`: its checklist demanded tests, linting and observability that this repo does not have, so it competed with CLAUDE.md. A new *In this repo* section says the binding bar is CLAUDE.md's Definition of done, which wins where the two differ: `npm run typecheck` with the command and output quoted (a Stop hook runs `prisma generate` and the same type check), `npm run build` as the only other check, no test runner, linter or smoke script, the `reviewer` subagent for multi-file changes, and ask the owner first. Checklist items that need a tool the project lacks are marked "n/a", and adding such a tool needs the owner's OK. The "tailor once" sentence points to that section.
- `using-agent-skills` (*Verify, Don't Assume*): the project-wide bar is now CLAUDE.md's Definition of done, summed up for this repo, instead of "tests pass, no regressions, behavior verified at runtime, docs updated".
- `incremental-implementation` (*Increment Checklist*): the type check example `npx tsc --noEmit` became `npm run typecheck`, the repo's gate.
- `.claude/references/orchestration-patterns.md` (*Where personas live*, *Frontmatter fields*): it said "This repo is a plugin (`.claude-plugin/plugin.json`)" and that `hooks`, `mcpServers` and `permissionMode` in agent frontmatter are silently ignored. This repo is not a plugin: the agents are project subagents in `.claude/agents/`, where Claude Code honors those fields. Checked in the installed Claude Code 2.1.302: the plugin agent loader warns "which is ignored for plugin agents. Use .claude/agents/ for this level of control." for exactly those three fields (it also drops `initialPrompt`), while the loader for `.claude/agents/` reads `permissionMode`, `mcpServers` and `hooks`. The section now says to ask the owner before adding or changing those fields. Its tip to save cost with lower models per persona (Haiku, Sonnet) became "subagents inherit the session's model and effort", because CLAUDE.md says never to lower them.
- `.claude/references/orchestration-patterns.md` (*Agent Teams setup*): the recipe that switches on Agent Teams in the owner's global `~/.claude/settings.json` now needs the owner's OK first. It is experimental, costs more, CLAUDE.md rules it out for routine work, and the global file applies to every project.
- `.claude/references/orchestration-patterns.md` (anti-pattern A): there is no `AGENTS.md` here. The intent → command mapping goes into `CLAUDE.md`, with the owner's OK, and the "Why it fails" line no longer claims that such a mapping already exists.
- *Known notes*: the cross-model note points to the fix above, and the dangling-link note no longer lists `../docs/agents.md` in the agents, which commit 4997d1c removed.
- `.claude/references/orchestration-patterns.md` (Pattern 5, built-in subagents table, *When not to use Agent Teams*): the advice to use the built-in `Explore` subagent, which upstream says runs on Haiku, now points to a read-only subagent on the session's model (`general-purpose` with a read-only brief, or a custom one with `model: inherit`). Why: CLAUDE.md records the owner's decision to run Opus at max effort and never to lower or suggest lowering the model.
- `spec-driven-development`, `context-engineering`, `ci-cd-and-automation`: `npm run lint --fix` became `npm run lint -- --fix` (npm passes `--fix` to the script only after `--`). This repo has no lint script yet; the lines are templates.
- `context-engineering` (*MCP Integrations*): adding an MCP server now needs the owner's OK, with the note that a database server would expose CRM data. `debugging-and-error-recovery`: a dependency error now points to `npm ci` (CLAUDE.md) instead of `npm install`, which can rewrite package-lock.json.
- `.claude/agents/web-performance-auditor.md` and `.claude/commands/as-ship.md`: links to root-level `skills/` and `references/` folders, which do not exist here, now point into `.claude/`. The auditor's pinning example names `lighthouse@13.5.0`; `/as-ship`'s Agent Teams pointer adds that Agent Teams need the owner's OK (CLAUDE.md).
- `browser-testing-with-devtools` (*Installation*): the approved-only MCP snippet now pins `chrome-devtools-mcp@1.10.1` instead of `@latest`; security edit 1 had only suggested pinning.
- Pinned versions above were checked on npm on 2026-10-17; each had been public for at least two weeks. Change them only with the owner's OK.
