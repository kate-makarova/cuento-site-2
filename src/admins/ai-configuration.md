---
title: AI Configuration
nav_order: 5
---

<p class="docs-lead">Cuento's AI layer covers three things: a lore chat assistant that searches your forum's own content, a weekly game digest that auto-summarises episode posts, and an in-editor proofreader. All three share the same configurable model pool — you point Cuento at any provider once and everything uses it.</p>

## What the AI actually does

### Lore chat

Players open the AI chat and ask questions about the game world. The AI runs a multi-step RAG pipeline: it identifies factions and characters mentioned in the question, searches your forum's posts, lore topics, and character sheets via Qdrant (semantic) and Sonic (keyword), and responds with cited sources. It never makes up information — if something isn't in your forum, it says so.

The AI is faction-aware: if a question is about a specific faction, it filters search results to characters and episodes belonging to that faction before answering.

### Weekly game digest

When the game digest feature is enabled, Cuento automatically summarises episode posts. After every new post in an episode thread, the AI reads the post and generates a short summary stored internally. If the post refers to a character or concept the AI doesn't recognise, it sends a clarifying question to the post's author through the AI chat — the author answers, and the AI incorporates the answer before the weekly digest is generated.

At the configured interval, the AI assembles all episode summaries into a full digest post and publishes it under a designated bot account.

### Post proofreading

In the post editor, players can run their text through the proofreader. It fixes spelling, grammar, and punctuation — no rephrasing, no style changes. The result shows the corrected text alongside a collapsible list of what was changed. The player chooses whether to apply the corrections.

### Prompt injection guard

All text that enters the AI pipeline passes through an automatic injection guard. This cannot be disabled — it protects the AI from instructions embedded in user-generated content.

---

## Configuring the model pool

The AI pool is managed at **Admin → AI**. There are two modes: OpenRouter and DB pool.

### OpenRouter (recommended for most forums)

[OpenRouter](https://openrouter.ai) is an aggregator that gives you access to hundreds of models — including free-tier ones — through a single API key. Cuento fetches the live model catalogue from OpenRouter at runtime and automatically picks the cheapest model that supports tool use and meets the minimum size requirement for each task.

**Setup:**

1. Create an account at [openrouter.ai](https://openrouter.ai) and generate an API key.
2. In the admin panel, go to **Admin → AI → Pool settings**.
3. Set the source to **OpenRouter**, paste your API key, and save.
4. Optionally enable **Free only** to restrict the pool to models with no per-token cost.

That's it. No model list to maintain — Cuento picks what to use automatically.

**How OpenRouter handles tool use:** Cuento filters out models that do not declare `tools` in their supported parameters, and filters out the `recursive/` provider family (their models output XML-only tool calls with no prose). Everything else in the catalogue is eligible.

---

### DB pool (Groq, OpenAI, Anthropic, Gemini, or any self-hosted endpoint)

The DB pool lets you manage individual models directly. Use this if you want explicit control over which models run, or if you are using a provider that is not OpenRouter.

**Setup:**

1. In **Admin → AI → Pool settings**, set the source to **DB** and save.
2. Go to **Admin → AI → Models** and add one or more models.

Each model entry has:

| Field | Description |
|---|---|
| Name | Display name |
| Machine name | The model identifier passed to the API (e.g. `llama-3.3-70b-versatile`) |
| API address | Base URL of the endpoint (e.g. `https://api.groq.com/openai/v1`) |
| API key | Your key for this endpoint |
| Protocol type | `OpenAI-compatible`, `Anthropic`, or `Gemini` |
| Size | 1 (small/fast) to 4 (large/capable) — see below |
| Active | Must be enabled for the model to be used |

Cuento picks the cheapest active model that meets the minimum size requirement for each task. If a model returns a rate-limit error, it automatically retries with a different model from the pool — no manual intervention needed.

**Setting up Groq:**

Groq offers fast inference with a generous free tier. To add a Groq model:

- **API address:** `https://api.groq.com/openai/v1`
- **Protocol type:** OpenAI-compatible
- **Machine name:** any model from [console.groq.com/docs/models](https://console.groq.com/docs/models), e.g. `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`

Add at least two models at different sizes so the retry logic has something to fall back to.

---

### Model sizes

The size field controls which tasks a model is eligible for:

| Size | Used for |
|---|---|
| 1 — Small | RAG chat, most routine tasks |
| 2 — Medium | Game digest post summaries |
| 3 — Large | Proofreading, injection checks |
| 4 — Extra large | Reserved for future high-complexity tasks |

Add at least one model at size 1 and one at size 3 to cover all features.

---

## Configuring the game digest

The game digest is an optional feature that must be enabled before use.

1. Go to **Admin → Features** and enable **Game Digest**.
2. Go to **Admin → Features → Game Digest → Settings** and configure:

| Setting | Description |
|---|---|
| Publish user | The forum account the bot posts digests under. Create a dedicated bot account for this. |
| Summary language | The language for AI-generated summaries. Leave blank to match post language. |
| Model minimum size | The minimum model size (1–4) used for summarisation. Size 2 is a reasonable default. |
| Excluded subforums | Comma-separated subforum IDs to skip during summarisation. |

The digest runs automatically on a schedule. You can review per-post summaries and answer pending AI questions in **Admin → Features → Game Digest → Weekly**.
