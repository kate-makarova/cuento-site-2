---
title: Static Files and Design
nav_order: 6
---

<p class="docs-lead">Cuento lets admins replace the forum's stylesheet, favicon, and static assets directly from the admin panel — no server access needed. A design-draft system lets you preview CSS changes live before publishing them.</p>

## How static files reach the browser

The Angular frontend is served as static files from `/var/www/frontend`. `index.html` contains hardcoded links:

```html
<link rel="stylesheet" href="/main_style.css">
<link rel="stylesheet" href="/custom_style.css">
<link rel="icon" href="favicon.ico">
```

Uploading a new CSS file or favicon replaces the file on disk at that path. There is no runtime injection — the browser just picks up the new file on the next load.

## Tracked static files

Three canonical file types are version-tracked: `main_style.css`, `custom_style.css`, and `favicon.ico`.

**Upload** (`POST /static-file/upload`): multipart form with a `file` field and a `file_type` field (must be one of the three canonical names). The backend:

1. Archives the current active file by renaming it with a timestamp suffix (e.g. `main_style_2026-01-15_14-30-00.css`).
2. Writes the new file to `/var/www/frontend` and records it in the `static_files` table.
3. Publishes a `StaticFileUploaded` event that prunes old versions — only the 3 most recent are kept per file type.

**List** (`GET /static-file/list/:file_type`): returns the last 3 versions.

**Revert** (`POST /static-file/revert`): takes `{ file_name }` of an archived version and promotes it back to active, archiving the current one.

All three endpoints require role 3 (admin).

## Design drafts

Design drafts let you edit CSS and see the result instantly in a live browser tab, without touching the published files.

### Creating and editing a draft

`POST /admin/design-draft/create` snapshots the current `main_style.css` and `custom_style.css` from disk into a new row in the `design_drafts` table (columns `main_css TEXT`, `custom_style_css TEXT`). A random 12-character hex `session_key` is generated for the draft.

The draft edit UI (`admin-design-draft-edit` component) has an **auto-save** mode: edits are debounced 3 seconds and then POSTed to `POST /admin/design-draft/update/:id`. When CSS changes, the backend broadcasts a `draft_updated` WebSocket event to all browser tabs currently previewing this draft.

### Live preview

Open `/?draft=<session_key>` in any browser tab. The app detects the `draft` query parameter and replaces the `<link>` hrefs to point at:

```
GET /draft/<session_key>/main_style.css
GET /draft/<session_key>/custom_style.css
```

These endpoints serve the `main_css` / `custom_style_css` DB columns directly as `text/css`. A `?t=<timestamp>` cache buster is appended to each href and refreshed every time a `draft_updated` WebSocket message arrives — so the browser reloads only the changed stylesheet, not the page. The draft query param is preserved across Angular route navigations.

The preview tab sends a `{ type: "draft_mode", draft_id: session_key }` WebSocket heartbeat every 30 seconds to stay registered as a subscriber. A background goroutine evicts subscribers not seen in the last 60 seconds.

The draft CSS endpoints are **public** (no authentication required). The `session_key` is the only access control.

### Publishing

`POST /admin/design-draft/publish/:id` runs the same archive-and-replace logic as a direct upload: archives the current active CSS files and writes the draft's CSS content to disk, triggering version pruning.

## Assets

Assets are arbitrary static files served from `/assets/`. They are not version-tracked.

**Upload** (`POST /asset/upload`): saves the file to `/var/www/frontend/assets/` using the original filename (directory components are stripped to prevent path traversal). Files are referenced in CSS or templates as `/assets/<filename>`.

**List** (`GET /asset/list`): reads the assets directory and returns `[{ name, mod_time }]`.

**Delete** (`POST /asset/delete`): takes `{ name }` and removes the file.

There is no file type filtering or size limit enforced server-side.

## Design variations

Design variations are CSS class names stored in the database that users can choose in their account settings. When a variation is selected, its `class_name` is saved to `users.interface_design`. The root `<app-root>` element gets that class applied via Angular's `@HostBinding('class')`, so any CSS rule scoped to `.my-variation-class` overrides base styles globally for that user.

Admins manage variations at `POST /design-variation/create`, `POST /design-variation/update/:id`, and `DELETE /design-variation/delete/:id`. The class names themselves are only meaningful if matching rules exist in `main_style.css` or `custom_style.css`.

## Key files

| File | Role |
|---|---|
| `cuento-backend/src/Controllers/static_file.go` | Upload, list, revert, shared `publishCssFile` helper |
| `cuento-backend/src/Controllers/design_draft.go` | Draft CRUD, publish, CSS serve endpoints |
| `cuento-backend/src/Controllers/asset.go` | Asset upload, list, delete |
| `cuento-backend/src/Controllers/design_variation.go` | Variation CRUD |
| `cuento-backend/src/EventHandlers/static_file_event_handlers.go` | Version pruning on `StaticFileUploaded` |
| `cuento-frontend/src/app/admin/admin-design/admin-design.component.ts` | CSS, favicon, asset, and variation UI |
| `cuento-frontend/src/app/admin/admin-design-draft-edit/admin-design-draft-edit.component.ts` | Draft editor with auto-save and publish modal |
| `cuento-frontend/src/app/app.component.ts` | Draft mode detection, link replacement, WebSocket subscription |
