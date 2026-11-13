---
title: Custom Templates
nav_order: 3
---

<p class="docs-lead">Cuento lets you override the HTML structure of specific Angular components at build time — without touching the default templates in the repository. This lets each forum have its own visual layout for key pages while staying on the upstream codebase.</p>

## How it works

`npm run build` runs `custom-templates.plugin.mjs` instead of calling `ng build` directly. The plugin reads a site-specific JSON file, temporarily copies each custom file over its default counterpart, runs the Angular build, then restores the originals regardless of build outcome.

**Dev server is not affected** — `npm start` always uses default templates. Custom templates only take effect in a production build.

## Save vs. Publish

Two distinct actions exist in the admin panel:

**Save** stores the template HTML in the database as a named version — it has no effect on the live site and can be done as many times as needed while iterating.

**Publish** does three things atomically: it commits the template file to GitHub as the active `*.custom.component.html`, updates `src/environments/custom_templates.json` to include the component, and that commit to the `release` branch triggers the GitHub Actions CI, which runs `npm run build` and deploys automatically.

Saving is drafting. Publishing is deploying. You can save multiple versions and choose which one to publish at any time. `custom_templates.json` is never edited manually — it is managed entirely by the backend.

## Available components

The following components currently support custom templates. Each custom template is a valid Angular template compiled as part of the existing component class — it can only use the bindings and directives that component declares or imports.

### Header

File: `src/app/components/header/header.custom.component.html`

Overrides the site-wide header. Key bindings: `title()` (site name), `currentUser()`, `authService.isAuthenticated()`, `headerPanelHtml()` (backend-rendered widget panel). Include the `#header-widget-panel` element with `[innerHTML]="headerPanelHtml()"` and the `appRouterLinks` directive so panel widgets continue to function. Available child components: `app-navlinks`, `app-ulinks`, `app-notifications`.

### Category

File: `src/app/components/category/category.custom.component.html`

Overrides the category block on the main forum page. Receives a `category` input with `.name` and `.subforums[]`. Each subforum exposes id, name, description, topic/post counts, unread indicator, and last-post metadata.

### Footer statistics

File: `src/app/components/footer-statistics/footer-statistics.custom.component.html`

Overrides the bottom-of-page stats block. Signals available: `board()` (full board settings and counts), `activeUsers()`, `activeGuests()`, `recentUsers()`, `recentCharacters()`, `recentMode()`. Call `setRecentMode(m)` to switch between user and character recent lists.

### Episode header

File: `src/app/components/episode-header/episode-header.custom.component.html`

Overrides the header area on episode pages. Exposes the `episode` object (name, status, participating characters and masks, content rating), `customFields[]`, and a `getField(machineName)` helper for conditionally rendering individual fields. Guard with `@if (episode != null)`. Available child component: `app-field-display`.

### Character header

File: `src/app/components/character-sheet-header/character-sheet-header.custom.component.html`

Overrides the header on character sheet pages. Exposes the `character` object (name, avatar, status, factions, episode count), `customFields[]`, and `getField(machineName)`. Admin action methods (`acceptCharacter()`, `deactivateCharacter()`, etc.) and the `canSeeAdminBlock()` signal are available for conditionally showing moderation controls. Guard with `@if (character != null)`.

### Wanted character header

File: `src/app/components/wanted-character-header/wanted-character-header.custom.component.html`

Overrides the header on wanted character pages. Exposes `wantedCharacter` (name, status, claim state, factions, relations), `customFields[]`, and `getField(machineName)`. Guard with `@if (wantedCharacter != null)`.

### Wanted character card

File: `src/app/components/wanted-character-card/wanted-character-card.custom.component.html`

Overrides a single card in the wanted character list (card view). Exposes the full `wantedCharacter` object, `expanded` state, `canRevoke`, `isAuthenticated`, `fields[]`, and `getField(machineName)`. Use the `(expand)`, `(collapse)`, `(claim)`, and `(revoke)` outputs to wire up interactive actions.

## Adding a new custom template

To make a component overridable, create a `*.custom.component.html` file alongside its default template and register it in the `frontendComponentDefs` slice in `src/Controllers/frontend_template.go` on the backend. Once registered, the component appears in the admin panel where templates can be written, saved, and published. The backend handles committing the files to GitHub and updating the active component list — no manual JSON editing or build trigger is required.
