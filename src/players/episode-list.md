---
title: Scene List
nav_order: 11
---

<p class="docs-lead">The scene list page shows every scene on the forum in a sortable, filterable table. Every filter, sort, and column choice is saved in the URL — so you can bookmark or share a link that always opens to exactly the view you configured.</p>

## Columns

The table always shows five fixed columns:

| Column | What it shows |
|---|---|
| Title | Scene name, linked to the topic |
| Subforum | Which subforum the scene belongs to |
| Status | Active, finished, or archived |
| Last Post | Date of the most recent post |
| Characters | Characters participating in the scene |

Depending on how your forum is configured, additional columns may appear for custom scene fields — things like in-game date, location, story arc, or any other field the admins have added to the scene template. Long text fields and image fields are not shown as columns.

You can show or hide any column using the **Columns** toggle above the table. Your selection is saved in the URL.

## Filtering

Use the filter panel to narrow down the list:

**Subforum** — show only scenes from one or more specific subforums.

**Faction** — show only scenes where at least one participating character belongs to the selected faction.

**Characters** — show only scenes that include specific characters. This is useful for following a particular character's storyline across multiple scenes.

**Custom field filters** — if the scene template includes select or short text fields, those appear as additional filter options. For example, you might filter by location or by story arc name.

Filters combine — selecting a faction and a character together shows only scenes that match both conditions.

## Sorting

Click any column header to sort by that column. Clicking again reverses the direction; clicking a third time removes the sort. You can sort by multiple columns at once — the first column you click takes the highest priority, and additional columns break ties.

**In-game date sorting** is available if the scene template includes a free-format date field. Sorting by that column orders scenes by their in-world chronological date, regardless of when they were created or last posted in.

The sort order is saved in the URL.

## Saving and sharing URLs

Every change you make — filters, sort, column visibility, page number — is immediately reflected in the browser URL. Nothing is stored in an account or a cookie; the URL itself is the saved state.

This makes the scene list very convenient for recurring use:

- **Faction view**: filter by a faction and sort by in-game date, then bookmark the URL. Every time you open it you see all scenes for that faction in story order.
- **Character follow**: filter by one or more characters to track their active storylines across the forum.
- **Shared links**: paste the URL in a forum post or Discord message and anyone who opens it sees the same filtered view (subject to their own subforum read permissions).

The URL updates using `replaceUrl` — filtering and sorting does not add entries to your browser history, so the back button always takes you to the previous page rather than the previous filter state.

## Permissions

You can only see scenes from subforums you have read access to. If a subforum is restricted, its scenes do not appear in the list regardless of which filters are active.
