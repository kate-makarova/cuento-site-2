---
title: Locales
nav_order: 7
---

<p class="docs-lead">Cuento ships with English and Russian. Additional locales can be created as two plain text files and installed through the admin panel — no code changes or server access required.</p>

## How it works

Each locale consists of two files:

- A **frontend `.ts` file** — a TypeScript object with every UI string the Angular app can display.
- A **backend `.json` file** — a JSON object used by the Go backend for server-rendered text: date formatting rules, currency income descriptions, and other strings the server produces before sending them to the browser.

Both files must share the same base name (e.g. `fr.ts` and `fr.json` for French).

The backend loads all `.json` files from the `locales/` directory at startup and after any install/uninstall operation — no server restart is needed. The frontend loads the `.ts` file lazily on first use via a dynamic import.

If a key is missing from a locale, the backend falls back to English automatically.

---

## Preinstalled locales

| Code | Language | Notes |
|---|---|---|
| `en-CA` | English | Default. Cannot be uninstalled or deleted. |
| `ru` | Russian | Preinstalled. |

---

## Creating a locale — the frontend `.ts` file

The frontend file must export a named constant whose name is `TRANSLATIONS_` followed by the filename base in uppercase. For a file named `fr.ts`:

```ts
export const TRANSLATIONS_FR = {
  "home.forum": "Forum",
  "home.topics": "Sujets",
  ...
}
```

Keys are dot-separated strings in `namespace.key` format. The full set of required keys is in `cuento-frontend/src/locale/en.ts` (the English source of truth). Translate every key in that file. Keys should be ordered alphabetically within each namespace.

The backend `addLocaleBlock` function derives the export constant name and the import path from the filename, so the filename and the export name must stay in sync.

---

## Creating a locale — the backend `.json` file

The backend file is a flat JSON object. It must include the **date formatting keys** at minimum, since those control how every timestamp in the forum is rendered:

```json
{
  "date.format": "2 Jan 2006",
  "date.today": "Today",
  "date.yesterday": "Yesterday",
  "date.usePm": "true"
}
```

### Date key reference

| Key | Purpose | English value | Russian value |
|---|---|---|---|
| `date.format` | Go time layout for dates | `"2 Jan 2006"` | `"02.01.2006"` |
| `date.today` | Substituted when the date is today | `"Today"` | `"Сегодня"` |
| `date.yesterday` | Substituted when the date is yesterday | `"Yesterday"` | `"Вчера"` |
| `date.usePm` | `"true"` = 12-hour AM/PM, `"false"` = 24-hour | `"true"` | `"false"` |

Set `date.today` or `date.yesterday` to `""` to disable the substitution and always show the formatted date instead.

### Go time layout reference

Go uses a fixed reference time — `Mon Jan 2 15:04:05 MST 2006` — to describe format patterns. Each component maps to its position in that reference:

| Component | Reference | Example |
|---|---|---|
| Day, no leading zero | `2` | 7 |
| Day, leading zero | `02` | 07 |
| Month abbreviation | `Jan` | Apr |
| Month number, no leading zero | `1` | 4 |
| Month number, leading zero | `01` | 04 |
| Four-digit year | `2006` | 2025 |
| Two-digit year | `06` | 25 |
| Hour 24h | `15` | 14 |
| Hour 12h | `3` | 2 |
| Minute | `04` | 09 |

So `"2 Jan 2006"` produces `7 Apr 2025`, and `"02.01.2006"` produces `07.04.2025`.

### Other backend keys

The `.json` file also carries names and descriptions for currency income events (shown in admin settings). Copy the structure from `cuento-backend/locales/en.json` and translate the values.

---

## Installing a locale

1. In the admin panel, go to **Locales**.
2. Click **Upload locale** and provide:
   - A human-readable name (e.g. "Français").
   - A locale code (e.g. `fr`). This is stored in `users.interface_language` for users who pick this locale.
   - The `.ts` file (frontend translations).
   - The `.json` file (backend/date strings).
3. After uploading, the files are stored on the backend server. Click **Install** to commit the `.ts` file to the frontend GitHub repository and register the locale in `locale_config.ts`.
4. The frontend CI pipeline picks up the commit and rebuilds — the locale becomes selectable in account settings once the build completes.

**Angular locale support:** For languages in Angular's built-in locale list (Russian, Chinese, German, French, Spanish, Portuguese, Italian, Japanese, Korean, Polish, Ukrainian, Turkish, Arabic), the install step also adds an `angularLocale` hint to the config entry. This enables Angular's native formatting for numbers and dates where the framework itself handles locale-specific separators.

---

## Uninstalling and deleting

**Uninstall** removes the `.ts` file from the frontend GitHub repo and rebuilds — the locale disappears from the language selector. The files remain on the backend server.

**Delete** removes the files from the backend server and the database row. A locale must be uninstalled before it can be deleted. The default English locale (`en-CA`) cannot be uninstalled or deleted.

---

## Key files

| File | Purpose |
|---|---|
| `cuento-frontend/src/locale/en.ts` | Complete list of all UI string keys (source of truth) |
| `cuento-frontend/src/locale_config_default.ts` | LOCALES array template — `locale_config.ts` is generated from this |
| `cuento-backend/locales/en.ts` | Copy of the frontend EN file, kept in sync manually |
| `cuento-backend/locales/en.json` | Backend strings + date formatting for English |
| `cuento-backend/locales/ru.ts` / `ru.json` | Russian translations |
| `cuento-backend/src/Services/i18n.go` | `InitI18n`, `ReloadI18n`, `T`, `TData`, `TPlural` |
| `cuento-backend/src/Controllers/locale.go` | Upload, install, uninstall, delete endpoints |
| `cuento-backend/src/Middlewares/locale.go` | `UserLocaleMiddleware` — attaches user locale to every request |
| `cuento-backend/src/Services/user_service.go` | `LocalizeTime`, `LocalizeDateOnly`, date formatting logic |
