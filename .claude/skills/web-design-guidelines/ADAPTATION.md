# web-design-guidelines — audited adaptation

Source: [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) @434b7f9 (MIT), `command.md (as guidelines.md); SKILL.md written new after vercel-labs/agent-skills`.

## How it was reviewed

Every file was read in full by an audit agent, then re-audited by an independent adversarial verifier that diffed it against upstream; groups with findings went through a fix round and a second verification. Final verdicts: web-design-guidelines: clean.

## Changes to upstream

- web-design-guidelines/guidelines.md: removed the command-style YAML frontmatter (lines 1-4 plus the following blank line: 'description: Review UI code for Vercel Web Interface Guidelines compliance' and 'argument-hint: <file-or-pattern>'). Why: it only work...
- web-design-guidelines/guidelines.md: replaced the line 'Review these files for compliance: $ARGUMENTS' with 'Vendored from vercel-labs/web-interface-guidelines@434b7f9 (MIT). Update deliberately, after review.' Why: $ARGUMENTS is never filled in inside a sk...
- web-design-guidelines/SKILL.md: NEW file (Write). It replaces upstream agent-skills SKILL.md. Frontmatter has only name 'web-design-guidelines' and the same description as upstream, with the same triggers: review my UI, check accessibility, audit design, re...

## Not installed

- install.sh; runtime fetching of the rules (replaced by the vendored copy)
