"""
Example 3: Python - StealthySession (Patchright stealth browser, visible)

> **Authorization note (project policy):** Only use these capabilities against sites the user owns or is explicitly authorized to scrape. Confirm with the user before enabling stealth mode, `solve_cloudflare`, or proxy rotation against a third-party site, and respect robots.txt and the site's terms.

Scrapes all 10 pages of quotes.toscrape.com using a persistent stealth browser session.
Bypasses anti-bot protections automatically (Cloudflare Turnstile, fingerprinting, etc.).

Best for: well-protected sites, Cloudflare-gated pages, sites that detect Playwright.

Set headless=True to run the browser hidden.
Add solve_cloudflare=True to auto-solve Cloudflare challenges.
"""

from scrapling.fetchers import StealthySession

all_quotes = []

with StealthySession(headless=False) as session:
    for i in range(1, 11):
        page = session.fetch(f"https://quotes.toscrape.com/page/{i}/")
        quotes = page.css(".quote .text::text").getall()
        all_quotes.extend(quotes)
        print(f"Page {i}: {len(quotes)} quotes (status {page.status})")

print(f"\nTotal: {len(all_quotes)} quotes\n")
for i, quote in enumerate(all_quotes, 1):
    print(f"{i:>3}. {quote}")
