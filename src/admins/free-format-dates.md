---
title: Free-Format Dates
nav_order: 8
---

<p class="docs-lead">Free-format dates let you define a fictional calendar system for your game world. Instead of a real calendar, players fill in named placeholders — year, month, day, age name, era, whatever the setting needs — and the platform assembles a formatted date string from their input.</p>

## Why use a free-format date

Standard date fields follow the real-world calendar. If your game is set in Thedas, the Forgotten Realms, or Westeros, those dates mean nothing. A free-format date field lets you define the structure of the in-game calendar once; after that, players fill in the right values and the platform formats and stores the date correctly, including sorting.

A free-format date field can be attached to episode headers, character sheets, character profiles, or wanted character listings through **Admin → Templates**.

## Creating a calendar

Go to **Admin → Calendars** and click **New calendar**. Give it a recognizable name (players will see this name when choosing which format to use).

A calendar has two parts: **time units** (the placeholders) and **format strings** (how they are assembled into a readable date).

## Time units

Each time unit becomes an input field when a player fills in the date. There are two types:

**Number** — the player enters an integer. Set a minimum and maximum value to define the allowed range. Negative values are allowed; set the minimum below zero for eras that go backwards (e.g. a year counter that descends toward the present). Enable **Hide negative sign** if users should enter a positive number but the value is internally stored as negative — this is useful for "before conquest" years where the user types `100` but the system records `-100`.

**List** — the player picks from a fixed dropdown of options you define. Add one entry per line. Use this for month names, age names, era names, or any value that is not a free number.

Both types can be marked **optional** (nullable). Optional placeholders may be left blank by the player — use this when a date sometimes includes a day and sometimes only a month.

## Format strings

A format string is a template that combines your time units into a human-readable date. Write literal text and insert placeholder tags by clicking the unit buttons below the input (or type `{unit_name}` directly).

For example, with units named `year`, `month`, and `day`, a format string might be:

```
{month} {day}, {year}
```

Which would produce: `March 15, 870`.

Every non-optional time unit must appear in every format string. Optional units can be omitted from some variants.

### Multiple format strings: the Dragon Age example

You can add more than one format string to a calendar. This matters when a setting has more than one way to express a date — different eras, different levels of precision, or genuinely different calendar systems within the same game world.

The Dragon Age calendar in a live game on the platform has six time units and four format strings, because Thedas uses two separate dating systems:

**Ancient years** — dates before the Ages began are expressed as a single descending number, like *-200 Ancient*. These dates use the `ancient_year` placeholder (a number from -9999 to -1).

**Age:Year dates** — the current calendar counts years within named Ages. The 9th Age is the Dragon Age; year 41 of that age is written *9:41 Dragon*. This requires three separate units: `age_number` (1–9), `year` (0–99), and `age_name` (a list: Divine, Glory, Towers, Black, Exalted, Steel, Storm, Blessed, Dragon).

Because these two eras are structurally incompatible, the calendar defines four format strings — two for each era, one with a day and one without (since not every date in a story needs day precision):

| Format string | Example output |
|---|---|
| `{ancient_year} Ancient, {day} of {month_and_holidays}` | `-200 Ancient, 15 of Wintermarch (Verimensis)` |
| `{ancient_year} Ancient, {month_and_holidays}` | `-200 Ancient, Wintermarch (Verimensis)` |
| `{age_number}:{year} {age_name}, {day} of {month_and_holidays}` | `9:41 Dragon, 15 of Drakonis (Nubulis)` |
| `{age_number}:{year} {age_name}, {month_and_holidays}` | `9:41 Dragon, Drakonis (Nubulis)` |

Notice that `month_and_holidays` is a single list that contains both the regular months and the special holidays (Wintersend, Summerday, Satinalia, etc.) — because in the Dragon Age calendar, holidays and months occupy the same position in the year and are not distinguished structurally.

When a player fills in a date using this calendar, they first pick which format string applies to the date they are entering, then fill in only the placeholders that appear in that string.

## Connecting a calendar to a faction

Each faction can be assigned one calendar format. Go to **Admin → Factions**, open a faction, and set the **Calendar** field. Multiple factions can share the same calendar — Mass Effect and a modern-day human faction could both use the Gregorian Calendar, for instance.

When a player opens an episode header form with a free-format date field, the platform looks up the factions of all characters selected for that episode and loads their calendars automatically. If two characters come from factions with different calendars, both formats appear and the player picks which one to use for that specific date.

## Setting a global default

If your game has a "default" calendar that applies to characters who are not in any faction with an assigned format — or if you want one calendar always available regardless of which characters are selected — go to **Admin → Settings** and set the **Global calendar**.

The global calendar is added to the available options alongside any faction-specific calendars. If no global default is set and none of the selected characters' factions have a calendar assigned, the free-format date field will be empty and uneditable.

## Sorting

Dates stored in a free-format field are sortable. The platform encodes the placeholder values into a sortable integer (BIGINT) so that episode lists can be ordered chronologically by in-game date, even when the calendar system has no correspondence to real-world time.

The sort is based on the values of the placeholders in position order. This means the placeholder marked as position 0 is the most significant (like a year), and later positions are less significant. Set up your time units accordingly if chronological sorting matters for your game.
