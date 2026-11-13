---
title: Local Setup
nav_order: 1
---

<p class="docs-lead">Get Cuento running on your machine for local development. You will need Docker, Node.js, and npm.</p>

## 1. Download the repositories

Cuento's backend and frontend live in separate repositories. Clone both:

```bash
git clone https://github.com/kate-makarova/cuento-backend
git clone https://github.com/kate-makarova/cuento-frontend
```

## 2. Start the backend containers

From the `cuento-backend` directory, start all services with Docker Compose:

```bash
cd cuento-backend
docker-compose up --build
```

This brings up the Go API on port 8080, the MCP server on port 8081, MariaDB, Sonic, and Qdrant. Wait until all containers report healthy before continuing.

## 3. Set up the database

Once MariaDB is running, import the default schema. The file is at `cuento-backend/src/Install/default_tables.sql`:

```bash
docker exec -i cuento-backend-db-1 \
  mysql -u user -ppassword cuento \
  < src/Install/default_tables.sql
```

This creates all tables with their initial structure. You only need to do this once on a fresh database.

## 4. Install Node.js and npm

The frontend requires Node.js 18 or later. If you do not have it installed, download it from [nodejs.org](https://nodejs.org) or use a version manager such as `nvm`:

```bash
nvm install 18
nvm use 18
```

## 5. Start the frontend

From the `cuento-frontend` directory, install dependencies and start the dev server:

```bash
cd cuento-frontend
npm install
npm start
```

The Angular dev server starts at `http://localhost:4200` and proxies all API calls to `localhost:8080` automatically.
