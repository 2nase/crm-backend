---
name: replica-recon
description: >-
  Replica pack, step 1 of 11: a clean-room rebuild of an existing app. Only
  when the owner explicitly asks to clone or rebuild an existing app; not for
  ordinary work on this CRM. Reverse-engineers that app into a recon map:
  screen inventory, user flows, component list, inferred data model and a
  feature matrix, from public pages, screenshots, app store listings, help
  docs and the user's own account. Use when the user says "clone this app",
  "I want to build my own version of X", "copy this app", or pastes an app's
  URL or App Store link and wants to rebuild it.
---

# replica-recon

**Only for a Replica project the owner asked for** (a clone of an existing
app), not for ordinary work on this CRM.

Everything else in the pack builds from what this skill writes. A bad recon
map means a bad clone, so take the time here.

Output goes in the clone's own repository (step 1, question 4), never in this
CRM repo:

```
replica/recon.md        the recon map (template: recon-map.md in this folder)
replica/features.csv    the feature matrix (template: features.csv in this folder)
replica/screens/        reference screenshots of the original. Never shipped.
```

## The rules, before anything else

This skill rebuilds **functionality and UX patterns**, clean-room style. It
studies what the app does and how a user moves through it. It does not take
anything the app owns.

- **Public sources and the user's own account only.** Never log into an
  account that is not the user's, never ask for a password, never get past a
  paywall or a login by any trick.
- **Reading, not scraping.** No crawlers, no bulk downloads, no loops. If a
  browser tool is connected to the user's own browser, read pages at human
  speed with the user present.
- **No source code, no private APIs.** Do not read or save the app's
  JavaScript bundles, decompile its binary, or log its network calls to copy
  endpoints. Public API docs are fine to read.
- **Check the terms.** Some products' terms forbid using an account to build a
  competing product. If the user's account is under terms like that, say so
  and work from public sources only.
- **Screenshots are reference.** They live in `replica/screens/`, are used to
  compare layouts, and never go into the clone. They stay local:
  `replica/screens/` is gitignored, so never commit, push or publish them.

## Step 1: scope

Ask four things, or propose answers and get a yes:

1. **Which app, which platform.** Web, iOS, Android, desktop.
2. **Which slice.** "All of Notion" is not a project. "Notion's pages, blocks
   and sharing" is. Default to the core loop: the one flow users pay for.
3. **Who it is for.** The user's own business, a niche, a product to sell.
4. **Where the clone lives.** Never in the CRM repository (2nase/crm-backend):
   its tsconfig compiles every .ts/.tsx outside dot folders, and one .ts file
   outside `src/` moves the build from `dist/main.js` (what CI and
   `start:prod` run) to `dist/src/main.js`. Ask the owner for a separate
   repository (the owner creates it, and in a cloud session adds it to the
   session). Check it out next to the CRM repository, never in a folder
   inside it: the CRM's tsconfig and its Stop gate pick up nested
   repositories too. Locally, open a session in that folder or add it with
   `/add-dir`. With the owner's OK, copy into it:
   - this pack (`.claude/skills/replica-*/`);
   - from the CRM's `.gitignore`, the env and key lines at the top and the
     blocks headed "playwright-cli output", "Safety net for playwright-cli
     files", "Playwright test runner output", "Scrapling spider dev cache"
     and "Replica";
   - into its `CLAUDE.md`, the CRM's `npx` rule (*Commands*) and, from
     *Definition of done*, "No new dependencies or global installs without
     asking; pin exact versions that have been public for at least two
     weeks" and the "Ask the owner first for" list, so sessions opened
     there keep them.

   All Replica work happens there, `replica/` included: every path in the
   pack is relative to that repository's root. Run every command from that
   root (start it with `cd <path of the clone's repository> &&`) and give
   that path to any subagent you hand a command to, such as `runner` for
   installs and builds: subagents start in the CRM repository. Before the
   first write, check that `git rev-parse --show-toplevel` prints the
   clone's repository. Never add `replica/`, clone code, `e2e/`,
   `playwright.config.ts` or clone dependencies to the CRM repository, never
   connect it to a host, and never edit its tsconfig to quiet the typecheck
   gate (that is the owner's decision). In the clone's own repository, where
   this pack has been copied, this question is already answered for the app
   that repository was made for: skip it. For a different app, ask the owner
   for its own new repository, as above.

## Step 2: list the sources

Build a sources table first, with a URL on every row. In order of value:

| source | what it gives you |
| --- | --- |
| help center / docs | the most complete feature list there is, and the settings |
| pricing page | which features matter (they gate them) |
| changelog | what was added recently, what the team thinks is important |
| app store listing | screenshots of every key screen, the pitch, ratings |
| public walkthrough videos | real flows, click by click |
| marketing site | positioning, the core loop in their words |
| the user's own account | the real thing, every state, driven by the user |
| public API docs | the data model, almost for free |

## Step 3: screen inventory

One row per screen. IDs are stable: S01, S02... Every other file refers to them.

`ID | screen | route or how you get there | purpose | key components | states seen`

States matter: empty, loading, filled, error, permission denied, mobile. An
empty state you did not record is an empty state you will not build.

## Step 4: user flows

F01, F02... Each one is a goal and the screens it passes through:

```
F01 Guest books a meeting
    S07 booking page -> S08 pick a time -> S09 details form -> S10 confirmed
    edge: no slots this week, time zone differs, slot taken while filling the form
```

Count the clicks on the happy path. It becomes the number to beat.

## Step 5: components

Every repeated UI part: buttons, inputs, date pickers, modals, tables, toasts,
nav. Name, variants, states, which screens use it. This becomes
replica-design's component list.

## Step 6: inferred data model

Entities, fields and relationships, each with its evidence and a confidence:

```
Booking  id, event_type_id, start_at, end_at, guest_name, guest_email,
         status (confirmed | cancelled | rescheduled), answers (json)
         evidence: S09 form fields, S10 confirmation, help article "Cancel a booking"
         confidence: high
```

Mark guesses as guesses. replica-architect turns this into a real schema.

## Step 7: feature matrix

Write `replica/features.csv` (columns: feature, area, priority, original,
clone, notes). Priority is must / should / could. `clone` starts at `no` for
every row and gets filled in during the build. replica-diff scores it.

## Step 8: what cannot be cloned

List it honestly, as `skip` rows with a reason: licensed content (a music
catalogue, a stock library), the network and its users, data the app owns,
partner deals, hardware, regulated licences (banking, health). "Clone any
app" means the features and the flow, not what the app owns.

## Step 9: size it

Screens, flows, entities, and the hard parts (realtime, sync, payments,
calendar or email integrations, offline). Give a size: S (a weekend), M (a
few weeks), L (a quarter), XL (rescope it). No promises of a perfect clone.

## Output

`replica/recon.md` and `replica/features.csv`, then a five-line summary: the
core loop, screen and flow counts, the three hardest parts, what is out of
scope, and the next step: `/replica-architect`.
