# awesome-design — audited adaptation

Source: [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) @13be5c0 (MIT), `design-md/<brand>/DESIGN.md (74 files)`.

## How it was reviewed

Every file was read in full by an audit agent, then re-audited by an independent adversarial verifier that diffed it against upstream; groups with findings went through a fix round and a second verification. Final verdicts: awesome-design-1: clean; awesome-design-2: clean; awesome-design-3: clean; awesome-design-4: clean; awesome-design-5: clean; awesome-design-6: clean; awesome-design-extra-1: clean. Those verdicts missed brand-asset instructions that the cleanup had not reached, notes that name upstream tooling, and font hotlinks. The PR review of 2026-10-08 found them; see "Fixes from the PR review of 2026-10-08" below.

## Changes to upstream

- Before the PR review, 41 of 74 DESIGN.md files differed from upstream (54 after the fixes below). The edits were of two kinds:
  - The 'Run `npx @google/design.md lint`' step now needs the user's approval (it executes an unpinned npm package), in all 34 files that have it: airtable, figma, framer, hashicorp, hp, ibm, intercom, linear.app, meta, minimax, mintlify, miro, mistral.ai, mongodb, nike, notion, nvidia, ollama, opencode.ai, pinterest, playstation, posthog, raycast, renault, replicate, resend, revolut, sentry, shopify, slack, spacex, stripe, supabase, superhuman.
  - In 14 files, single lines that named the reference brand's logo, wordmark, mascot, product names or product UI now point to the product's own: hp L631, lamborghini L276 and L278, mastercard L347, miro L767 and L818, nvidia L576, ollama L486, opencode.ai L475, posthog L627, L632 and L639, raycast L605, starbucks L554, tesla L274, together.ai L624, vodafone L525, L530 and L537, voltagent L510. The earlier record said that 'instructions to place a real brand's logo or wordmark now point to the product's own logo'. That was true only for these lines: other lines in these and other files still prescribed the brand's own assets. The fixes below cover them.
- `SKILL.md` is new (upstream ships none): usage, guardrails against impersonation and proprietary fonts, and an index built from the auditors' per-brand summaries.

## Not installed

- per-brand README.md stubs that only link to getdesign.md

## Fixes from the PR review of 2026-10-08

