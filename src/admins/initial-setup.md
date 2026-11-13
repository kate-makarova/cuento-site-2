---
title: Initial Setup
nav_order: 1
---

<p class="docs-lead">This guide walks you through deploying Cuento from scratch — from the prerequisites to a fully configured forum ready for players. The process takes roughly 30 minutes and requires no manual server work.</p>

## What you need before you start

- **A VPS** running Ubuntu 22.04 with at least 1 GB RAM. Any provider works (DigitalOcean, Hetzner, Linode, etc.). The server must be reachable via SSH with password authentication initially.
- **A domain name** pointed at your VPS IP. Cuento's installer configures HTTPS automatically — the domain must already resolve before you run the installer.
- **A GitHub account.** The installer forks the Cuento source repositories to your account. This is how you receive updates and how CI/CD deploys your forum.

## Step 1 — Install the Cuento CLI

Download the CLI binary for your OS from the Cuento releases page and make it executable:

```bash
# macOS
chmod +x cuento-cli-macos
./cuento-cli-macos
```

The CLI has no flags. Everything is interactive menus.

## Step 2 — Run the setup wizard

Select **Create new project** from the main menu. The wizard saves progress after each step — if it is interrupted, restart it and it will resume where it left off.

The wizard will ask for:

- A **GitHub personal access token** with `repo` and `workflow` scopes (create one at GitHub → Settings → Developer settings → Personal access tokens)
- Your **GitHub username**
- Your **VPS IP address**, SSH username, and passwords
- Your **domain name**
- **Database credentials** you want to use (you choose the passwords — the wizard creates the database)

### What the wizard installs on the server

The wizard handles the full server provisioning automatically:

| Component | Role |
|---|---|
| **MariaDB** | Database |
| **Caddy** | HTTPS reverse proxy — certificates are obtained and renewed automatically |
| **Sonic** | Full-text search engine |
| **Qdrant** | Semantic/vector search |
| **Backend service** | The Cuento Go application, running as a systemd service |

The firewall is configured to allow only ports 22, 80, and 443. You do not need to touch the server after the wizard completes.

### How deploys work after setup

The wizard configures GitHub Actions on your forked repositories. From this point on, every time you push to the `release` branch of your fork, GitHub automatically builds and deploys to your server. You never need to SSH into the server again for deployments.

## Step 3 — Wait for the first deploy

After the wizard finishes, it triggers the initial deployment pipeline automatically. This takes a few minutes. You can watch it run in your GitHub repository under the **Actions** tab.

Once it completes, navigate to your domain — you should see the Cuento forum.

## Step 4 — Create the first admin account

The database is empty after first deploy. Use the CLI to create your admin account:

1. Run the CLI and select **Add user**.
2. Enter a username and password. The CLI connects to your server's database directly and creates the account.

## Step 5 — Set the superuser

The first account needs elevated privileges to access the full admin panel. In the CLI, select **Set superuser** and enter the user ID (this will be `1` for the first account you created).

This writes a `SUPERUSER_ID` environment variable into the backend service and reloads it. The superuser bypasses all permission checks and has unrestricted access to the admin panel at `/admin`.

## Step 6 — Import default permissions

Cuento's permission system controls which user roles can call which API endpoints. The defaults need to be loaded into the database once after the first deploy.

In the CLI, select **Import default permissions**. The CLI fetches the latest `permissions.csv` from the upstream repository and loads it into your database with `INSERT IGNORE` — existing customisations are never overwritten.

You will need to run this again after any upstream update that adds new endpoints.

## Step 7 — Configure the forum

Log in to your forum at your domain, then navigate to `/admin`. The admin panel is organised into sections:

**General settings** — set the forum name, description, and default language. These appear in the site header and in browser tab titles.

**Subforums** — create the subforum structure for your forum. Each subforum can have its own access rules — by default all subforums are private and you must explicitly grant access to users.

**Users** — manage registrations, assign roles, and grant subforum access. The three roles are guest (unauthenticated), user (registered member), and admin.

**Features** — opt-in modules including AI, game digest, currency, and post rankings. All are disabled by default.

**AI** — configure the model pool if you want AI features. See [AI Configuration](/admins/ai-configuration.html) for the full setup.

## Step 8 — Grant subforum access to users

New registered users cannot see any subforums until you grant them access. This is intentional — Cuento's permission model is opt-in at the subforum level, regardless of global role.

To grant access, go to **Admin → Subforums → [subforum name] → Permissions** and add the user. You can grant read-only or full posting rights.

## Keeping the forum up to date

When a new Cuento release is available, run **Update** from the CLI main menu. It will:

1. Show you what changed since your last deploy
2. Generate and preview the database migration
3. Apply the migration step by step (with automatic rollback on failure)
4. Merge the update into your fork and trigger a deploy

You are always in control — no update is applied without your review.
