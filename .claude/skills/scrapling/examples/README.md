# Scrapling Examples

> **Authorization note (project policy):** Only use these capabilities against sites the user owns or is explicitly authorized to scrape. Confirm with the user before enabling stealth mode, `solve_cloudflare`, or proxy rotation against a third-party site, and respect robots.txt and the site's terms.

These examples scrape [quotes.toscrape.com](https://quotes.toscrape.com) - a safe, purpose-built scraping sandbox - and demonstrate every tool available in Scrapling, from plain HTTP to full browser automation and spiders.

All examples collect **all 100 quotes across 10 pages**.

## Quick Start

Install Scrapling as described in `../SKILL.md` > Setup: ask the owner first, install the pinned version into the `.venv-scrapling` venv, and never run `scrapling install` in cloud sessions (Chromium is pre-installed there; export `SCRAPLING_EXECUTABLE_PATH`, which examples 02 and 03 read).

In cloud sessions the network policy blocks quotes.toscrape.com unless the owner allows the host.

## Examples

| File                     | Tool              | Type                        | Best For                              |
|--------------------------|-------------------|-----------------------------|---------------------------------------|
| `01_fetcher_session.py`  | `FetcherSession`  | Python - persistent HTTP    | APIs, fast multi-page scraping        |
| `02_dynamic_session.py`  | `DynamicSession`  | Python - browser automation | Dynamic/SPA pages                     |
| `03_stealthy_session.py` | `StealthySession` | Python - stealth browser    | Cloudflare, fingerprint bypass        |
| `04_spider.py`           | `Spider`          | Python - auto-crawling      | Multi-page crawls, full-site scraping |

## Running

**Python scripts:**

Run from the repository root with the venv's Python:

```bash
.venv-scrapling/bin/python .claude/skills/scrapling/examples/01_fetcher_session.py
.venv-scrapling/bin/python .claude/skills/scrapling/examples/02_dynamic_session.py  # Hidden browser
.venv-scrapling/bin/python .claude/skills/scrapling/examples/03_stealthy_session.py # Hidden stealth browser, certificate checks on
.venv-scrapling/bin/python .claude/skills/scrapling/examples/04_spider.py           # Obeys robots.txt, exports crawl_data/quotes.json
```

## Escalation Guide

Start with the fastest, lightest option and escalate only if needed:

```
get / FetcherSession
  └─ If JS required → fetch / DynamicSession
       └─ If blocked → stealthy-fetch / StealthySession (third-party site: ask the owner first)
            └─ If multi-page → Spider
```
