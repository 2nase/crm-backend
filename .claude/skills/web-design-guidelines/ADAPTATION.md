# web-design-guidelines — audited adaptation

Source: [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) @434b7f9 (MIT), `command.md (as guidelines.md); SKILL.md written new after vercel-labs/agent-skills`.

## How it was reviewed

Every file was read in full by an audit agent, then re-audited by an independent adversarial verifier that diffed it against upstream; groups with findings went through a fix round and a second verification. Final verdicts: web-design-guidelines: clean. The PR review of 2026-10-08 found nothing to change in the skill itself, only that this record was cut off (see "Fixes from the PR review of 2026-10-08" below).

## Changes to upstream

- web-design-guidelines/guidelines.md: removed the command-style YAML frontmatter (lines 1-4 plus the following blank line: 'description: Review UI code for Vercel Web Interface Guidelines compliance' and 'argument-hint: <file-or-pattern>'). Why: it only works in a slash-command file, and the skill reads this file as plain rules (the cut-off reason, restored from the change itself). With those 5 lines gone, upstream line 6 is guidelines.md line 1.
- web-design-guidelines/guidelines.md: replaced the line 'Review these files for compliance: $ARGUMENTS' with 'Vendored from vercel-labs/web-interface-guidelines@434b7f9 (MIT). Update deliberately, after review.' This is guidelines.md line 3 (upstream line 8). Why: $ARGUMENTS is filled in only in a command file or SKILL.md, not in a file the skill reads, so the line would have been read literally (the cut-off reason, restored from the change itself).
- web-design-guidelines/SKILL.md: NEW file (Write). It replaces upstream agent-skills SKILL.md. Frontmatter has only name 'web-design-guidelines' and the same description as upstream, with the same triggers: review my UI, check accessibility, audit design, review UX, check my site against best practices (the list is completed from SKILL.md line 3). The body tells Claude to read the files the user names (or ask which ones), read the local `guidelines.md`, check every rule, and report in the `file:line` format that `guidelines.md` sets. It also says not to fetch guidelines from the network at review time, and how to update the snapshot. Why: (record truncated; see the diff against upstream). The file's own 'Why Vendored' section says the upstream skill downloaded its rules from the `main` branch at the start of every review, so the instructions could change without review. No agent-skills commit is recorded, so this entry could not be re-checked against that source.

## Not installed

- install.sh; runtime fetching of the rules (replaced by the vendored copy)

## Fixes from the PR review of 2026-10-08

- This file: completed the cut-off SKILL.md entry from the file itself (the trigger list and what the body says), marked the cut-off reasons, added the matching `guidelines.md` line numbers, and noted the PR review's result. Why: three entries were cut off mid-sentence (review finding F4-7). The skill's own files are unchanged.

## Fixes from the second PR review of 2026-10-17

- `SKILL.md` L17 (*How It Works*, new paragraph): for the `preconnect` and font `preload` rules in `guidelines.md` (L85-86), recommend self-hosted fonts and assets first, suggest `preconnect` only for a third-party host the project already uses with the owner's OK, and report every third-party hotlink as a finding. `guidelines.md` stays verbatim. Why: the rule asked reviews to add `preconnect` for CDN hosts, which opens a connection from every visitor's browser to that host, while the other design skills treat hotlinks as a GDPR problem (taste-skill, awesome-design).
- This file: the two cut-off reasons under *Changes to upstream* that the change itself explains are restored and marked as such. The upstream commit of the agent-skills `SKILL.md` this file replaced is still not recorded.

