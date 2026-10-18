"""
Example 2: Python - DynamicSession (Playwright browser automation, hidden)

Scrapes all 10 pages of quotes.toscrape.com using a persistent browser session.
The browser window stays open across all page requests for efficiency.

Best for: JavaScript-heavy pages, SPAs, sites with dynamic content loading.

Set headless=False to watch the browser window.
In cloud sessions, export SCRAPLING_EXECUTABLE_PATH first (see SKILL.md > Setup).
Set disable_resources=True to skip loading images/fonts for a speed boost.
"""

import os

from scrapling.fetchers import DynamicSession

all_quotes = []

with DynamicSession(
    headless=True,
    disable_resources=True,
    executable_path=os.environ.get("SCRAPLING_EXECUTABLE_PATH"),  # None: Playwright's own Chromium
) as session:
    for i in range(1, 11):
        page = session.fetch(f"https://quotes.toscrape.com/page/{i}/")
        quotes = page.css(".quote .text::text").getall()
        all_quotes.extend(quotes)
        print(f"Page {i}: {len(quotes)} quotes (status {page.status})")

print(f"\nTotal: {len(all_quotes)} quotes\n")
for i, quote in enumerate(all_quotes, 1):
    print(f"{i:>3}. {quote}")
