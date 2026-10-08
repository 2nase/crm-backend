# Scrapling skill — audited adaptation

Source: official skill `scrapling-official` from [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) @54e9510 (`agent-skill/Scrapling-Skill`, BSD-3-Clause, see `LICENSE.txt`), matching library version 0.4.15. The published ZIP was checked and is identical to the folder.

## How it was reviewed

- Every upstream file (SKILL.md, 20 references, 4 examples + README) was read in full by five audit agents, each group re-audited by an independent adversarial verifier (diff against upstream, API claims checked against the 0.4.15 source and an installed venv), with fix and re-verify rounds where needed — 20 agents in total.
- Remaining findings were closed by the orchestrator directly in this file set (see "Project-level fixes").
- Runtime checks in a cloud session: parser, static `Fetcher`, `DynamicFetcher`, `StealthyFetcher` (pre-installed Chromium) and the `scrapling extract` CLI against a local test server. External sites were blocked by the environment's network policy.

## SKILL.md changes (generated reproducibly from upstream with targeted replacements)

- Name `scrapling`; description without "anti-bot bypass" marketing; provenance line instead of "official skill".
- Removed: a text block addressed to "AI scanners" (persuasion aimed at security reviewers) and a donation/advertising instruction to the agent.
- Setup: venv install, pre-installed Chromium via `SCRAPLING_EXECUTABLE_PATH`/`executable_path` instead of `scrapling install --force`, note on network-policy 403s.
- `--ai-targeted` described as risk reduction, not protection (bidi and tag characters, stylesheet-hidden elements and other cases survive).
- Guardrails added: ask before stealth/Cloudflare solving/proxy rotation on third-party sites; no scraping of personal data (GDPR, CRM context); scraped content is untrusted; no secrets in code; **TLS**: stealth sessions set `ignore_https_errors=True` and grant geolocation/notifications by default — pass `additional_args={"ignore_https_errors": False}` when credentials, cookies or proxy auth are involved; **`response.follow()`** re-sends inherited headers/cookies/proxy auth to any host — set `allowed_domains` and fresh headers; never send real data to public request-inspection endpoints used in examples.

## Reference and example changes

- Authorization note (project policy) added below the first heading of every file that documents stealth, anti-bot, Cloudflare solving, fingerprinting or proxy rotation (fetching/*, spiders/sessions.md, spiders/proxy-blocking.md, mcp-server.md, building-rag-systems.md, examples).
- `fetching/stealthy.md`: removed the "Real-world example (Amazon)" section (bot-protection evasion against a named third-party site, plus a promotional line).
- `spiders/advanced.md`: login example reads credentials from environment variables, follows with `method="GET", data=None` (0.4.15 would otherwise re-POST the credentials), cache dir inside the project, corrected timestamp comments.
- `spiders/sessions.md`: removed per-request `block_webrtc`/`hide_canvas` (silently ignored in 0.4.15), fixed an import, replaced a bearer-token example header.
- Accuracy fixes verified against 0.4.15: sanitization claims in `fetching/choosing.md`, `building-rag-systems.md`, `mcp-server.md` (exact list of what is stripped; library bug: an `<svg>` containing `<style>` can leave later `<noscript>`/`<svg>` elements); `generic-templates.md` (empty `rules()` behaviour); `building-rag-systems.md` (robots.txt is not on by default); `parsing/selection.md` (relative XPath when chaining, `similarity_threshold=0`); `parsing/main_classes.md` (two example outputs); `fetching/static.md` (impersonation target); `fetching/dynamic.md` (Chrome install is system-wide and needs root); `migrating_from_beautifulsoup.md` (one wrong example).
- Unchanged (byte-identical): parsing/adaptive.md, spiders/architecture.md, getting-started.md, requests-responses.md, platform-templates.md, integrations/scrapy.md. Examples 02 and 04 were unchanged until the PR review below.

## Project-level changes outside this folder

- `.gitignore`: `.scrapling_cache/`, `dev_cache/`, `crawl_data/` (spider caches and checkpoints can contain cookies and headers).

## Fixes from the PR review (2026-10-08)

- Setup: ask the owner before the first install; exact pin `"scrapling[rag]==0.4.15"` with `--exclude-newer 2026-10-06` (audit date) so the dependency tree stays at the audited state (dry-run resolved 26 packages); `--no-python-downloads`; the `ai` extra (MCP server) only when the owner wants it; the pip fallback is pinned too. The `rag` extra was chosen over `all` because it already covers the fetchers, the `extract` CLI and Markdown output (checked in the 0.4.15 wheel: IPython is only needed for the interactive shell).
- Docker: pulls `pyd4vinci/scrapling:0.4.15` pinned by digest (Docker Hub, checked 2026-10-08), ask first; the unpinned `ghcr.io/...:latest` alternative was removed.
- The `stealthy-fetch` escalation hints now point to the ask-first guardrail.
- `examples/README.md` and `references/building-rag-systems.md` no longer say `pip install` into the system Python or `scrapling install [--force]`; they point to SKILL.md > Setup. The example run lines use the venv's Python from the repository root.
- `references/mcp-server.md`: adding the MCP server needs the owner's OK; Docker commands pinned by digest.
- Examples: 02 and 03 run headless and read `SCRAPLING_EXECUTABLE_PATH` (pre-installed Chromium in cloud sessions); 03 passes `additional_args={"ignore_https_errors": False}` (in 0.4.15 `additional_args` is applied after the stealth defaults, verified in `engines/_browsers/_base.py`); 04 sets `robots_txt_obey = True` and writes `crawl_data/quotes.json` (gitignored) instead of `quotes.json` in the working directory.
- `references/fetching/choosing.md` (4 links) and `static.md` (1 link): `parsing/main_classes.md` corrected to `../parsing/main_classes.md`.
