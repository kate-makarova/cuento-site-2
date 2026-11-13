---
title: Server Health Dashboard
nav_order: 3
---

<p class="docs-lead">The admin dashboard shows four live-updating charts — RAM, CPU, HTTP request rate, and WebSocket connections — with a rolling one-hour window. Data is collected every 30 seconds by a background goroutine and pushed to the browser over WebSocket.</p>

## Data collection

`Services.InitHealthMonitor()` starts a goroutine at startup that calls `runHealthCheck()` immediately and then every **30 seconds**. Each sample reads four sources:

| Metric | Source |
|---|---|
| RAM | `/proc/meminfo` — parses `MemTotal`, `MemFree`, `Buffers`, `Cached`, `SReclaimable`. Used = Total − Free − Buffers − Cached − SReclaimable. |
| CPU | `/proc/stat` — two successive samples; `(deltaTotal − deltaIdle) / deltaTotal × 100`. The first tick produces no CPU value. |
| HTTP requests & latency | Caddy Prometheus metrics at `http://localhost:2019/metrics` (override with `CADDY_METRICS_URL`). Reads `caddy_http_requests_total` and `caddy_http_request_duration_seconds_bucket` as deltas from the previous sample. |
| WebSocket connections | `Websockets.MainHub.ConnectionCount()` — live count at sample time. |

**Linux only.** `/proc/meminfo` and `/proc/stat` do not exist on macOS or Windows. RAM and CPU columns will be empty on non-Linux hosts (local dev, CI). Caddy must have its admin API accessible at `:2019` for HTTP metrics; if unreachable, those columns are silently empty.

## Storage

Each sample is appended as a CSV row to `logs/health/health_YYYY-MM-DD.csv`. One file per calendar day. The format is:

```
timestamp,ram_total,ram_used,ram_available,cpu_pct,http_requests,http_latency_buckets,ws_active
```

Latency buckets are encoded as `0.005:12|0.01:34|…` (le:count pairs, pipe-separated). They are stored but not currently plotted in the frontend.

**Retention:** `pruneOldHealthLogs` runs after every sample and deletes files older than 30 days by mtime.

## Real-time delivery

After each sample, if any subscribers exist, `healthBroadcaster` calls `Websockets.MainHub.BroadcastToUsers` with:

```json
{ "type": "health_update", "data": { ... } }
```

Subscription is managed by WebSocket message types:
- `health_subscribe` — register the current user for push updates
- `health_unsubscribe` — stop push updates
- WebSocket disconnect — auto-unsubscribes

## API endpoint

`GET /admin/health` (role 3). Query parameters `start` and `end` in `2006-01-02 15:04:05` layout (server local time). Defaults to the last 1 hour. Returns `HealthData { ram, cpu, http, ws }` as maps keyed by timestamp string, read from the CSV file(s) for the requested range.

## Frontend dashboard

`admin-dashboard.component.ts` on `ngOnInit`:

1. Fetches `GET admin/health` for the last hour of history.
2. Sends `{ type: "health_subscribe" }` over WebSocket.
3. Subscribes to `notificationService.healthUpdate$` and calls `pushPoint(event.data)` to append the new sample.

On `ngOnDestroy`: sends `health_unsubscribe` and cleans up charts and subscriptions.

**Charts** (Chart.js, 4 `<canvas>` elements, `animation: false`):

| Chart | Datasets | Y axis |
|---|---|---|
| RAM | Used (red), Available (blue), Total (grey dashed) | GB |
| CPU | CPU % | 0–100 |
| HTTP | Requests per 30 s | requests |
| WebSocket | Active connections | connections |

All four charts show only the **last 1 hour**. On each incoming `health_update`, `evictOld()` shifts the oldest label and data point off every chart so the window stays fixed at 60 minutes. X-axis ticks are shown every 10th point to avoid crowding.

The initial load filters to entries within the last 60 minutes before building charts — if the API returns more history, the frontend discards it.

## Key files

| File | Role |
|---|---|
| `cuento-backend/src/Services/health_service.go` | `InitHealthMonitor`, sampling goroutine, CSV read/write, subscriber management |
| `cuento-backend/src/Controllers/health.go` | `GET /admin/health` handler |
| `cuento-backend/src/Websockets/hub.go` | `BroadcastToUsers`, `ConnectionCount` |
| `cuento-frontend/src/app/admin/admin-dashboard/admin-dashboard.component.ts` | Chart initialisation, WS subscription, `pushPoint`, `evictOld` |
