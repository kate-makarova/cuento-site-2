---
title: Дашборд состояния сервера
nav_order: 3
---

<p class="docs-lead">Дашборд администратора отображает четыре графика в реальном времени — RAM, CPU, частота HTTP-запросов и WebSocket-соединения — в скользящем окне на один час. Данные собираются каждые 30 секунд фоновой горутиной и отправляются в браузер через WebSocket.</p>

## Сбор данных

`Services.InitHealthMonitor()` запускает горутину при старте, которая вызывает `runHealthCheck()` немедленно и затем каждые **30 секунд**. Каждая выборка читает четыре источника:

| Метрика | Источник |
|---|---|
| RAM | `/proc/meminfo` — парсит `MemTotal`, `MemFree`, `Buffers`, `Cached`, `SReclaimable`. Используется = Total − Free − Buffers − Cached − SReclaimable. |
| CPU | `/proc/stat` — две последовательные выборки; `(deltaTotal − deltaIdle) / deltaTotal × 100`. Первый тик не даёт значения CPU. |
| HTTP-запросы и задержка | Prometheus-метрики Caddy по адресу `http://localhost:2019/metrics` (переопределяется через `CADDY_METRICS_URL`). Читает `caddy_http_requests_total` и `caddy_http_request_duration_seconds_bucket` как дельты от предыдущей выборки. |
| WebSocket-соединения | `Websockets.MainHub.ConnectionCount()` — актуальное количество на момент выборки. |

**Только Linux.** `/proc/meminfo` и `/proc/stat` недоступны на macOS и Windows. Колонки RAM и CPU будут пусты на не-Linux-хостах (локальная разработка, CI). Caddy должен предоставлять admin API на `:2019`; если он недоступен — колонки HTTP тихо остаются пустыми.

## Хранение

Каждая выборка добавляется как CSV-строка в `logs/health/health_YYYY-MM-DD.csv`. Один файл на календарный день. Формат:

```
timestamp,ram_total,ram_used,ram_available,cpu_pct,http_requests,http_latency_buckets,ws_active
```

Бакеты задержек хранятся в формате `0.005:12|0.01:34|…` (пары le:count через `|`). Они сохраняются, но в текущем фронтенде не отображаются.

**Хранение:** `pruneOldHealthLogs` запускается после каждой выборки и удаляет файлы старше 30 дней по mtime.

## Доставка в реальном времени

После каждой выборки, если есть подписчики, `healthBroadcaster` вызывает `Websockets.MainHub.BroadcastToUsers`:

```json
{ "type": "health_update", "data": { ... } }
```

Подписки управляются типами WebSocket-сообщений:
- `health_subscribe` — зарегистрировать текущего пользователя для push-обновлений
- `health_unsubscribe` — прекратить push-обновления
- Отключение WebSocket — автоматически отписывает

## API-эндпоинт

`GET /admin/health` (роль 3). Query-параметры `start` и `end` в формате `2006-01-02 15:04:05` (локальное время сервера). По умолчанию — последний час. Возвращает `HealthData { ram, cpu, http, ws }` как map по ключу-метке времени, прочитанный из CSV-файла(ов) для запрошенного диапазона.

## Фронтенд дашборда

`admin-dashboard.component.ts` при `ngOnInit`:

1. Загружает `GET admin/health` для истории за последний час.
2. Отправляет `{ type: "health_subscribe" }` через WebSocket.
3. Подписывается на `notificationService.healthUpdate$` и вызывает `pushPoint(event.data)` для добавления новой точки.

При `ngOnDestroy`: отправляет `health_unsubscribe`, очищает графики и подписки.

**Графики** (Chart.js, 4 элемента `<canvas>`, `animation: false`):

| График | Датасеты | Ось Y |
|---|---|---|
| RAM | Используется (красный), Доступно (синий), Всего (серый пунктир) | ГБ |
| CPU | % CPU | 0–100 |
| HTTP | Запросов за 30 с | запросы |
| WebSocket | Активных соединений | соединения |

Все четыре графика отображают только **последний час**. При каждом входящем `health_update` `evictOld()` сдвигает самую старую метку и точку данных с каждого графика, удерживая окно на 60 минутах. Деления по оси X показываются через каждые 10 точек.

При начальной загрузке фильтрация ограничена записями за последние 60 минут — если API вернул больше истории, фронтенд отбрасывает лишнее.

## Ключевые файлы

| Файл | Роль |
|---|---|
| `cuento-backend/src/Services/health_service.go` | `InitHealthMonitor`, горутина выборки, чтение/запись CSV, управление подписчиками |
| `cuento-backend/src/Controllers/health.go` | Обработчик `GET /admin/health` |
| `cuento-backend/src/Websockets/hub.go` | `BroadcastToUsers`, `ConnectionCount` |
| `cuento-frontend/src/app/admin/admin-dashboard/admin-dashboard.component.ts` | Инициализация графиков, WS-подписка, `pushPoint`, `evictOld` |
