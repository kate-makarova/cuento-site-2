---
title: Custom Entities
nav_order: 8
---

<p class="docs-lead">Cuento lets admins attach arbitrary fields to four entity types: character sheets, character profiles, scene headers, and wanted character listings. Those fields are stored using a two-table EAV+flattened pattern and kept in sync entirely through auto-generated MariaDB triggers — no application-level sync code runs on write.</p>

## Entity types

Four entity types support custom fields. Each maps to its own pair of database tables.

| `className` | Entity |
|---|---|
| `character` | Character sheet |
| `character_profile` | Character profile (secondary display block) |
| `episode` | Scene header |
| `wanted_character` | Wanted character listing |

Each type has a base table (`{name}_base`) managed separately and a custom-field pair described below.

## The two-table pattern

For each entity type, two tables hold custom field data.

### `{name}_main` — EAV table

One row per (entity, field). Every supported value type has its own column; only the column matching the field's type is populated:

```
entity_id              INT
field_machine_name     VARCHAR(255)
field_type             VARCHAR(50)
value_int              INT
value_decimal          DECIMAL(10,2)
value_string           VARCHAR(255)
value_text             TEXT
value_date             DATETIME
value_free_formatted_date  JSON
sort_free_formatted_date   BIGINT
```

### `{name}_flattened` — wide table

One row per entity, one column per field. The column type is inferred from the field's configured type:

| Field type | Column type |
|---|---|
| `int` | INT |
| `decimal` | DECIMAL(10,2) |
| `string` | VARCHAR(255) |
| `text` | TEXT |
| `date` | DATETIME |
| `select` | INT (stores the option key) |
| `free_format_date` | JSON (plus a companion `{field}_sort` BIGINT column) |

The flattened table also has a `block_settings JSON` column that stores per-entity block visibility state.

## `custom_field_config` table

One row per entity type. The `config` column holds the full template as JSON:

```json
{
  "fields": [ { "machine_field_name": "age", "human_field_name": "Age", "field_type": "int", "content_field_type": "number", "order": 1 } ],
  "blocks": [ { "id": "basics", "label": "Basic Info", "fields": ["age", "faction"] } ],
  "block_settings": [ { "machine_name": "extras", "label": "Extra Details", "children": ["bio", "notes"], "control_type": "manual" } ]
}
```

Legacy configs stored before blocks were introduced are plain arrays of fields; the service layer handles both formats.

## Auto-generated triggers

`UpdateTriggers()` in `custom_field_entity.go` drops and recreates three MariaDB triggers every time a template is saved:

| Trigger | Event | Action |
|---|---|---|
| `{name}_after_insert` | INSERT on `{name}_main` | UPSERTs the matching column in `{name}_flattened` |
| `{name}_after_update` | UPDATE on `{name}_main` | UPSERTs the matching column in `{name}_flattened` |
| `{name}_after_delete` | DELETE on `{name}_main` | NULLs the matching column in `{name}_flattened` |

Inside each trigger, a `CASE field_type` block selects the right `value_*` source column. For `free_format_date` fields the trigger also updates the companion `{field}_sort` BIGINT column. Because the triggers are dropped and recreated on every `UpdateTemplate` call, adding or removing a field always produces a correct trigger reflecting the current schema — there is no incremental migration logic.

## UpdateTemplate flow

`POST /template/:type/update` (admin-only, role 3):

1. Validates all machine names against `^[a-z0-9_]+$`.
2. If `{name}_flattened` does not exist yet: calls `GenerateEntityTables`, which creates both `{name}_main` and `{name}_flattened` and runs `UpdateTriggers`.
3. If the flattened table already exists: calls `UpdateFlattenedTable`, which diffs existing columns against the new config (adds missing columns, drops removed ones), then calls `UpdateTriggers` to rebuild triggers.
4. UPSERTs the JSON config in `custom_field_config`.

Dropping a field removes its column from the flattened table and rebuilds the triggers without it. Renaming a field (changing its machine name) is treated as a drop + add — data in the old column is lost.

## Reading entities

`GetEntity(id, className, db)` in `custom_entity_service.go`:

1. JOINs `{name}_base LEFT JOIN {name}_flattened` on `entity_id`.
2. Fills base struct fields via reflection.
3. Iterates over non-base columns in the flattened row and populates the `CustomFields` map as `map[string]CustomFieldValue`.
4. For `text` fields: runs `ParseBBCode` to populate `ContentHtml`.
5. For `select` fields: resolves the stored integer key to `{id, value}` using the config's Options map.
6. Calls `computeHiddenFields` to suppress any fields whose block toggle is off for this entity instance.

Writing goes through `{name}_main`; the triggers keep `{name}_flattened` consistent automatically.

## Blocks and block setting toggles

**Blocks** (`Block{id, label, fields[]}`) group fields for display. The `fields` list contains machine names. Blocks are purely presentational — they do not affect storage.

**Block setting toggles** (`BlockSettingToggle{machine_name, label, children, control_type: "manual"}`) allow individual entities to show or hide a named group of fields. `children` lists the machine names affected. The toggle state is stored per-entity in `{name}_flattened.block_settings` as JSON and is updated via `SaveEntityBlockSettings`.

`computeHiddenFields(blocks, toggles, entitySettings)` returns the set of field machine names that are currently toggled off for the given entity instance.

## Free-format date

The `free_format_date` field type is a custom date format system. The admin defines a format string with typed placeholders (each placeholder is either a number range or a list of string options). Users fill in those placeholders when editing the entity.

The filled values are stored as JSON in `value_free_formatted_date`. `computeFreeFormatDateSort` encodes the values as a sortable BIGINT by assigning each placeholder a power of 10 — this allows ORDER BY on the companion `{field}_sort` column without parsing JSON in the query.

## Schema conflict detection

The admin frontend reads the current template before the form loads and tracks the existing `field_type` for each field. If the admin changes a field's type and saves, the frontend warns before submitting — a type change alters the flattened column type and the trigger, and may silently truncate existing data (e.g. `text` → `string` truncates to 255 characters).

## Key files

| File | Role |
|---|---|
| `cuento-backend/src/Entities/custom_field_entity.go` | Structs, `GenerateEntityTables`, `UpdateFlattenedTable`, `UpdateTriggers` |
| `cuento-backend/src/Services/custom_entity_service.go` | `GetEntity`, `CreateEntity`, `PatchEntity`, `GetEntityTemplateConfig`, `SaveEntityBlockSettings` |
| `cuento-backend/src/Controllers/template.go` | `GetTemplate`, `UpdateTemplate`, `CustomFieldAutocomplete` |
| `cuento-frontend/src/app/admin/field-template-row/` | Per-field row editor component |
| `cuento-frontend/src/app/models/FieldTemplate.ts` | TypeScript interfaces |
