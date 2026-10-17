# taste-skill — audited adaptation

Source: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) @ce26fc2 (MIT), `skills/taste-skill/SKILL.md`.

## How it was reviewed

Every file was read in full by an audit agent, then re-audited by an independent adversarial verifier that diffed it against upstream; groups with findings went through a fix round and a second verification. Final verdict of that audit: taste-skill: clean. That verdict was wrong: the PR review of 2026-10-08 found ungated install instructions (including the unpinned `npx shadcn@latest` and `yarn add`) and other gaps. See "Fixes from the PR review of 2026-10-08" below.

## Changes to upstream

The adaptation as it stood before the PR review. This list was regenerated from the diff against upstream @ce26fc2 during the PR-review fixes: line numbers are those of the current `SKILL.md`, entries the earlier record listed twice (round 1 and round 2) are merged, and changes the earlier record cut off are completed from the diff. Reasons that were cut off are marked.

- L2 (frontmatter): name 'design-taste-frontend' -> 'taste-skill' so the user can invoke /taste-skill (required by group instructions); description kept verbatim.
- L96 (2.A table, 'Reach for'): `uswds` -> `@uswds/uswds`, the current USWDS 3 package name (the old name is the legacy v2 package), so the table matches the corrected Appendix A command (finding 5).
- L104-105 (after the Honesty rule): inserted a blank line and the paragraph '**Government identity rule:** GOV.UK identity (header, crown, logo / logotype, GDS Transport font) is only for services that are actually on GOV.UK, and USWDS federal identity (the "An official website of the United States government" banner, agency identifier, seals) only for official US government sites. For every other brief, including commercial "trust-first" ones, use the components without those identity elements.' Why: (record truncated; see the diff against upstream)
- L135 (3.A Fonts): appended 'Only self-host font files the user is licensed to use, from the foundry or another official source, never from unofficial mirrors (many fonts named in this skill, e.g. GT America, Söhne, ABC Diatype, Tiempos, are commercial).' Why: (record truncated; see the diff against upstream)
- L271 (4.8 item 1): 'you MUST use it to create section-specific assets:' -> 'use it to create section-specific assets (ask the user once before the first call: such tools may send prompts to a third-party service, cost credits, or save assets into a connected account):'. Why: (record truncated; see the diff against upstream)
- L272 (4.8 item 2): 'When no gen tool is available' -> 'When no gen tool is available or approved', covering the case where the user declined the consent prompt (finding 4).
- L282 (4.8 'Real company logos for social proof'): 'Use real SVG logos:' -> 'Use real SVG logos, but ONLY for companies the brief or user confirms are actual customers / partners whose logos may be shown (another brand's logo on your wall implies an endorsement that does not exist); otherwise invent the brand names (not real companies) and use generated marks (see below), and tell the user these are placeholder brands to replace before launch:'. Round 2 added '(not real companies)' and the placeholder-brand notice. Why: (record truncated; see the diff against upstream)
- L345 (4.10): inserted the bullet 'Unless the brief supplies real testimonials, the quote, person and company are invented (never a real person or real company) and must be flagged to the user as placeholder copy to replace before launch. Flag their avatars as placeholders too, and use initials / monogram styling or a generated face, never a stock photo of a real, identifiable person (that implies the person endorses the product).' Round 2 added the avatar sentence. Why: (record truncated; see the diff against upstream)
- L625 (9.D): example phone number '+1 (312) 847-1928' -> '+1 (312) 555-0147'. Why: the original is a realistic, possibly real, dialable number that agents copy verbatim; 555-01xx is reserved as fictional.
- L948 (14, logo-wall item): 'uses REAL SVG logos (Simple Icons / devicon) or generated SVG marks,' -> 'uses REAL SVG logos (Simple Icons / devicon) only for confirmed real customers / partners, otherwise generated SVG marks flagged to the user as placeholders,'. Why: round 2's 'flagged to the user as placeholders' is the verifier's optional pre-flight addition for finding 1; the round-1 reason: (record truncated; see the diff against upstream)
- L956 (14, real-images item): 'gen-tool first,' -> 'gen-tool first if the user approved it,'. Why: keeps the checklist consistent with the image-generation consent fix above.
- L972 (14, quotes item): appended ', invented quotes and avatars flagged to the user as placeholders'. Why: this mirrors the L948 addition so the testimonial and avatar placeholder flag from L345 is (record truncated; see the diff against upstream)
- L1029 (Appendix A): `npm install uswds` -> `npm install @uswds/uswds`. Why: the old name installs the legacy, end-of-life v2 package (finding 5).
- No other deviations from upstream before the PR review: the file had 1209 lines (upstream 1206 plus 3 inserted lines: the Government identity paragraph with its blank line, and the testimonial bullet). After the fixes below it has 1216 lines. LICENSE (MIT) is byte-identical to upstream and should ship with the skill for attribution.

