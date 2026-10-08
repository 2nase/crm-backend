"""
Example 3: Python - StealthySession (Patchright stealth browser, hidden)

> **Authorization note (project policy):** Only use these capabilities against sites the user owns or is explicitly authorized to scrape. Confirm with the user before enabling stealth mode, `solve_cloudflare`, or proxy rotation against a third-party site, and respect robots.txt and the site's terms.

Scrapes all 10 pages of quotes.toscrape.com using a persistent stealth browser session.
Bypasses anti-bot protections automatically (Cloudflare Turnstile, fingerprinting, etc.).

Best for: well-protected sites, Cloudflare-gated pages, sites that detect Playwright.

Scrapling 0.4.15 stealth sessions skip TLS certificate checks by default;
additional_args below turns them back on (always keep it when cookies,
credentials or proxy auth are involved).
Set headless=False to watch the browser window.
In cloud sessions, export SCRAPLING_EXECUTABLE_PATH first (see SKILL.md > Setup).
Add solve_cloudflare=True to auto-solve Cloudflare challenges.
"""

import os

from scrapling.fetchers import StealthySession

all_quotes = []

with StealthySession(
    headless=True,
    additional_args={"ignore_https_errors": False},  # restore certificate checks
    executable_path=os.environ.get("SCRAPLING_EXECUTABLE_PATH"),  # None: Patchright's own Chromium
) as session:
    for i in range(1, 11):
        page = session.fetch(f"https://quotes.toscrape.com/page/{i}/")
        quotes = page.css(".quote .text::text").getall()
        all_quotes.extend(quotes)
        print(f"Page {i}: {len(quotes)} quotes (status {page.status})")

print(f"\nTotal: {len(all_quotes)} quotes\n")
for i, quote in enumerate(all_quotes, 1):
    print(f"{i:>3}. {quote}")
