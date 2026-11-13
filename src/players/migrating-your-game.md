---
title: Migrating Your Game
nav_order: 3
---

<p class="docs-lead">The migration tool lets you import an existing game episode from another platform into Cuento. MyBB-based forums are currently supported. It copies the original posts, lets you map old nicknames to characters on your forum, and publishes the thread as a new episode — preserving authorship, order, and content.</p>

The migration section is linked from your user profile next to account settings. Any member of the target episode can run a migration. The process takes a few minutes and requires no technical knowledge.

## Step 1 — Prepare the episode on your forum

Before starting, create an episode in Cuento and add all the characters who wrote posts in the original thread. **If even one participating character is missing, the migration cannot complete** — add them to the episode first, then come back.

## Step 2 — Fill in the migration form

Go to **Create data migration**. Fill in four fields:

| Field | What to enter |
|---|---|
| **Platform** | Only MyBB is currently supported; leave as-is |
| **Forum domain** | The source forum's domain without `http://` and without a trailing slash (e.g. `dune.rusff.me`) |
| **Topic ID** | Open the original thread and find `?id=57` or `topic=57` in the URL — enter that number |
| **Post count** | The total number of posts in the original thread. The module will correct the value if you are off by one |

Click **Generate migration link(s)**.

![](https://i.ibb.co/SXjWbt8R/upload.png)

## Step 3 — Open the extraction links

After submitting the form you will land on the migration details page. It shows the status (**Pending**), the domain and topic ID you entered, the original thread title, and an **Extraction links** section with one or more clickable links.

Open each link in a new browser tab. The page will show raw JSON — that is the post data exported from the source forum.

![](https://i.ibb.co/ZzRCdLbn/upload.png)

## Step 4 — Copy and paste the extracted data

On the extraction page, press **Ctrl + A** to select all the text, then **Ctrl + C** to copy it.

Return to the migration page and paste the content into the **Process data** field. If the original thread spanned multiple pages and you received multiple extraction links, process them one at a time: paste the first page, click **Process**, wait for the result, then repeat for each subsequent link.

![](https://i.ibb.co/1fVH0BZw/upload.png)

## Step 5 — Map users to characters and publish

After processing completes you will see:

- **Processing results** — the number of posts found, duplicates skipped, and whether all posts were parsed successfully.
- **User mapping table** — the left column shows nicknames from the original forum. Use the **Find a character…** field in the right column to pick the matching character on your Cuento forum. Fill in every row.

The **Save mapping** button stays disabled until every user has a character assigned.

Once the mapping is saved, a **Publish** section appears at the bottom of the page. Choose the destination episode and click **Publish** — the posts will be created in their original order.

![](https://i.ibb.co/Y4zxqBTX/upload.png)

## Notes

- If you discover a character is missing from the episode mid-migration, add them to the forum and return to finish the mapping.
- The post count may differ by one — the module automatically detects the difference between counting and not counting the opening post.
- For threads that span multiple pages, you receive one extraction link per page. Process them in order before publishing.
- After publishing, the migration status changes to **Published** and cannot be re-run for the same record.
