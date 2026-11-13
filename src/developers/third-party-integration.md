---
title: Third-Party App Integration
nav_order: 9
---

<p class="docs-lead">Cuento supports external applications through a dedicated API key system. A third-party app — a bot, a bridge to another platform, an automation tool — authenticates with a static key and operates within a set of per-subforum permissions you define in the admin panel.</p>

## How it works

Each external app gets its own API key and an independent permission set. The app calls a small set of public endpoints (no login flow required) using the key in a request header. Permissions are granted per subforum, so you can allow an app to post in one subforum while keeping it read-only or completely blocked in others.

The app optionally runs as a specific forum user: posts it creates appear under that user's name.

---

## Creating an app

Go to **Admin → External Apps → New**. Fill in:

| Field | Purpose |
|---|---|
| **Name** | A human-readable label for the app — shown only in the admin panel |
| **Status** | Active or inactive. An inactive app gets a 403 on every request |
| **User** | The forum user whose account the app posts as. Required for write operations; optional for read-only apps |

After saving, the generated API key is shown once. **Copy it immediately** — it is not shown again (though it is stored in the database and an admin can look it up there if needed).

---

## Authentication

All external app endpoints live under `/external-app/*` and do not require a JWT. The app authenticates by including the key in every request:

```
X-Api-Key: <your_api_key>
```

A missing or unknown key returns `401`. A valid key belonging to an inactive app returns `403`.

---

## Permissions

Permissions are granted per subforum. Navigate to the app's edit page (**Admin → External Apps → [app name]**) and add permission entries — each entry is a combination of a subforum and an action.

Available actions:

| Permission | What it allows |
|---|---|
| `get_active_topics` | List active topics in the subforum |
| `get_first_post` | Read the first post of any topic in the subforum |
| `post` | Create a new post in a topic in the subforum |

Each endpoint checks the relevant permission at request time against the subforum of the topic being accessed. No matching entry → `403`.

> **Note:** `get_post` (read any post by ID) and `update_post` (edit a post's content) also exist in the backend but are not exposed in the admin UI permission form — they must be added via the API directly if needed.

---

## API endpoints

All endpoints require the `X-Api-Key` header. Subforum-scoped endpoints check permissions against the subforum of the requested topic.

### List active topics
```
GET /external-app/active-topics?subforum_ids=1,2&page=1
```
Requires `get_active_topics` permission for each requested subforum.

### Get the first post of a topic
```
GET /external-app/topic-first-post?topic_id=123
```
Requires `get_first_post` permission for the topic's subforum. Returns `post_id`, `content` (BBCode), and `content_html`.

### Get a single post
```
GET /external-app/get-post/:id
```
Requires `get_post` permission for the post's subforum. Returns `post_id`, `post_content`, and `post_author_id`.

### Create a post
```
POST /external-app/post
{ "topic_id": 123, "content": "BBCode content here" }
```
Requires `post` permission for the topic's subforum. Requires the app to have a **User** set — the post is created under that user. Returns `{ "post_id": ... }`.

### Update a post
```
POST /external-app/update-post/:id
{ "content": "Updated BBCode content" }
```
Requires `update_post` permission for the post's subforum. Requires the app to have a **User** set.

---

## Managing an app

From the app's edit page you can:

- Rename the app or change its associated user
- Toggle status between active and inactive (a quick way to disable an app without deleting it or its permissions)
- Add or remove individual subforum permission entries

Deleting an app removes the key and all its permissions.
