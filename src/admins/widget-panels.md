---
title: Widget Panels and Widgets
nav_order: 10
---

<p class="docs-lead">Widget panels are configurable content areas that appear in the forum header and footer. Each panel is a BBCode document — not HTML — that can contain text, formatting, images, and embedded widgets.</p>

## Widget panels

Panels are identified by a fixed key. Two panels exist by default: `header` and `footer`. Edit them at **Admin → Widget Panels**.

Panel content is written in **BBCode**, the same syntax used for posts. Standard formatting tags work as expected. To embed a widget inside a panel, use:

```
[widget=N]
```

where `N` is the widget's numeric ID. The backend parses the BBCode, then substitutes each `[widget=N]` tag with the rendered widget output.

A **Preview** button renders the panel without saving, so you can check how it looks before publishing.

---

## Widgets

Widgets are reusable content blocks created at **Admin → Widgets**. Each widget has a name, a type, and type-specific configuration. After creating a widget, embed it in any panel with `[widget=N]`.

---

## Widget types

### Last post

Displays the most recent post from a specific topic, rendered as HTML. Useful for a pinned announcement, a rules summary, or any content that is managed as a topic post but should appear on every page.

- **Topic** — the topic to pull the latest post from.

---

### Random entities

Displays a randomly selected set of characters or wanted characters, optionally showing custom fields alongside each one. The set can rotate automatically on a timer, cycling through new random picks without a page reload.

**Configuration:**

| Field | Purpose |
|---|---|
| **Entity type** | `character` or `wanted_character` |
| **Count** | How many entities to show at once |
| **Rotation interval** | Time in milliseconds between rotations. Set to `0` to disable rotation |
| **Field 1 / Field 2** | Machine name of a custom field to display for each entity (optional) |
| **Width / Height** | Display dimensions in pixels for each image field |
| **Filters** | Optionally restrict to a specific character status, or to unclaimed wanted characters only |

Each displayed entity links to its character profile or wanted character topic.

#### Image fields and thumbnail generation

When you select an image custom field, the **Width** and **Height** values control how the image is presented.

What happens depends on the field's render type and whether the image proxy is configured:

**Plain image field** (`image` render type): width and height are passed to the frontend as display dimensions only. The original image URL is used as-is — no resizing is performed server-side.

**Cropped image field** (`cropped_image` render type) with the image proxy enabled (the `use_image_uploading` setting is `y`): the backend generates an exact crop at the specified dimensions:
1. Checks a cache for a previously generated crop at that URL + size
2. Fetches the original image
3. Crops and resizes to exactly width × height using center-anchored Lanczos resampling
4. Encodes as JPEG at quality 85
5. Uploads to the configured image host and caches the result

Subsequent requests for the same image at the same dimensions are served from cache without re-processing.

If the image proxy is not enabled, the original URL is returned as-is even for `cropped_image` fields.

The width and height you set here determine the exact pixel dimensions of the cropped output — set them to match the layout slot the widget occupies to avoid blurry upscaling or wasted bandwidth from oversized images.

---

## Tips

- A widget can be reused across multiple panels — embed the same `[widget=N]` in both the header and footer if needed.
- Widget names are only visible in the admin panel; they do not appear on the frontend.
- Hiding a panel (`is_hidden = true`) removes it from public view without deleting its content or the widgets it references.
