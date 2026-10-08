# taste-skill — audited adaptation

Source: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) @ce26fc2 (MIT), `skills/taste-skill/SKILL.md`.

## How it was reviewed

Every file was read in full by an audit agent, then re-audited by an independent adversarial verifier that diffed it against upstream; groups with findings went through a fix round and a second verification. Final verdicts: taste-skill: clean.

## Changes to upstream

- taste-skill/SKILL.md line 2 (frontmatter): name 'design-taste-frontend' -> 'taste-skill' so the user can invoke /taste-skill (required by group instructions); description kept verbatim.
- taste-skill/SKILL.md line 267 (Section 4.8 item 1): replaced 'you MUST use it to create section-specific assets:' with 'use it to create section-specific assets (ask the user once before the first call: such tools may send prompts to a third-party service, ...
- taste-skill/SKILL.md line 276 (Section 4.8 'Real company logos for social proof'): 'Use real SVG logos:' -> 'Use real SVG logos, but ONLY for companies the brief or user confirms are actual customers / partners whose logos may be shown (another brand's logo...
- taste-skill/SKILL.md new line 339 (Section 4.10): added the bullet 'Unless the brief supplies real testimonials, the quote, person and company are invented (never a real person or real company) and must be flagged to the user as placeholder copy to replace ...
- taste-skill/SKILL.md line 619 (Section 9.D): example phone number '+1 (312) 847-1928' -> '+1 (312) 555-0147'. Why: the original is a realistic, possibly real, dialable number that agents copy verbatim; 555-01xx is reserved as fictional.
- taste-skill/SKILL.md line 940 (Section 14 pre-flight, logo-wall item): 'uses REAL SVG logos (Simple Icons / devicon) or generated SVG marks,' -> 'uses REAL SVG logos (Simple Icons / devicon) only for confirmed real customers / partners, otherwise generated ...
- taste-skill/SKILL.md line 948 (Section 14 pre-flight, real-images item): 'gen-tool first,' -> 'gen-tool first if the user approved it,'. Why: keeps the checklist consistent with the image-generation consent fix above.
- No other deviations from upstream: the file is 1207 lines (upstream 1206 + 1 added bullet), and all other content is verbatim. LICENSE (MIT) is unchanged and should ship with the skill for attribution.
- taste-skill/SKILL.md L96 [NEW this round]: 2.A table 'Reach for' package `uswds` changed to `@uswds/uswds`, the current USWDS 3 package name (the old name is the legacy v2 package), so the table matches the corrected Appendix A command (finding 5).
- taste-skill/SKILL.md L104-105 [NEW this round]: inserted a 'Government identity rule' paragraph plus a blank line after the Honesty rule. It restricts the GOV.UK header, crown, logo/logotype and GDS Transport font to services actually on GOV.UK, and the USW...
- taste-skill/SKILL.md L135 [NEW this round]: appended to the 3.A Fonts rule: self-host only font files the user is licensed to use, from the foundry or another official source, never from unofficial mirrors, naming commercial examples. Reason: the skill reco...
- taste-skill/SKILL.md L269 [round 1, unchanged this round]: image-gen item changed from 'you MUST use it' to 'use it ... (ask the user once before the first call: such tools may send prompts to a third-party service, cost credits, or save assets into a conne...
- taste-skill/SKILL.md L270 [NEW this round]: 'When no gen tool is available' changed to 'When no gen tool is available or approved', covering the case where the user declined the consent prompt (finding 4).
- taste-skill/SKILL.md L278 [round 1 edit, extended this round]: real logos are limited to confirmed customers or partners (round 1). This round appended '(not real companies)' after 'invent the brand names' and ', and tell the user these are placeholder bran...
- taste-skill/SKILL.md L341 [round 1 line, extended this round]: the invented-testimonial flag line from round 1 now ends with 'Flag their avatars as placeholders too, and use initials / monogram styling or a generated face, never a stock photo of a real, ide...
- taste-skill/SKILL.md L621 [round 1, unchanged this round]: example phone number `+1 (312) 847-1928` changed to the fictional-range `+1 (312) 555-0147`.
- taste-skill/SKILL.md L942 [round 1 edit, extended this round]: pre-flight logo-wall item now reads 'otherwise generated SVG marks flagged to the user as placeholders'. This is the verifier's optional pre-flight addition for finding 1.
- taste-skill/SKILL.md L950 [round 1, unchanged this round]: pre-flight images item reads 'gen-tool first if the user approved it'.
- taste-skill/SKILL.md L965 [NEW this round]: pre-flight quotes item now ends with ', invented quotes and avatars flagged to the user as placeholders?'. Reason: this mirrors the L942 addition so the testimonial and avatar placeholder flag from L341 is enforce...
- taste-skill/SKILL.md L1022 [NEW this round]: Appendix A `npm install uswds` changed to `npm install @uswds/uswds`. Reason: the old name installs the legacy, end-of-life v2 package (finding 5).

## Not installed

- the other 11 skills of the repo (only the one requested)