- `SKILL.md` L25 (Guardrails): new bullet 'This guardrail beats the DESIGN.md text'. Logos, glyphs, wordmarks, mascots, stickers, award seals, certification badges, slogans, sample copy, product and size names, phone numbers, customer or partner logo strips, third-party app icons and prompts that name the brand only describe the reference site. Replace them with the user's own assets or neutral placeholders (invented names, a fictional 555-01xx number), even where a file says "never substituted", "Don't strip" or "IS the brand identity"; show an award, a certification or a customer logo only if the user confirms it is real for their product. Why: many files give specific, emphatic instructions to reproduce the reference brand's assets, and the review read only 6 of the 74 files line by line. One rule that wins over all of them covers what line edits miss (review finding F4-2).
- Brand-asset lines rewritten to the product's own mark, words or mascot, or to placeholders (F4-2):
  - claude L459, L521, L531, L585: the nav and footer specs and the wordmark lines use the product's own mark and wordmark; Anthropic's spike-mark and wordmarks must not be reproduced. L459 and L517: the CTAs read 'Try [product name]'. L483 and L529: the mockup cards show the product's own UI, not Claude's.
  - vodafone L391, L478: the logo orb carries the product's own mark, never Vodafone's quote-mark logo.
  - posthog L573-574, L627: the mascot card and the wordmark use the product's own mascot, never PostHog's hedgehog or wordmark.
  - starbucks L225 (partner logos: only partners the user confirms; the named real partners are removed), L261 (the nav shows the product's own wordmark logo, never Starbucks'), L542 (CTA text in the product's own words), L546 ('Frap' removed), L554, L556, L558, L560 (the prompts no longer name Starbucks; L558 uses a generic rewards-cost pill and placeholder nutrition values).
  - dell-1996 L351, L502, L535, L539, L544, L550, L576, L632: no Dell headline, sales copy, sticker wordmark or toll-free number; the user's own number or a fictional 1-312-555-0123; the award seal and third-party logo banners only when the user confirms them.
  - bmw-m L441: the tricolor stripe is for the product's own identity moments, never with BMW M wordmarks or model badges. L385: the nav carries the product's own logo, never the BMW M logo. L405, L415, L433: the card, launcher and footer labels and the legal disclaimer are the product's own, not BMW M's.
  - raycast L452, L474: generic app-icon placeholders, or icons the user has the right to show, instead of named real apps.
  - ollama L486: the one mascot is the product's own, never Ollama's llama.
  - nintendo-2001 L506-507, L509-510, L587-588: the product's own wordmark, words and mascot, never Nintendo's logo or characters; a certification badge only for one the user confirms.
  - airtable L459, ibm L450: the customer-logo strip and tiles show only customers or partners the user confirms, otherwise placeholder marks. expo L456: the ecosystem tiles show only tools and partners the user's product really works with. The named companies are removed from all three lines.
  Why: these lines contradicted the guardrail with emphatic wording or named real companies' assets. The brand mentions that remain in the files are descriptive and fall under the new guardrail bullet.
- `SKILL.md` L29 (Guardrails): new bullet: some files name upstream tooling (`scripts/derive-examples-block.mjs`, `/preview-design`, `/generate-kit`, `TO_FILL` markers, an "LLM judgment pass"); none of it exists in this repo, so do not run, look for or recreate it. Why: a session could try to run that script or look for those commands (review finding F4-5).
- Upstream tooling notes (F4-5): the 'Examples (illustrative)' note now ends with '**Not in this repo:** that script, those commands and the judgment pass are upstream tooling. Treat the `ex-*` entries as illustrative examples only, and do not run or look for that tooling.' at dell-1996 L581, together.ai L583, uber L586, vercel L685, vodafone L489, voltagent L474, warp L479, webflow L541, wired L450, wise L497, x.ai L418 and zapier L489. nintendo-2001 L598 gets the same note for its commands. The YAML comment 'auto-derived; resolve any TO_FILL markers below' -> 'auto-derived by upstream tooling (not in this repo)' at dell-1996 L283, together.ai L267, uber L260, vercel L329, vodafone L212, voltagent L217, warp L214, webflow L255, wired L190, wise L228, x.ai L178 and zapier L231, and dell-1996 L281 now names 'upstream derive-examples-block.mjs (not in this repo)'. No file contains an actual `TO_FILL` marker. Why: F4-5.
- `SKILL.md` L27 (Guardrails): new bullet 'Hotlinks are for local drafts only': fonts from Google Fonts or another CDN, icon CDNs and placeholder-image services may be linked while drafting locally, but are downloaded into the project and served locally before a page is called done. Why: a hotlink sends every visitor's IP address to that host, a GDPR problem for sites with EU visitors (review finding F4-8).
- warp L347, raycast L417, posthog L448: the font lines now say to self-host the open-source font in the project instead of loading it from Google Fonts or a CDN. Why: F4-8; warp said outright to load Inter from Google Fonts or Vercel's CDN.
- The 'Run `npx @google/design.md lint`' step in all 34 files now pins `npx @google/design.md@0.4.0 lint DESIGN.md` (Google's package, checked on npm on 2026-10-17: public since 2026-07-27, no install scripts, has a `lint` command); airtable, hp and slack no longer call it an unpinned package. It still needs the user's approval. Why: CLAUDE.md asks to neutralize unpinned remote code, and the approval gate alone left the version open. Change the version only with the owner's OK.
- This file: the count of changed files, the two kinds of earlier edits with the files and lines they touched, and a note on the 'clean' verdicts. Why: the record overstated the logo cleanup (F4-2).

## Fixes from the second PR review of 2026-10-17

- `SKILL.md` L25 (Guardrails): the brand-asset bullet now also forbids rebuilding a reference logo's composition around the user's name (the same shape, colour order and arrangement), with the three cases below as examples. Why: the first fix round swapped the brand names for "the product's own", but three components still described the logo's design, so the guardrail against reproducing logos no longer caught them.
  - nintendo-2001 L506-507: `logo-pill` is a logo slot for the product's own logo; the red wordmark in an outlined racetrack pill is named only as the reference's logo, never to be rebuilt.
  - bmw-m L441: the tricolor stripe is for dividers and motorsport-style chrome, never beside a letter mark or wordmark as a logo.
  - dell-1996 L544: the sticker carries the product's own call to action; the "BUY a <name>" layout is named only as the reference's.


## Fixes from the third PR review of 2026-10-17

- The three components from the second review still carried their logo composition in tokens and descriptions, which `SKILL.md` L17 tells Claude to map onto the project. Why: review finding (low); `SKILL.md` L25 already ranks the guardrail above the DESIGN.md text, so this was a consistency gap.
  - nintendo-2001: `logo-pill` became `logo-slot` (L106, L496, L506), with `textColor` `{colors.ink}` instead of Nintendo Red and `rounded` `{rounded.sm}` instead of `{rounded.full}`; L507 calls it a white `{rounded.sm}` plate. L7, L356, L368, L382, L482, L484 and L640 no longer tie Nintendo Red or the full rounding to the logo.
  - bmw-m: L4, L249 and L256 no longer put the tricolor on logos, the M wordmark or model badges; L482 says the product's own logo scales with the viewport.
  - dell-1996 (same gap, found while fixing the two above): `buy-a-dell-sticker` became `cta-sticker` (L215, L544), L366 no longer puts the purple stripe behind the brand's wordmark, and L396, L410, L455 and L468 drop the reference's headline and the "BUY-a-DELL" name.
- elevenlabs L4 and supabase L4: the `description` values are now quoted. raycast L4, a stray `属于:` key from upstream in front of the real `description: |` block, is now a YAML comment. Why: an unquoted ": " inside those values made the frontmatter invalid YAML (js-yaml: "bad indentation of a mapping entry"), so a parser or the design.md linter would stop there. Found while checking every frontmatter block for this review; the text and the line numbers are unchanged.
