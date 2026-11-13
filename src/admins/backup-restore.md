---
title: Backup & Restore
nav_order: 4
---

<p class="docs-lead">Cuento can back up your database automatically to Google Drive on a configurable schedule.</p>

## Google Drive setup

In the admin panel, connect your Google account and choose a destination folder. Set the backup interval (daily, weekly, or custom cron expression). Backups are compressed SQL dumps uploaded directly to your Drive.

## Restoring

Download the dump from Drive and import it via the Cuento CLI's database restore command, which handles stopping the service, importing, and restarting cleanly.
