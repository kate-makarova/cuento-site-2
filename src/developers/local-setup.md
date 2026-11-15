---
title: Local Setup
nav_order: 1
---

<p class="docs-lead">Get Cuento running on your machine for local development — from an empty Docker volume to a working forum with an admin and superuser account. You will need Docker, Node.js, and npm.</p>

## 1. Download the repositories

Cuento's backend and frontend live in separate repositories. Clone both:

```bash
git clone https://github.com/kate-makarova/cuento-backend
git clone https://github.com/kate-makarova/cuento-frontend
```

## 2. Switch both repositories to `release`

Active development happens on the `release` branch. `main` can be months behind — it may lack whole subsystems (superuser, Sonic, Qdrant) and a large share of the permission table. Always build a new instance from `release`, in **both** repositories:

```bash
cd cuento-backend
git fetch origin && git checkout release && git merge --ff-only origin/release
cd ../cuento-frontend
git fetch origin && git checkout release && git merge --ff-only origin/release
```

## 3. Start the backend containers

From the `cuento-backend` directory, start the services:

```bash
cd cuento-backend
docker compose up -d --build db sonic qdrant app
```

This brings up the Go API on port 8080, the MCP server on port 8081, MariaDB on 3306, Sonic, and Qdrant.

The compose file also defines a `caddy` service. You do not need it locally: it serves the placeholder page in `cuento-backend/frontend/`, not the Angular app, and it binds ports 80 and 443.

On macOS, if `docker` is not found but Docker Desktop is installed, start it with `open -a Docker` and add its CLI to your path:

```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
```

## 4. Load the database schema

Docker Compose creates an **empty** `cuento` database — the schema is not loaded automatically. Once MariaDB accepts connections, import it from `src/Install/default_tables.sql`:

```bash
docker compose exec -T db mariadb -uuser -ppassword cuento \
  < src/Install/default_tables.sql
```

Run this only once, against an empty database. The current MariaDB image ships the `mariadb` client only — commands using `mysql` will fail.

The schema seeds three roles (`1` guest, `2` user, `3` admin) and two system users: `guest` (id 0) and `The Nameless One` (id 1).

## 5. Import permissions

A fresh database has **no permissions**, so every API call is refused. The defaults live in `src/Install/permissions.csv`, one row per grant in the form `role_id,type,permission`. Load them the same way the Cuento CLI does — one `INSERT IGNORE` per row:

```bash
awk -F, 'NR>1 && NF>=3 {printf "INSERT IGNORE INTO role_permission (role_id, type, permission) VALUES (%d, %d, '"'"'%s'"'"');\n", $1, $2, $3}' \
  src/Install/permissions.csv | tr -d '\r' \
  | docker compose exec -T db mariadb -uuser -ppassword cuento
```

`INSERT IGNORE` makes this safe to re-run — do so whenever new endpoints are added to the CSV. Duplicate rows in the CSV are skipped by the `(role_id, permission)` primary key, so the inserted count may be slightly lower than the number of lines.

Check that guests can reach a public endpoint:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/active-topics   # expect 200
```

## 6. Install Node.js and npm

The frontend requires Node.js 24 LTS (Angular 22 needs ^22.22.3, ^24.15, or 26 and later). If you do not have it installed, download it from [nodejs.org](https://nodejs.org) or use a version manager such as `nvm`:

```bash
nvm install 24
nvm use 24
```

## 7. Start the frontend

From the `cuento-frontend` directory, install dependencies and start the dev server:

```bash
cd cuento-frontend
npm install
npm start
```

The Angular dev server starts at `http://localhost:4200`. In development the app calls the API directly at `http://localhost:8080` (the backend allows cross-origin requests).

Run `npm install` again every time you switch branches — `node_modules` from another branch may contain a different Angular version.

## 8. Create the first account

Open `http://localhost:4200/register` and register. New accounts get the `user` role only.

Because ids 0 and 1 are taken by the system users, **the first real account has id 2**. Confirm it:

```bash
docker compose exec -T db mariadb -uuser -ppassword cuento \
  -e 'SELECT id, username FROM users WHERE id > 1'
```

## 9. Make the account an admin

Add the `admin` role (id 3) to the account:

```bash
docker compose exec -T db mariadb -uuser -ppassword cuento \
  -e 'INSERT IGNORE INTO user_role (user_id, role_id) VALUES (2, 3)'
```

