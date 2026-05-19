# AI-Native CRM Backend (MVP)

[![Repo](https://img.shields.io/badge/GitHub-2nase%2Fcrm--backend-181717?logo=github)](https://github.com/2nase/crm-backend)
[![CI](https://github.com/2nase/crm-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/2nase/crm-backend/actions/workflows/ci.yml)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

The backend foundation of an **AI-native Sales Execution System** — not a standard CRM. It is designed to evolve into a fully autonomous AI Sales Operating System that manages pipeline, analyzes conversations, generates insights, automates sales workflows, and acts as a sales co-pilot.

This MVP delivers the structural skeleton: domain model, REST API, event bus, agent plugin system, automation rules, and an AI service layer wired with deterministic stubs (no real AI calls).

---

## Tech stack

- **Node.js 20+ / TypeScript 5.3** (strict mode)
- **NestJS 10** — modular monolith, DI, controllers, schedulers
- **PostgreSQL 14+**
- **Prisma 5** ORM
- **@nestjs/event-emitter** — wrapped in a typed `EventBusService`
- **@nestjs/schedule** — cron-driven automation rules
- **class-validator / class-transformer** — DTO validation

No frontend, no real AI integrations, no microservices.

---

## Architecture

```
src/
├── main.ts                  # bootstrap
├── app.module.ts            # root module
├── health.controller.ts     # GET /health
├── shared/                  # cross-cutting types
├── infra/prisma/            # PrismaService (singleton, lifecycle hooks)
└── modules/
    ├── events/              # DomainEvent enum + typed EventBusService + GET /events
    ├── agents/              # BaseAgent interface, AgentRegistry, 10 agent stubs, GET /agents
    ├── ai/                  # AiService + 5 stubs (summarize, sentiment, lead score, objections, forecast)
    ├── automation/          # cron-driven InactivityRule + OverdueTaskRule
    ├── activity-logs/       # GET /activity-logs + internal logging service
    ├── contacts/
    ├── deals/
    ├── tasks/
    ├── calls/
    ├── emails/
    └── email-templates/
```

Every resource module follows the same pattern: `module.ts` (DI wiring) → `controller.ts` (REST surface) → `service.ts` (business logic + events) → `dto/` (request validation).

---

## Domain model

See `prisma/schema.prisma`. Models:

| Model | Purpose | Key relations |
|---|---|---|
| `Contact` | People / accounts | has many deals, tasks, calls, emails, activity logs |
| `Deal` | Pipeline opportunity | belongs to Contact, has stage history (JSON) |
| `Task` | Follow-up / action item | belongs to Contact, optional Deal |
| `Call` | Logged call + transcript + summary + sentiment + objections | belongs to Contact |
| `Email` | Sent email record | belongs to Contact, optional EmailTemplate |
| `EmailTemplate` | Reusable mail template categorized (`OBJECTION`, `FOLLOW_UP`, `CLOSING`, `ONBOARDING`, `PRE_SETTING`) | has many emails |
| `ActivityLog` | Audit trail of every domain event | optional Contact |

Indexes are placed on `status`, `stage`, `lastInteraction`, `dueDate`, `timestamp`, `sentimentScore`, etc. — designed for filtering and full-text search readiness.

---

## Event system

`DomainEvent` enum (in `src/modules/events/domain-events.ts`):

```
contact.created
deal.updated
call.finished
email.sent
task.created
task.overdue
contact.inactive_14_days
```

Each event has a typed payload. `EventBusService` exposes:

```ts
emit<E extends DomainEvent>(event: E, payload: EventPayloadMap[E]): void
on<E extends DomainEvent>(event: E, handler: EventHandler<E>): void
onAny(handler): void
```

Services emit events after persistence (e.g. `ContactsService.create()` → `contact.created`, `DealsService.update()` → `deal.updated` with `stageChanged` flag and stage history appended).

---

## Agent plugin system

`BaseAgent` interface:

```ts
interface BaseAgent {
  readonly name: string;
  readonly triggerEvents: readonly DomainEvent[];
  execute(event: DomainEvent, payload: AnyEventPayload): Promise<void>;
}
```

`AgentRegistry` subscribes each agent to its trigger events through the event bus. Failures are caught and logged so one bad agent does not crash the bus.

### Registered agents (10)

| Agent | Triggers |
|---|---|
| `FollowUpAgent` | `call.finished`, `email.sent` |
| `DailyTaskAgent` | `contact.inactive_14_days` |
| `LeadScoringAgent` | `contact.created`, `deal.updated`, `call.finished` |
| `MailAssistantAgent` | `email.sent` |
| `CallSummaryAgent` | `call.finished` (also writes stub summary, sentiment, objections back to the call) |
| `StrategyAdvisorAgent` | `deal.updated` |
| `DealRiskAgent` | `deal.updated`, `task.overdue` |
| `NextBestActionAgent` | `contact.created`, `deal.updated`, `call.finished` |
| `CRMHygieneAgent` | `contact.inactive_14_days` |
| `LearningLoopAgent` | all events (catch-all) |

Implementations live in `src/modules/agents/implementations/`. Each agent self-registers in `OnModuleInit`. Bodies are placeholders that log invocation — drop in real logic without changing the wiring.

---

## Automation rules engine

`AutomationService` (`src/modules/automation/automation.service.ts`) runs two cron jobs:

| Schedule | Rule | Effect |
|---|---|---|
| Daily 02:00 | `InactivityRule` | finds contacts with `lastInteraction > 14d ago`, emits `contact.inactive_14_days` per contact |
| Hourly | `OverdueTaskRule` | finds tasks past `dueDate` in status `OPEN`/`IN_PROGRESS`, marks them `OVERDUE`, emits `task.overdue` |

Stage-change rule is inline in `DealsService.update()` (emits `deal.updated`).
Call-finished rule is inline in `CallsService.create()`.

---

## AI layer (stubs only)

`AiService` exposes 5 deterministic stub methods, ready for future swap-in:

| Method | Stub returns |
|---|---|
| `summarize(text)` | `'[stub summary — N chars in]'` |
| `sentiment(text)` | `0.0` |
| `scoreLead(contactId)` | `50` |
| `detectObjections(text)` | `[]` |
| `forecast(dealId)` | `{ probability: 0.5, expectedCloseDate: null }` |

Each stub is its own injectable class under `src/modules/ai/stubs/` so real implementations can be swapped one file at a time.

---

## REST API

| Endpoint | Description |
|---|---|
| `GET /health` | DB ping + uptime |
| `GET /events` | list known domain event types |
| `GET /agents` | list registered agents and their triggers |
| `POST /contacts` · `GET /contacts` · `GET /contacts/:id` · `PATCH /contacts/:id` · `DELETE /contacts/:id` | contact CRUD |
| `GET /contacts/:id/activity` | activity log for a contact |
| `POST /deals` · `GET /deals?stage=&contactId=` · `GET/PATCH/DELETE /deals/:id` | deal CRUD (stage change auto-tracked in `stageHistory`) |
| `POST /tasks` · `GET /tasks?status=&contactId=&dealId=` · `GET/PATCH/DELETE /tasks/:id` | task CRUD |
| `POST /calls` · `GET /calls?contactId=&q=` · `GET/PATCH/DELETE /calls/:id` | call CRUD with full-text search on transcript/summary |
| `POST /emails` · `GET /emails?contactId=` · `GET /emails/:id` | email logging |
| `POST /email-templates` · `GET /email-templates?category=` · `GET/PATCH/DELETE /email-templates/:id` | template CRUD |
| `GET /activity-logs?contactId=&type=&limit=` | audit feed |

All write endpoints validate payloads via `class-validator`. Unknown fields are rejected (`whitelist + forbidNonWhitelisted`).

---

## Setup

This project ships with an embedded Postgres (via `embedded-postgres` npm package) for zero-install development — no Homebrew, Docker, or system Postgres required. The portable cluster lives under `.pgdata/` (gitignored).

```bash
cd /Users/yusuf/crm-backend

# 1. install deps (downloads the Postgres 18 binary on first run)
npm install

# 2. copy env (defaults point at the embedded cluster)
cp .env.example .env

# 3. start the embedded Postgres — keep this running in its own terminal
npm run db
# → [dev-db] READY — postgresql://postgres:postgres@localhost:5432/ai_crm

# 4. in another terminal, apply migrations (only needed once or after schema changes)
npx prisma migrate dev --name init

# 5. boot the API
npm run start:dev
```

Server listens on `http://localhost:3000` (override via `PORT`).

### Using your own Postgres instead

If you already have Postgres running, skip step 3 and just point `DATABASE_URL` in `.env` at your instance before running migrations.

---

## Smoke test

```bash
# health
curl localhost:3000/health
# → { "ok": true, "db": true, "uptime": 0.42 }

# list domain events
curl localhost:3000/events
# → { "events": ["contact.created", "deal.updated", ...] }

# list registered agents
curl localhost:3000/agents
# → { "count": 10, "agents": [{ "name": "FollowUpAgent", "triggers": [...] }, ...] }

# create a contact (will emit contact.created → 4 agents log invocation)
curl -X POST localhost:3000/contacts \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme Lead","email":"lead@acme.io","company":"Acme"}'

# create a deal (will emit deal.updated)
CONTACT_ID=<paste from above>
curl -X POST localhost:3000/deals \
  -H 'Content-Type: application/json' \
  -d "{\"title\":\"Acme — Pilot\",\"contactId\":\"$CONTACT_ID\",\"value\":12000}"

# log a call with transcript (will emit call.finished → CallSummaryAgent enriches the call)
curl -X POST localhost:3000/calls \
  -H 'Content-Type: application/json' \
  -d "{\"contactId\":\"$CONTACT_ID\",\"duration\":540,\"transcript\":\"Discussed pricing and next steps.\"}"

# inspect activity log for the contact
curl "localhost:3000/contacts/$CONTACT_ID/activity"
```

Watch the server log — each domain event will trigger the matching agents and each invocation prints a line.

---

## Extending the system

- **New event** → add to `DomainEvent` enum + `EventPayloadMap` interface; everything else is type-checked
- **New agent** → drop a file in `src/modules/agents/implementations/`, list it in `agents.module.ts` providers — `OnModuleInit` handles registration
- **Real AI** → replace stub class in `src/modules/ai/stubs/` (one-file swap, public `AiService` API is stable)
- **New rule** → add a class in `src/modules/automation/rules/`, wire it in `automation.module.ts`, add an `@Cron` method in `AutomationService`

---

## Project layout

```
crm-backend/
├── prisma/schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── health.controller.ts
│   ├── shared/enums.ts
│   ├── infra/prisma/{prisma.module.ts, prisma.service.ts}
│   └── modules/
│       ├── events/        (4 files)
│       ├── agents/        (4 framework + 10 implementations)
│       ├── ai/            (service + 5 stubs)
│       ├── automation/    (service + 2 rules)
│       ├── activity-logs/ (3 files)
│       ├── contacts/      (4 files)
│       ├── deals/         (4 files)
│       ├── tasks/         (4 files)
│       ├── calls/         (4 files)
│       ├── emails/        (4 files)
│       └── email-templates/(4 files)
├── package.json · tsconfig.json · nest-cli.json
└── .env.example · .gitignore · README.md
```

---

## License

**Proprietary — All Rights Reserved.** See [LICENSE](LICENSE) for full terms.

The source is publicly viewable for reference only. No license is granted to use, copy, modify, redistribute, host as a service, or train ML models on this code without prior written permission. For commercial-use or licensing inquiries, contact via the repository.
