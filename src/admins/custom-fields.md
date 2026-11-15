---
title: Custom Fields
nav_order: 7
---

<p class="docs-lead">Custom fields let you add extra information to character sheets, character profiles, scene headers, and wanted character listings — without touching any code. You define the fields in the admin panel; the platform creates the necessary database columns automatically.</p>

## Which entities support custom fields

Four entity types can have custom fields:

| Entity | What it affects |
|---|---|
| **Character sheet** | The main character sheet every player fills out |
| **Character profile** | A secondary info block shown alongside the sheet |
| **Scene header** | The description and metadata shown at the top of each scene |
| **Wanted character** | Listing posted when a player is looking for a specific character |

Each entity type has its own independent template. Changes to the character sheet template do not affect scene headers, and so on.

## Opening the template editor

Each entity type has its own template editor page in the admin panel:

- **Admin → Character template** — character sheet fields
- **Admin → Character profile template** — character profile fields
- **Admin → Scene template** — scene header fields
- **Admin → Wanted character template** — wanted character listing fields

## Field names

Every field has two names:

**Machine name** — used internally as the database column name. Must contain only lowercase letters, digits, and underscores (`a–z`, `0–9`, `_`). Once a field is saved with a machine name, changing that name will delete the existing data for that field and start fresh — treat it as permanent.

**Human name** — the label shown to users in forms and on the page. This can be changed at any time without affecting stored data.

## Field types

The **field type** controls how the value is stored in the database. The **content field type** controls how it is presented to users in the form.

### Text fields

| Content field type | What it shows |
|---|---|
| `short_text` | Single-line text input |
| `long_text` | Multi-line text area that accepts BBCode formatting |

Use `short_text` for names, titles, and brief labels. Use `long_text` for descriptions, biographies, and anything that spans multiple paragraphs or needs formatting.

### Number fields

| Content field type | Storage |
|---|---|
| `number` | Integer — whole numbers only |
| `decimal` | Decimal number — up to two decimal places |

### Date field

The `date` content field type shows a date picker. Dates are stored internally and formatted for display in the user's locale.

### Image fields

| Content field type | Behavior |
|---|---|
| `image` | Full-size image upload |
| `cropped_image` | Image upload with a forced crop to a specific pixel size |

For `cropped_image`, set the **Width** and **Height** in pixels. All uploaded images for that field will be cropped to those exact dimensions.

### Free-format date

The `free_format_date` type is a custom date system for settings that don't match a real-world calendar — for example, an in-game date, a season name, or a year in a fictional era. You define a format string with placeholders; users fill in the placeholders when editing the entity. Values are sortable, so lists of entities can be ordered by this field.

### Select fields

A select field lets users choose from a fixed list of options you define. Two display styles are available:

| Content field type | Appearance |
|---|---|
| `dropdown` | Drop-down menu |
| `radiobox` | Radio button group |

When you choose a select type, an **Options** editor appears. Each option has a numeric key (used internally) and a text label (shown to users). Add and remove options as needed. Changing or removing an existing option key will affect any entities that already have that value stored.

## Field order

Each field has an **Order** number that controls where it appears in the form and on the display page. Lower numbers appear first. Fields with the same order number are sorted by machine name.

## Blocks

Blocks let you group related fields under a shared heading. A block has a name (shown as a section heading) and a list of fields that belong to it. Fields not assigned to any block appear in an ungrouped default section.

You can reorder blocks and change which fields belong to each block at any time — this is a display-only change and does not affect stored data.

## Block setting toggles

A block setting toggle is a switch that individual entities can use to show or hide a group of fields. For example, if some characters have an "Advanced Skills" block but others don't, you can add a toggle so each character's player can decide whether to include it.

Each toggle has a machine name, a label, and a list of fields it controls. When a player turns the toggle off on their entity, those fields are hidden from view (the values are retained but not displayed).

## Changing an existing field type

If you change the **field type** of a field that already has data, the platform will warn you before saving. Changing from `text` to `string`, for example, would truncate any stored values longer than 255 characters. Review the warning and confirm only if you are sure existing data can be lost or truncated.

Changing the **human name**, **order**, or **block assignment** of an existing field is always safe.
