---
title: Free-Format Date Fields
nav_order: 9
---

<p class="docs-lead">Some games use their own fictional calendar instead of real-world dates. When an episode header or character sheet has a free-format date field, the form shows inputs tailored to that game's calendar system, based on which characters are involved.</p>

## What you will see

A free-format date field looks different from a regular date picker. Instead of a calendar widget, you get a set of labelled inputs — one for each part of the in-game date. What those inputs are depends entirely on the game's calendar:

- A fantasy game might show **month** (a dropdown of month names), **day** (a number), and **year**.
- A science-fiction game might show **cycle** and **standard year**.
- A game with multiple eras might ask you to choose the era first, then fill in the relevant fields.

## How formats are loaded

The form uses the characters you have selected for the episode to decide which calendar format to show.

Each faction in the game can be linked to a calendar format. When you add characters to an episode, the platform looks up which factions those characters belong to and loads the matching calendar formats. If the game has a global default calendar, that format also appears.

**If your characters come from different factions with different calendars**, you will see a dropdown to choose which format applies to this particular date. Pick the format that matches the date you are entering. This can happen in multi-faction episodes — for example, if your characters are from both the Dragon Age faction and a faction with a different calendar.

**If the field shows no options**, none of the selected characters belong to a faction with a calendar assigned, and no global default is set. Ask an admin to configure a calendar for your faction.

## Choosing a format variant

Some calendars have more than one way to write a date — different eras, or the same date with and without a day. When this is the case, a second dropdown appears underneath the calendar selector. Choose the variant that best fits the date you are entering.

For example, in the Dragon Age calendar:

- Dates in the **current age** look like `9:41 Dragon, 15 of Drakonis` — you fill in the age number, the year within the age, the age name, the month or holiday, and optionally the day.
- Dates from **before the Ages began** look like `−200 Ancient, Wintermarch` — you fill in only the ancient year and the month or holiday.

You pick the variant first, and the form then shows only the inputs that belong to that variant.

## Filling in the placeholders

Each placeholder in the format is one input:

**Number input** — type a whole number within the allowed range. The form shows the minimum and maximum values allowed. Leave it blank if the placeholder is optional.

**List input** — a dropdown menu with the allowed values. For months, the list includes both regular month names and any special holidays or feast days that occupy a position in the calendar.

**Optional placeholders** — some inputs can be left blank. For example, a day field is often optional if you only know the month of an in-game event. The form will not require you to fill in an optional field.

## How the date is displayed

After saving, the values you filled in are assembled into a formatted string — for example, `9:41 Dragon, 15 of Drakonis (Nubulis)` — and that is what appears in the episode header or on the character sheet. The raw placeholder values are retained internally so the date can be used for sorting.

If you go back to edit the episode or character later, the form will re-load the same values and let you change them.

## Editing a date from a different character combination

If you open an episode that was created with a different set of characters — and those characters belonged to a faction with a different calendar — the date field may show a **custom** indicator. This means the saved date uses a calendar format that does not match any of the currently selected characters' factions.

You can still edit the value: the form switches to "custom" mode and loads all available calendars so you can re-enter the date in whatever format is appropriate. If you save without changing anything, the date stays as-is.
