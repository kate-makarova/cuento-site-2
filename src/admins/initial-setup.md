---
title: Initial Setup
nav_order: 1
---

<p class="docs-lead">After deploying Cuento with the CLI, complete these steps to configure your forum for the first time.</p>

## Using the Cuento CLI

The recommended way to deploy is the interactive Cuento CLI, which walks you through a 21-step wizard: it forks the repositories to your GitHub account, configures CI/CD pipelines, provisions the VPS, and installs the full stack — Caddy, MariaDB, and the backend service.

## First login

Once the deploy pipeline completes, navigate to your domain. Use the superuser credentials created during the CLI wizard to log in and access the admin panel at `/admin`.
