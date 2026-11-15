---
title: CLI and Deployment
nav_order: 2
---

<p class="docs-lead">The Cuento CLI is an interactive menu-driven tool that handles the full deployment lifecycle — from forking the source repositories to provisioning a VPS, triggering deployment pipelines, and managing a live instance.</p>

## Installing the CLI

Download the pre-built binary for your OS from the [GitHub Releases](https://github.com/topics/cuento) page. No installation required — run it directly:

```bash
# macOS
chmod +x cuento-cli-macos
./cuento-cli-macos

# Windows
cuento-cli-windows.exe
```

The CLI has no flags or subcommands. Everything is driven by interactive menus.

## Creating a new project

Selecting **Create new project** from the main menu starts a 21-step wizard. If it is interrupted at any step, it resumes from where it left off on the next run — progress is saved to `~/.config/cuento/config.json` after each step completes.

### What the wizard collects

Before any work begins, the wizard prompts for:

- A GitHub personal access token (needs `repo` and `workflow` scopes)
- Your GitHub username
- The VPS IP address, SSH user, and SSH/sudo passwords
- The domain name the forum will be served from
- Database credentials (root password + a dedicated app user/password)

Everything is saved to `~/.config/cuento/config.json` (mode 0600) and reused across runs.

### Step 1 — Fork the repositories

The CLI forks both `cuento-backend` and `cuento-frontend` to your GitHub account using the GitHub API. The forks are the repos your CI/CD pipelines will build and deploy from. You own the forks — upstream changes are merged in explicitly via the **Update** command, not automatically.

### Steps 2–6 — Configure GitHub Actions secrets

The wizard sets the following secrets on both forks via the GitHub API:

| Secret | Value |
|---|---|
| `SSH_HOST` | VPS IP address |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | ed25519 private key (generated at this step) |
| `DB_PASSWORD` | App database user password |
| `DOMAIN` | The forum's domain |

An ed25519 key pair is generated locally at this point. The private key is stored as the `SSH_PRIVATE_KEY` secret so GitHub Actions can SSH into the VPS to deploy. The public key is uploaded to `~/.ssh/authorized_keys` on the server in a later step.

### Steps 7–14 — Provision the VPS

The CLI SSH-es into the server and installs the full production stack:

**MariaDB** — installed via `apt`, configured with the root and app credentials you provided. The app database and user are created.

**Caddy** — installed as the reverse proxy. The Caddyfile is written with this routing structure:

```
your-domain.com {
  handle /ws*       { reverse_proxy 127.0.0.1:8080 { flush_interval -1 } }
  handle /api/*     { uri strip_prefix /api; reverse_proxy 127.0.0.1:8080 }
  handle /backend/* { file_server { root /var/www/backend } }
  handle            { file_server { root /var/www/frontend; try_files {path} /index.html } }
}
```

The `/ws` route uses `flush_interval -1` to keep WebSocket connections alive. The catch-all serves the Angular SPA with a fallback to `index.html` for client-side routing.

**Systemd service** — a `cuento-backend.service` unit is written to `/etc/systemd/system/`. The backend runs as a dedicated `cuento` user, binary at `/var/www/backend/cuento-backend`. Environment variables (DB credentials, domain, etc.) are written directly into the unit file.

**Firewall** — ufw is configured to allow only ports 22, 80, and 443.

**SSH key** — the generated public key is appended to `~/.ssh/authorized_keys` so the GitHub Actions runner can deploy without a password.

### Steps 15–17 — Push deployment workflows

The CLI pushes GitHub Actions workflow files to your forks:

| Workflow | Branch | Trigger | What it does |
|---|---|---|---|
| `backend/deploy.yml` | `release` | Push to `release` | Builds Go binary, copies to VPS via SCP, restarts systemd service |
| `frontend/deploy.yml` | `release` | Push to `release` | Runs `npm run build`, copies `_site/` to `/var/www/frontend` on VPS |
| `frontend/monitor.yml` | `monitor` | Push to `monitor` | Same as frontend deploy but with New Relic browser instrumentation |

Workflow files are embedded in the CLI binary at compile time. The `__PROJECT_NAME__` placeholder in templates is substituted with your project name during this step.

### Steps 18–21 — Install support services

Three additional GitHub Actions workflows are pushed and auto-dispatched to run on the fork's default runner:

**Sonic** — full-text search engine. Installs the binary, writes a `sonic.cfg`, and registers a systemd unit.

**Qdrant** — vector database for semantic search. Installs the binary and registers a systemd unit.

**nginx image hosting** — optional service for image proxying with S3 auth. Built from source with the `ngx_aws_auth` module. The systemd unit is registered but left stopped; port 8888 stays closed until manually enabled.

After these workflows complete, the VPS is fully provisioned.

## How deployments work after setup

Deployments are triggered by pushing to the `release` branch of your forked backend or frontend repo. The GitHub Actions workflow SSHes into the VPS, copies the new binary or build output, and restarts the service. No SSH into production required.

```bash
# Backend deployment
git checkout release
git merge main
git push origin release

# Frontend deployment — same pattern
git checkout release
git merge main
git push origin release
```

The backend deploy restarts `cuento-backend.service` via systemd. The frontend deploy replaces the contents of `/var/www/frontend` and requires no service restart since Caddy serves static files directly.

## First steps after deployment

### Setting a superuser

After the first deploy, the database has no real accounts — only the seeded system users `guest` (ID 0) and `The Nameless One` (ID 1). Create the first admin account via the **Add user** command in the CLI, then immediately run **Set superuser** for it. The first account you create gets **ID 2**.

**Add user** prompts for a username and password, hashes the password with SHA-256 then bcrypt, and inserts a row into the `users` and `user_role` tables directly via SSH into the VPS database. It always grants the `user` role and adds `admin` if you answer yes to **Make this user an admin?**

**Set superuser** writes a `SUPERUSER_ID` environment variable into the systemd unit file, then runs `systemctl daemon-reload` and restarts the service:

```
# /etc/systemd/system/cuento-backend.service
[Service]
Environment="SUPERUSER_ID=2"
```

The backend reads `SUPERUSER_ID` once at startup (`Services/user_service.go`). It is not stored in the database, so it changes only when you run the command again.

What the superuser can do:

- **Exclusive features** — AI model configuration (`Controllers/ai_model.go`), Google Drive backups (`Controllers/backup.go`), and settings flagged `needs_superuser` in `global_settings`, such as API keys (`Controllers/settings.go`). No role grants these.
- **Endpoint permission bypass** — `Middlewares/permissions.go` skips the `role_permission` endpoint check for the superuser, so it works even before permissions are imported.
- **Not bypassed** — subforum access rules (type 1 permissions) still apply to the superuser.

### Importing default permissions

The permissions system controls which user roles can access which API endpoints. The defaults are defined in `permissions.csv` in the upstream backend repository.

After the first deploy, run **Import default permissions** from the CLI menu. This command:

1. Fetches the latest `src/Install/permissions.csv` from the upstream `release` branch
2. SSH-es into the VPS database
3. Runs `INSERT IGNORE` for every row into the `role_permission` table

`INSERT IGNORE` means existing custom permissions are never overwritten — only missing rows are added. Run this command again any time you sync with upstream and suspect new endpoints were added.

## Keeping the instance up to date

### Syncing with upstream

The **Update** command handles pulling upstream changes into your fork:

1. Fetches the latest commit hash from the upstream `release` branch
2. Compares it with the last deployed commit stored in your config
3. Generates a SQL migration by diffing the upstream `default_tables.sql` against your live schema
4. Presents each migration step individually — you review and approve before anything is applied
5. Each step includes a `Forward` and `Revert` SQL; if a step fails, all previous steps are automatically reverted
6. After schema changes are applied, merges the upstream `release` branch into your fork and pushes — triggering the CI deploy automatically

### Resetting the deployment pipeline

If you upgrade the CLI to a new version, its embedded workflow YAML files may have changed. Run **Reset deployment pipeline** to re-push all workflow files to the `main`, `release`, and `monitor` branches of both forks. This is safe to run at any time — it only updates the YAML files, not the application code.

## Database diagnostics

**Database diagnostics** connects to the live VPS database, compares the running schema against the upstream `default_tables.sql`, and shows a diff with risk levels for each change:

| Risk | Meaning |
|---|---|
| Minimal | Adding a nullable column or index |
| Low | Modifying a column default |
| Medium | Changing a column type |
| High | Dropping a column or table |

You can apply individual changes interactively from this screen. Useful for investigating schema drift between your fork and upstream without running a full update.

## Non-interactive mode

Since CLI 2.1.0 the binary also runs single commands from its arguments, so scripts and AI agents can use it. Without arguments it opens the interactive menu as before.

```bash
cuento-cli list                                         # saved project names
cuento-cli update --project NAME [--apply-migration]
cuento-cli diagnostics --project NAME [--json]
cuento-cli reset-pipeline --project NAME
```

- **Commands never prompt.** Credentials are read from the project config file below; there are no flags for tokens or passwords.
- **`update`** prints the migration SQL and stops before merging when the schema changed, unless `--apply-migration` is given — code is never deployed without its schema change.
- **`diagnostics`** only reports; creating or altering tables stays in the interactive menu. `--json` prints the report as JSON on stdout.
- **Exit codes:** `0` success, `1` the operation failed, `2` invalid usage.

## Project config file

Everything the CLI needs to manage an instance is stored in `~/.config/cuento/config.json` (mode 0600). This includes the GitHub token, VPS credentials, SSH key pair, database passwords, and the `setup_step` counter for wizard resume. Back this file up — losing it means re-entering all credentials manually.

<details class="docs-spoiler">
<summary>AI Agent instruction</summary>

If you are an AI agent managing a Cuento instance with the CLI, follow these rules:

1. **Use the non-interactive commands only.** Never drive the interactive menu by piping answers into it.
2. **Start read-only.** Run `cuento-cli list` and `cuento-cli diagnostics --project NAME --json` first, and report what you find.
3. **Updating a production forum is the human's decision.** Ask before running `update` or `reset-pipeline` against any project, even if you were asked to "check" or "prepare" an update.
4. **Never pass `--apply-migration` on your own.** Run `update` without it, show the human the migration SQL it prints, and only rerun with the flag after they approve that SQL.
5. **Check the exit code.** `0` means done; `1` means the operation failed — read the output and report it, do not retry blindly; `2` means your command line was wrong.
6. **Never read, print or edit the config file.** It holds the GitHub token and server passwords.

</details>
