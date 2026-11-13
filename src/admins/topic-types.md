---
title: Topic Types
nav_order: 9
---

<p class="docs-lead">Every topic in Cuento has a type that determines what it is for and how it behaves. Understanding the types helps you configure subforum permissions correctly and know which types are user-created versus system-managed.</p>

## Overview

| Type | Purpose | Who creates it |
|---|---|---|
| General | Open discussion thread | Users (if permitted) |
| Episode | Roleplay episode | Users (if permitted) |
| Character Sheet | Character biography and posts | System (on character creation) |
| Wanted Character | Character adoption listing | Users (if permitted) |
| Lore | Wiki-style reference with navigation | Users (if permitted) |

---

## General

A standard discussion thread. Any member with the `Create general topic` subforum permission can open one. General topics support the **Stick the first post** option — when enabled, the opening post appears pinned at the top on every page, which is useful for announcements, rules posts, or any content that should always be visible.

---

## Episode

An episode topic is the main format for roleplay. In addition to being a thread, it carries:

- A **participant list** — which characters (and optional masks) are involved
- An optional **story arc** assignment
- **Content warnings** visible before the topic opens
- **GM posting mode** — when a user is listed as a Game Master for the arc, they can post as an NPC rather than as one of their characters (see the [Game Arcs and GM Tools](/players/game-arcs-and-gm.html) article)
- An `open_to_everyone` flag — when off, only listed participants can post

Mention highlighting (`@username`) is suppressed in episode topics on the assumption that prose-format posts do not need it.

The `Create episode topic` subforum permission controls who can open episodes.

---

## Character Sheet

Character sheet topics are created automatically by the system when a new character is registered — users cannot create them directly. Each character gets exactly one character sheet topic, which holds their biography, appearance description, and any subsequent sheet update posts.

These topics live in the subforum configured as the character sheet subforum for each faction.

---

## Wanted Character

A wanted character topic is a recruitment listing for a pre-designed character that someone can claim and play. It is linked to a wanted character record with the character's description, requirements, and claim status.

The creation and claim flow is described in detail in the Wanted Characters article. The `Create wanted character topic` subforum permission controls who can post listings; this permission is off by default and must be explicitly granted.

---

## Lore

A lore topic is a wiki-style reference page for worldbuilding, faction histories, in-universe documents, or any content that benefits from organized navigation. Instead of a linear thread, it has a **sidebar navigation** that links to individual posts within the topic (or to external URLs).

Creating and using lore topics is described in the player-facing [Lore Topics](/players/lore-topics.html) article.

The `Create lore topic` subforum permission controls who can create them.

---

## Topic Status

Regardless of type, every topic has a status:

| Status | Meaning |
|---|---|
| Active | Open for new posts |
| Inactive | Closed; no new posts; visible in the archive |
| Full | Automatically locked at 1 000 posts; the system creates a continuation topic |
| Deleted | Hidden from all views; can be restored by an admin |

Admins and topic authors can toggle between Active and Inactive. Full and Deleted are managed by the system or admin actions.

---

## Per-Subforum Permission Controls

Which topic types users can create is configured per subforum in the subforum permission settings. Each type has its own toggle:

- **Create general topic** — on by default
- **Create episode topic** — on by default
- **Create lore topic** — on by default
- **Create wanted character topic** — off by default; must be explicitly enabled

Character sheet topics are never user-created, so there is no corresponding permission toggle.

You can restrict a subforum to a single type (for example, an episode-only subforum) by turning off the other creation permissions.