## Not installed

- the other 11 skills of the repo (only the one requested)

## Fixes from the PR review of 2026-10-08

- L161-162 (3.F): added an install gate that covers every install path in the skill (including the 2.A table and Honesty rule, a second icon library in 3.C, the `simple-icons` and `@svgr/cli` packages in 4.8, and Appendix A): show the user the exact install command and wait for the user's OK; never run npm, npx or yarn installs unasked; use `npm install`, since the project keeps a `package-lock.json`; use `npx` only with a pinned version, and say that the shadcn CLI fetches component code from its registry and edits config and CSS files. Why: the skill told Claude to install packages and offered the unpinned `npx shadcn@latest` with no approval step (review finding F4-1); the owner's rules forbid unreviewed remote code and new dependencies without asking.
- L99 (2.A table): `npx shadcn@latest add ...` -> `npx shadcn@4.21.0 add ...`, with 'only after the user's OK, see 3.F'. Why: `@latest` runs whatever version npm serves that day. 4.21.0 (published 2026-09-04) was chosen on purpose as a version public for more than two weeks; the latest on 2026-10-08 was 4.21.4.
- L102 (Honesty rule): 'install and use the **official** package' -> 'propose the **official** package and use it once the user agrees to the install (see 3.F)'. Why: it was an imperative install instruction with no approval step.
- L145 (3.C): 'install a second library' -> 'propose a second library (installed only with the user's OK, see 3.F)'. Why: same as the Honesty rule.
- L995 (appendices intro): added 'Run an install command only after the user's OK (Section 3.F).' Why: the intro presented the commands as ready to run.
- L1015-1017 (Appendix A): `npx shadcn@latest init` / `add` -> `npx shadcn@4.21.0 init` / `add`, and the comment says the pin is on purpose. Why: as for L99.
- L1032 (Appendix A): `yarn add @atlaskit/...` -> `npm install @atlaskit/...`. Why: the repo uses `package-lock.json` and has no `yarn.lock`; `yarn add` would create a second lockfile.
- L278-279 (4.8): new paragraph 'Hotlinks are for local drafts only': Picsum images, Simple Icons / devicon CDN logos and Google Fonts files may be hotlinked while drafting, but are downloaded into the project and served locally before a page is called done. Why: a hotlink sends every visitor's IP address to the third-party host, a known GDPR problem for a German site (review finding F4-8).
- L633 (9.E): the Picsum URL is marked '(local drafts only, see Section 4.8)'. Why: same as L278.
- L957 (14): new pre-flight item 'No third-party hotlinks'. Why: a page could pass the pre-flight check with hotlinked Picsum images, CDN logos or Google Fonts (F4-8).
- L714 (10): added 'In this project no block files exist yet (see Section 12).' Why: the sentence said implementations live in the Block Library (review finding F4-5).
- L848-849 (12): new paragraph: section 12 is an upstream contract only; no `blocks/` folder ships with this skill, so do not look for block files or start a block library unless the user asks. Why: section 12 names `skills/taste-skill/blocks/`, which does not exist here (F4-5).
- This file: corrected the 'clean' verdict, and regenerated "Changes to upstream" with current line numbers, merged duplicates, the correct line count (the record said 1207) and marked cut-off reasons. Why: the record was stale and cut off mid-sentence (review finding F4-7).
