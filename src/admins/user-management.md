---
title: User Management
nav_order: 2
---

<p class="docs-lead">Manage registrations, roles, and account states from the admin panel.</p>

## Roles

Cuento has three global roles: guest (unauthenticated visitors), user (registered members), and admin. Role assignment is per-account and checked server-side on every protected request.

## Subforum access

Global role alone does not grant access to subforums. Each subforum has its own ACL — you must explicitly grant a user permission to read or post in a given subforum, regardless of their global role.
