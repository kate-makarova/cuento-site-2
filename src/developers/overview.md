---
title: Project Overview
nav_order: 0
---

<p class="docs-lead">Cuento is split across three independent repositories. This article maps the full stack — what each piece is, how they connect, and where to find things.</p>

## Repositories

| Repo | Language | Role |
|---|---|---|
| `cuento-backend` | Go 1.26 | REST API, MCP server, all business logic |
| `cuento-frontend` | TypeScript / Angular 19 | Single-page app, served as static files |
| `cuento-cli` | Go | Interactive VPS deployment and management tool |

The frontend proxies all API calls to `localhost:8080` during development. In production, Caddy handles routing: `/api/*` goes to the Go backend, everything else serves the Angular build.

## Backend — Go + Gin

The entry point is `main.go`, a single file that bootstraps every service and registers every route. The startup sequence matters:

1. Database → Sonic → Qdrant → i18n
2. Event handler registration
3. Background goroutines (WebSocket hub, MCP server, backup scheduler, archiving notifier)
4. Route registration across three router layers: `publicRouter`, `optionalAuthRouter`, `protectedRouter`

Packages under `src/`:

| Package | Role |
|---|---|
| `Controllers/` | HTTP handlers — one file per domain, no business logic |
| `Services/` | All business logic and external client wrappers |
| `Entities/` | Struct types that mirror DB tables |
| `Middlewares/` | Auth, permissions, rate limiting, error handling |
| `Events/` + `EventHandlers/` | In-process pub/sub bus — handlers run in goroutines, never block requests |
| `MCP/` | MCP server on `:8081` |
| `Features/` | Opt-in modules: AI agent, game digest, currency, post rankings |
| `Install/` | `permissions.csv` and `local_migration.go` |

## Database — MariaDB

Schema is managed by diffing Go entity structs against the live database via `src/Install/local_migration.go`. Running it generates the migration SQL — it never applies changes automatically. All multi-table writes use transactions.

## Full-text search — Sonic

[Sonic](https://github.com/valeriansaliou/sonic) is a lightweight search backend that handles fast full-text queries. Posts, characters, and lore entries are indexed via event handlers that fire after every write. The Go client is `expectedsh/go-sonic`.

## Semantic search — Qdrant

[Qdrant](https://qdrant.tech) is a vector database used for semantic search — finding posts or lore entries by meaning rather than exact keywords. Text is embedded and stored in Qdrant via the same event handler pipeline. The Go client is `qdrant/go-client`.

Both search backends are queried together: Sonic handles exact matches, Qdrant handles "find scenes like this".

## AI — MCP + configurable provider

The AI layer has two parts:

**MCP server** runs on `:8081` using the `mcp-go` library. It exposes lore and search tools that any MCP-compatible AI client can call. The Cuento frontend's AI chat feature connects to this server.

**AI provider** is configured via admin settings (`ai_name`, `ai_api_key`). Three backends are supported:

| Value | SDK | Notes |
|---|---|---|
| `claude` | `anthropic-sdk-go` | Anthropic models |
| `gemini` | `google/genai` | Google models |
| `openai` | `openai-go` | OpenAI models, or any OpenAI-compatible endpoint |

Because the `openai` backend uses a standard OpenAI-compatible API, it works with aggregators like [OpenRouter](https://openrouter.ai) by pointing `ai_api_base` at their endpoint. This gives access to dozens of models from a single API key without changing any backend code.

## Frontend — Angular 19

The frontend is signals-first. State is managed with `signal()`, `computed()`, and `effect()` — avoid mixing signals with `BehaviorSubject` for the same piece of state.

All routes are lazy-loaded via `loadComponent`. The route file is `src/app/app.routes.ts`. Services that call the backend live in `src/app/services/`. Shared components are in `src/app/components/`.

**Known quirk:** in signal-heavy components, plain array or object bindings are skipped during signal-targeted re-renders. Wrap values in `signal()` or `computed()` if they need to update reactively.

## Real-time — WebSockets

A Gorilla WebSocket hub (`src/Websockets/hub.go`) handles real-time delivery of notifications, user activity updates, and post changes. Authentication for WebSocket connections is handled by a dedicated middleware.

## Events

`Events.Publish(db, EventType, data)` dispatches asynchronously — each handler runs in its own goroutine and never blocks the HTTP request that triggered it. All event types and payload structs are declared in `src/Events/event_bus.go`. Handlers are wired once at startup via `EventHandlers.RegisterEventHandlers()`.

This is how Sonic indexing, Qdrant embedding, push notifications, and WebSocket broadcasts stay decoupled from the controllers that trigger them.

## Deployment — Cuento CLI

The CLI walks through a 21-step wizard that forks the repos to your GitHub account, configures GitHub Actions for CI/CD, provisions a VPS, and installs the full production stack: **Caddy** as a reverse proxy, **MariaDB**, and the Go backend as a systemd service. After the initial setup, deployments are triggered by pushing to the `release` branch — no SSH into production required.
