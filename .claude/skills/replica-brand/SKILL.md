---
name: replica-brand
description: >-
  Replica pack, step 9 of 11: a clean-room rebuild of an existing app. Only
  when the owner is explicitly building such a clone (replica/recon.md
  exists); not for ordinary branding or work on this CRM. Names and rebrands
  an app clone so it is the user's own: name candidates with the trademark,
  domain, store and handle checks to run, a new palette checked for
  contrast, a logo brief, a voice guide, and a sweep tool that finds
  anything of the original left in the codebase. Use when the user says
  "rebrand the clone", or after /replica-entrepreneur. Always runs before
  /replica-launch.
---

# replica-brand

**Only for a Replica project the owner asked for** (a clone of an existing
app, with `replica/recon.md`), not for ordinary work on this CRM.
Work in the clone's own repository (`replica-recon`, step 1), never in this
CRM repo.

Nothing launches under the original's identity. This skill is the line
between "a clone" and "your app".

Tool in this folder:

```bash
python3 .claude/skills/replica-brand/sweep.py . --avoid "Original Name,Its Company" --domains original.com --colors "#006bff"
python3 .claude/skills/replica-brand/sweep.py . --config replica/brand.json        # same, from the brand file
```

Writes `replica/brand.md` and `replica/brand.json` (`avoid`, `domains`,
`colors`, used by `sweep.py`, `listing.py` and replica-deploy).

## Step 1: the name

Read the angle from `replica/angle.md` (`fixes.md` is local and missing in a
new cloud session). Generate 20 candidates across styles:
descriptive (Booklink), compound (Slotwise), invented (Calvo), metaphor
(Harbor), verb (Book). Then cut to 5 with these filters:

- **Not confusingly similar to the original** in sound, look or meaning, and
  not to any other app in the same category. That is the test trademark
  offices use, so it is the test here. No puns on their name, no "-ly" twin.
- Short, spellable after hearing it once, no awkward meaning in big languages.
- Says something about the angle, or at least does not fight it.

## Step 2: the checks, run, not assumed

For each of the 5, a row per check. Mark each **to run**, or the result with
the date it was run. Never write "available" for a check nobody ran.

| check | where |
| --- | --- |
| US trademark | tmsearch.uspto.gov, the app's class (usually 9 and 42) |
| EU trademark | euipo.europa.eu eSearch, or TMview for many offices |
| Canada | ised-isde.canada.ca trademarks database |
| global | WIPO Global Brand Database |
| domain | `whois name.com`, or the registrar's search |
| App Store and Play | search the exact name |
| handles | X, Instagram, TikTok, GitHub |
| the web | search "name + category" |

These are screening checks, not legal clearance. Before spending money on
the name, a trademark lawyer should do a proper search.

## Step 3: palette

A new palette, written into the same token roles replica-design set up.
Pick a primary brand hue from a different family than the original's (if
theirs is blue, yours is not a nearby blue). Then:

```bash
python3 .claude/skills/replica-design/contrast.py replica/design/tokens.json
```

Zero AA failures. Add the original's brand colours to `brand.json` so the
sweep catches any that survive.

## Step 4: logo brief

Not a logo, a brief for whoever makes it (the user, a designer, an image
model):

- the idea in one line, tied to the name and angle
- mark type: wordmark, symbol plus wordmark, or monogram
- must work at 16px (favicon) and as a 1024px app icon
- deliverables: SVG, app icon 1024x1024 with no transparency for iOS,
  favicon set, social image 1200x630
- **must not resemble the original's mark**: no shared shape, colour pair or
  letterform trick. Put the original's logo next to the drafts and check.

## Step 5: voice

Three words for how it sounds, with what each does not mean ("direct, not
blunt"). Five do and don't pairs. Then rewrite the 10 most-seen strings in
the clone (sign up, empty states, the main button, the confirmation, the
error) in that voice. All fresh, none echoing the original's phrasing.

## Step 6: the sweep

Replace every placeholder name, colour and string. Then:

```bash
python3 .claude/skills/replica-brand/sweep.py . --config replica/brand.json
```

It searches file contents and file names for the original's name (also inside
identifiers like `CalendlyEmbed`), domains and colours, skipping
`node_modules`, build output, the `replica/` planning folder, `.claude/` and
`CLAUDE.md` (the skills and settings, not the app), virtualenvs and tool
folders. In files that commonly hold secrets (`.env`, keys, certificates,
Terraform variables, Docker and kube configs and the like, plus files named
like secrets, credentials or service accounts and every file in a folder named
so, such as `secrets/` or `prod-secrets/`; the list is at the top of
`sweep.py` and covers the usual names, not every file a secret could be in)
it shows only the file and line, never the text. Do not print those lines
yourself: fix `.env.example` directly (it holds no values), and for the other
files tell the owner which file and line to change. Hits marked `it is in
<folder>/, a folder whose name suggests secrets`
(`config/secrets/production.js`, `src/features/secret-santa/messages.json`)
can be ordinary app files: ask the owner once per folder the marker names
whether it holds secrets, and open and fix the hits naming that folder
yourself only if the owner says it does not. Hits marked "this file can hold
secrets" stay with the owner even in such a folder. Outside such folders, web
source code (`.ts`, `.tsx`, `.js`, `.vue`, `.svelte`, `.astro`, `.html`,
`.css` and the like) and CI workflows directly in `.github/workflows/` are
shown in full even when their name says secret or credentials
(`CredentialsForm.tsx`, `lib/secrets.ts`): fix them yourself, and if a line
holds a real secret, stop and tell the owner which file. Exit 1 means
something is left. Fix until it says clean. Also check by eye: the favicon,
the page titles, the email templates, the OG image, the app icon.

## Output

`replica/brand.md` (name with checks, palette, logo brief, voice),
`replica/brand.json`, updated tokens, rewritten strings, and a clean sweep.
Next: `/replica-launch`.
