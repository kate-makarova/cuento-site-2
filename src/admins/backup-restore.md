---
title: Backup & Restore
nav_order: 4
---

<p class="docs-lead">Cuento backs up your database to Google Drive automatically on a configurable schedule. Backups are plain SQL dumps — readable, restorable without any special tooling, and pruned automatically so your Drive stays tidy.</p>

## How it works

The backup scheduler runs in the background inside the Cuento process. Every hour it checks whether a backup is due based on your frequency setting. When one is due it runs `mysqldump` with `--single-transaction` and uploads the resulting `.sql` file to a **Cuento Backups** folder in your Google Drive. Files are named `backup_YYYY-MM-DD_HH-MM-SS.sql`. After each upload the scheduler prunes old backups, keeping only the newest N files you configured.

Backups require three things in the admin panel: a **Client ID**, a **Client Secret**, and a **Refresh Token** from a Google OAuth2 application you own. The steps below walk through obtaining all three.

---

## Step 1 — Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and sign in with the Google account that will own the Drive storage.
2. Click the project selector at the top → **New Project**. Name it anything (e.g. `cuento-backup`).
3. With the new project selected, go to **APIs & Services → Library**.
4. Search for **Google Drive API** and click **Enable**.

---

## Step 2 — Create OAuth 2.0 credentials

1. In the same project, go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. If prompted to configure a consent screen first:
   - Choose **External** (or **Internal** if this is a Google Workspace account).
   - Fill in the required App name and support email fields. You do not need to add scopes or test users at this stage — the app will stay in testing mode.
4. Back on the credential creation screen, set **Application type** to **Desktop app**. Give it any name and click **Create**.
5. A dialog shows your **Client ID** and **Client Secret**. Copy both — you will need them shortly.

---

## Step 3 — Get a refresh token

Cuento uses a long-lived refresh token so it can upload backups without manual re-authentication. The easiest way to get one is the Google OAuth2 Playground:

1. Open [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground/).
2. Click the gear icon (⚙) in the top-right corner.
3. Check **Use your own OAuth credentials** and paste your **Client ID** and **Client Secret** from Step 2.
4. In the left column, find **Drive API v3** and select the scope `https://www.googleapis.com/auth/drive`. Click **Authorize APIs**.
5. A Google sign-in flow opens. Sign in with the same account that owns the Cloud project.
6. Click **Exchange authorization code for tokens**.
7. Copy the **Refresh token** from the response. It starts with `1//`.

> **Keep this token secret.** Anyone with the client ID, client secret, and refresh token can read and write your Drive.

---

## Step 4 — Configure backups in the admin panel

Navigate to **Admin → Backup**. Enter the values you collected:

| Field | Value |
|---|---|
| **Client ID** | From Step 2 |
| **Client Secret** | From Step 2 |
| **Refresh Token** | From Step 3 |
| **Folder ID** | Leave blank to use an auto-created **Cuento Backups** folder, or paste a specific Drive folder ID |
| **Frequency** | `daily`, `weekly`, or `monthly` |
| **Keep** | Number of backup files to retain (oldest are deleted after each new upload) |
| **Enabled** | Toggle to start the scheduler |

Click **Save settings**. To verify the connection immediately, click **Run backup now** — a backup should appear in the list within a few seconds.

---

## Downloading a backup

The admin panel lists all backups in your Drive folder with their timestamps. Click any entry to download the `.sql` file directly to your computer.

---

## Restoring from a backup

### While the forum is running

If the forum is accessible, you can restore from the admin panel:

1. Go to **Admin → Backup → Restore**.
2. Upload a `.sql` file (downloaded from Drive or from a manual export).
3. The backend pipes the file through `mysql` and returns when the import completes.

**Warning:** this overwrites the live database. All data since the backup was taken will be lost.

### While the forum is down

If the site is unreachable and you need to recover the database manually, use the Cuento CLI:

1. Download the `.sql` file from Google Drive directly (via drive.google.com).
2. Run the CLI, go to **Database** → **Restore from file** and provide the path to the `.sql` file.
3. The CLI SSHes into your server, copies the file, and runs the import via `mysql`.

### Manual import via SSH

If you prefer to do it yourself:

```bash
# Copy the backup to the server
scp backup_2026-01-01_12-00-00.sql user@your-server:/tmp/

# SSH in and run the import
ssh user@your-server
mysql -u <db_user> -p<db_password> <db_name> < /tmp/backup_2026-01-01_12-00-00.sql
```

---

## Manual export (no Google Drive)

If you want a one-off SQL dump without configuring Google Drive, the admin panel has an **Export now** button in **Admin → Backup**. It downloads a fresh `mysqldump` output directly to your browser.
