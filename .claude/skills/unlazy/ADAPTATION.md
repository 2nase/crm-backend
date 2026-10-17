# unlazy — clean-room adaptation

Source: the method of [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy) (MIT), as named in `SKILL.md` and in the commit that added this skill (ac3ac4f, 2026-10-05). Neither records an upstream commit, so the source commit is unknown, and there is no upstream version to diff against.

## What this is

Three files: `SKILL.md`, `templates/gates.md` and `templates/PLAN.md`. The skill's header and the commit message call this a clean-room adaptation: the method restated in the skill's own words. Because the skill says it copies no upstream text, no upstream `LICENSE` file was added. That claim was not checked against upstream.

## Deliberately not included

The upstream Node checker, the approval store and the Stop hook, as named in `SKILL.md` and in commit ac3ac4f. Claude runs and verifies the checks itself with Bash instead. No other reason is recorded. Nothing in this skill runs automatically.

## Working files

The skill writes only under `.unlazy/<scope>/`, which `.gitignore` already ignores (`.unlazy/`): `GATES.md`, and for a Depth Tree also `PLAN.md`, `gates/leaf-<id>.md` and `gates/node-<id>.md`.

## Audit notes

The PR review (2026-10-08) covered all three files: no hidden Unicode, no HTML-comment payload, no prompt injection, and nothing that runs automatically. A character scan for this record found only visible typography (dashes, arrows, box-drawing lines) and no HTML comments.

## Fixes from the PR review (2026-10-08)

- This `ADAPTATION.md` is new: CLAUDE.md asks for one for every third-party adaptation (source commit, changes, reasons).
- `SKILL.md` (*Write gates before real work*, *Depth Tree* mode, *Housekeeping*): `GATES.md` used to go to the repo root, and `PLAN.md` and `gates/` had no stated place, so a skill that commits each slice could sweep them into a commit. All working files now go to `.unlazy/<scope>/`, which git already ignores. The gate rules now say that `CHECK:` commands still run from the repo root, so moving the ledger does not change what a relative path in a check means.
- `SKILL.md` (*Gates must be able to fail honestly*): the repo-native examples were `npm test`, `npx tsc --noEmit`, `npm run lint` and jest/vitest runs. This repo has no test or lint script, and CLAUDE.md names `npm run typecheck` as the gate. The bullet now says to use only scripts that package.json has (here `npm run typecheck` and `npm run build`), and never `npx <tool>` for a package that is not installed. The success-marker example no longer names `npm test`.
- `templates/gates.md`: G1's example `npx jest src/foo --silent` became a generic command that reads the artifact, because jest is not installed and npx would download and run it. G2 checks `npm run typecheck && echo TYPECHECK_OK` instead of `npx tsc --noEmit`.