## 10. Make the account the superuser

The superuser is a separate level above admin. It unlocks functionality that no role can grant:

- AI model configuration (`Controllers/ai_model.go`)
- Google Drive backups (`Controllers/backup.go`)
- Viewing and editing settings marked `needs_superuser` — API keys and similar secrets (`Controllers/settings.go`)

The superuser also skips the endpoint permission table in `Middlewares/permissions.go`. Subforum-level access is checked separately.

The superuser is not stored in the database. The backend reads the `SUPERUSER_ID` environment variable once at startup. `docker-compose.yml` sets it to `3`, which does not match the first account, so override it locally with a `docker-compose.override.yml` next to the compose file:

```yaml
services:
  app:
    environment:
      - SUPERUSER_ID=2
```

Then recreate the backend container so it picks up the new value:

```bash
docker compose up -d app
docker compose exec -T app printenv SUPERUSER_ID   # expect 2
```

The override file is not ignored by git — do not commit it.

Finally, **log out and log back in** so the new role takes effect. The admin panel is at `http://localhost:4200/admin`.

## Running the backend tests

Handler tests in `cuento-backend/test/` run against a real MariaDB database named `cuento_test`, in the same `db` container as your development database. Create it once:

```bash
docker compose exec -T db mariadb -uroot -prootpassword -e \
  "CREATE DATABASE IF NOT EXISTS cuento_test; GRANT ALL ON cuento_test.* TO 'user'@'%';"
```

Then run the tests. Go does not need to be installed on the host — the `golang` image joins the compose network and reaches the database as `db`:

```bash
docker run --rm --network cuento-backend_default -e DB_HOST=db \
  -v "$PWD":/src -w /src golang:1.26-alpine go test ./test/
```

With Go installed locally, `go test ./test/` from `cuento-backend` works too (it connects to `localhost:3306`).

- The tests read `DB_HOST`, `DB_PORT`, `DB_USER` and `DB_PASSWORD`, but the database name is always `cuento_test`. They never touch `cuento`.
- Every test rebuilds `cuento_test` from `src/Install/default_tables.sql` and `permissions.csv`, so its contents are disposable.
- If the database is unreachable, the database tests are **skipped** with a warning and `go test` still reports `ok`. Check the output before treating a run as green.

## Resetting and troubleshooting

- **`docker compose down -v` deletes the database volume**, including every registered account. If you need to reset the schema after someone has registered, back up the `users` and `user_role` rows first.
- **Everything returns 403** — permissions were not imported (step 5).
- **Admin panel missing after granting the role** — log out and back in.
- **API-key settings are hidden or read-only for an admin** — `SUPERUSER_ID` does not match your user id (step 10).

## AI Agent instruction

If you are an AI agent setting up a fresh local Cuento instance, follow these rules:

1. **Check branches first.** Run `git status -sb` and `git log -1 --format=%cd` in both repositories. Both must be on an up-to-date `release`. If either is on `main` or a feature branch, stop and switch before building anything — an instance built from the wrong branch has to be torn down.
2. **Verify the database is new before loading the schema.** `SHOW TABLES` must return nothing. Never load `default_tables.sql` into a database that already has tables.
3. **Use the `mariadb` client inside the `db` container** (`docker compose exec -T db mariadb …`). Do not assume Go or a MariaDB client is installed on the host.
4. **Verify each step.** After loading the schema, count the tables. After importing permissions, count `role_permission` rows grouped by `role_id` and compare against the CSV (allow for duplicate rows). Then `curl` a guest endpoint and expect `200`.
5. **The human registers the account.** Open the registration page in their browser and wait for them to confirm. Never create accounts or set passwords yourself. Then look the user up by username rather than assuming id 2.
6. **Grant admin by adding role 3** to `user_role`. Grant superuser with `SUPERUSER_ID` in an untracked `docker-compose.override.yml` and recreate the `app` container. Do not edit or commit the tracked `docker-compose.yml`.
7. **Never run `docker compose down -v` or drop the database without asking** once anyone has registered. It permanently deletes their account.
8. **Do not trust older notes** (handoff files, memos, this page) over the code. If a step here contradicts the `release` branch, follow the code and flag the discrepancy.
9. **Finish by telling the human** to log out and back in, and report the user id, roles, and `SUPERUSER_ID` you set.
