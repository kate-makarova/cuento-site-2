# cuento-site Guidelines

Static marketing and documentation site for Cuento, built with Eleventy and hosted on GitHub Pages at `cuento.ca`. No build framework beyond Eleventy — pure HTML/CSS output.

## Adding a documentation article

Every article must exist in both English and Russian. `llms.txt` and `llms-full.txt` are auto-generated from Eleventy collections and require no manual update.

**Checklist:**

1. Create the English article in the appropriate section directory:
   - `src/developers/<slug>.md` — for developers
   - `src/admins/<slug>.md` — for administrators
   - `src/players/<slug>.md` — for players

2. Set the required frontmatter:
   ```markdown
   ---
   title: Article Title
   nav_order: <next integer in the section>
   ---
   ```

3. Create the Russian translation at the same relative path under `src/ru/`:
   - `src/ru/developers/<slug>.md`
   - `src/ru/admins/<slug>.md`
   - `src/ru/players/<slug>.md`

   Use the same `nav_order` as the English version. Translate `title` and all body content.

4. That's it. `llms.txt` and `llms-full.txt` are Eleventy templates that iterate over collections — they regenerate automatically on the next build.

## Site structure

| Path | Purpose |
|---|---|
| `src/index.njk` | English landing page |
| `src/ru/index.njk` | Russian landing page |
| `src/_layouts/base.njk` | Shared HTML shell: nav, language switcher |
| `src/_layouts/docs.njk` | Docs layout: sidebar from collections + article area |
| `src/styles.css` | All styles — no preprocessor |
| `src/llms.njk` | Generates `/llms.txt` (AI index) |
| `src/llms-full.njk` | Generates `/llms-full.txt` (full doc dump for RAG) |
| `src/CNAME` | Custom domain — do not edit |

## Locale system

- English articles use `locale: "en"` (set via directory data files, not per-article frontmatter).
- Russian articles use `locale: "ru"`.
- The layout conditionally renders nav labels, sidebar collections, and `<html lang>` based on `locale`.
- Never hardcode `locale` in individual article frontmatter — it comes from the `*.11tydata.js` file for that directory.

## Running locally

```bash
npm install
npm start   # http://localhost:8080
```
