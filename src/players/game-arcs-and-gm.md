---
title: Game Arcs and GM Tools
nav_order: 8
---

<p class="docs-lead">Game arcs group related episodes into a named story. Each arc can have dedicated Game Masters who get extra tools: a GM posting mode that lets them write narrative posts without a character, and a panel to insert named NPCs directly into those posts.</p>

## What is a game arc

An arc is a container for a set of thematically connected episodes. It has a title, description, cover image, one or more associated factions, a list of Game Masters, and a status: **Pending**, **Active**, **Archived**, or **Finished**.

Arcs can be public (visible to guests) or private (visible to logged-in members only).

Episodes are assigned to an arc when they are created — a new episode form has an optional arc field. There is no way to move an episode to a different arc after creation.

## Browsing arcs

The arc list is filterable by status, faction, and free-text search. Each arc page shows its description, factions, GMs, and the list of episodes that belong to it.

## NPCs

Each arc has its own roster of NPCs — named characters that exist for that story but are not played by any specific member. Each NPC has a name, avatar, and description, and can appear across many episodes within the arc.

You can browse the NPCs attached to an arc from the arc detail page, and click through to an NPC's own page to see which episodes and posts they appear in.

## Game Master posting mode

If you are listed as a GM for an arc, every episode in that arc shows a **GM post** toggle in the reply form. By default it is off — your posts work exactly like any other member's. Switching it on activates GM mode for that post.

### What changes in GM mode

- Your post is not attached to any character. The character profile sidebar, avatar, and signature are hidden.
- The post receives a distinct visual style so readers can immediately recognise it as a narrative/GM post.
- An **NPC panel** appears in the posting toolbar.

### Inserting NPCs

The NPC panel lets you search the arc's NPC roster by name and select one or more NPCs to insert. When you click **Insert**, a BBCode block is placed in your post:

```
[npc-block][npc-header][npc id=5][npc id=12][/npc-header][npc-body][/npc-body][/npc-block]
```

When the post is saved and rendered, each `[npc id=N]` tag is resolved to the NPC's avatar and name, linked to the NPC's profile page. The `[npc-body]` section is where you write the NPC's dialogue or actions.

This block is designed to be recognisable at a glance: readers see the NPC's face and name before the text, making it clear who is speaking.

## Managing arcs and NPCs

Arc creators and GMs can edit the arc's title, description, factions, GM list, image, and status. Admins can edit any arc regardless of whether they are listed as a GM.

NPCs can be added, edited, and removed by anyone who can edit the arc.
