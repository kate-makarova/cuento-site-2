---
title: Currency
nav_order: 11
---

<p class="docs-lead">Cuento includes an optional currency system that rewards players automatically for activity and lets them spend earned currency on forum benefits. When enabled, it also activates the public <strong>Store</strong> page where players can see how to earn and what to spend.</p>

## Enabling the feature

Currency is an opt-in feature. Toggle it at **Admin → Features → Currency**. When disabled, the Store page and transaction history show a "feature not enabled" notice, and no income events are processed. Enabling it at any point starts income accrual from that moment forward.

---

## Basic settings

Configure the currency's appearance at **Admin → Features → Currency**:

- **Currency name** — the display name shown throughout the forum (for example, *Feathers* or *Gold*)
- **Currency icon** — URL of the icon image shown next to balances

---

## Income types

Income is credited automatically when players take specific actions. Each income type can be toggled on or off and its amount adjusted independently.

| Event | When it triggers |
|---|---|
| Scene post | Each time a player writes a post in a scene topic |
| Character approved | When a character application is approved |
| Wanted character created | When a wanted character listing is published |
| 100th scene post | One-time milestone: player's 100th scene post |
| 500th scene post | One-time milestone |
| 1 000th scene post | One-time milestone |
| 100th general post | One-time milestone: player's 100th post in general topics |
| 500th general post | One-time milestone |
| 1 000th general post | One-time milestone |

**Milestone note:** if a player crosses multiple thresholds at once (for example, jumping from 90 to 110 posts in a single update), only the highest applicable milestone reward is granted.

Admins can also add manual transactions — credits or deductions — from any user's transaction history page, with an optional note.

---

## Spend types

Spending is always a manual player action. The only built-in spend type is:

- **Auto-archiving immunity** — purchased from a character's profile page; protects that character from auto-archiving for a configurable period

The amount for each spend type is set here. Additional spend types may be added by the platform in future releases.

---

## The Store page

Enabling currency activates the public `/shop` page. It is an informational reference showing players:

1. **Income types** — what activities earn currency and how much each pays
2. **Spend types** — what can be purchased and at what cost

The Store page does not handle purchases directly; spending happens contextually (for example, on the character's profile page).

---

## Currency balance

Each user has a single currency balance tied to their account, not to individual characters. The balance is visible in the user's profile and in the navigation bar when the feature is active.
