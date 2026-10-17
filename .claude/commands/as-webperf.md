---
description: Run a web performance audit via the web-performance-auditor persona
---

`/as-webperf` targets web applications specifically. Do not use it for utility libraries, CLIs, or server-only code with no browser-facing output.

## Determine the mode

**Deep mode** — activate when any of these is available:
- A Lighthouse JSON report file (e.g. from `npx --yes lighthouse@13.5.0 <url> --output json --output-path /tmp/lighthouse-report.json`)
- A PageSpeed Insights JSON response (includes Lighthouse + CrUX)
- A CrUX API response (requires `CRUX_API_KEY` or `GOOGLE_API_KEY`)
- A DevTools performance trace
- A live URL plus the `chrome-devtools` MCP server configured in the harness (the agent can capture metrics directly via `lighthouse_audit` and `performance_*` tools)
- The Chrome DevTools MCP CLI invoked locally (`npx --yes -p chrome-devtools-mcp@1.10.1 chrome-devtools <tool>`, with the telemetry settings in the `web-performance-auditor` agent) — the user runs its commands and passes the output to the agent

The `npx` commands above download and run packages from npm: ask the owner before running any of them, keep the exact versions (checked on npm on 2026-10-17), and never install globally. Keep reports and traces outside the repository: they hold screenshots and URLs of the audited pages.

**Quick mode** — default when none of the above are available. The agent scans source code for structural anti-patterns and labels every finding as `potential impact`.

## Run the audit

Spawn the `web-performance-auditor` subagent. Pass it explicitly:

- The files, components, or diff under review
- Any artifact paths (Lighthouse JSON, PSI JSON, CrUX response, trace) or pasted JSON content
- The target URL or page name when known
- A note on which mode you expect (Quick or Deep), so the agent surfaces missing inputs if Deep was intended

The subagent returns a scorecard (only populated with sourced values), a ranked list of findings, positive observations, and proactive recommendations.

## Output

Return the full audit report to the user. No synthesis or merge step is needed — this is a single-persona command.
