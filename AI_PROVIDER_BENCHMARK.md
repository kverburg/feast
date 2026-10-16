# Switching the AI provider (Mistral) and a long-running benchmark

The plan and what is left. How to use what exists: `AI_PROVIDERS.md` (providers) and `BENCHMARK.md` (running the benchmark).

## Status

| Step | What | State |
|---|---|---|
| 1 | Provider switch: Mistral next to Gemini, per tier, by configuration | Done (PR 27) |
| 2 | Benchmark runner, automatic checks, results in Cloudflare KV, Settings > AI benchmark page, weekly workflow | Done (PR 28) |
| 3 | Model-judged translation quality; import parsing as a third task; your own golden recipes | Open |
| 4 | Prompt context: instructions, glossary, worked examples, tested as prompt versions | Open (hook exists: `--context`) |
| 5 | First real comparison Gemini vs Mistral, then a per-task decision | Open |
| 6 | Use a winning context or provider in production | Open |

## How it fits together

The tasks (translate, annotate, import parsing) build provider-neutral prompts in `src/shared/geminiTasks.ts`. `worker/providers.js` sends them to Gemini or Mistral and returns Gemini-shaped answers, so the parsers do not care. `AI_PROVIDER` and `AI_PROVIDER_LIGHT` choose the provider per tier; Gemini stays the default.

The benchmark (`bench/run.mjs`) runs a task over the golden recipes with a chosen provider, model and optional context file, scores it with automatic checks (`bench/checks.mjs`) and stores the run in Cloudflare KV (`bench:index`, `bench:run:<id>`). The app reads them in Settings > AI benchmark. A weekly GitHub workflow runs the current setups on the test keys, so silent model changes behind aliases like `gemini-flash-latest` show up as a drop in the trend. The golden set and the context files stay in git; only the results live in Cloudflare.

## What is left

### Step 3: judged quality and a bigger golden set
- A judge model scores translation fluency and faithfulness against the source, without knowing which provider made the candidate. Use a provider that is not the one being scored. Check it against a small hand-rated sample every month; if it disagrees with you, ignore its scores.
- Import parsing as a third task: raw inputs (page text, pasted text, a few photos) with a checklist of what must be extracted (ingredient count, amounts, steps). Include the imports that failed before (miljuschka, bakingmischief).
- Your own recipes in `bench/golden/` (export from Settings). Today the set is only the three seed recipes in both directions, which is small: scores will be noisy until it grows to 30 to 50 recipes with sections, fractions, ranges and "to taste" amounts.

### Step 4: context for better calls
Candidates, each a context file under `bench/contexts/` and therefore a named prompt version:
- Few-shot examples: two or three corrected recipes as worked examples. Usually the biggest gain for structured tasks.
- Glossary and style guide: fixed terms ("bloem" is flour), preferred Dutch cooking words, unit conventions, keep brand names.
- Rules from past failures: one line per mistake, kept only if the benchmark shows it helps without hurting other recipes.
- Better inputs for import: the page's structured recipe data (schema.org JSON-LD) or cleaned page text.
Strict JSON schemas for the output are worth trying per provider.

### Step 5: deciding to switch
A challenger replaces the incumbent for a task when, on the golden set, it:
- matches or beats on the automatic checks (no regressions on counts and numbers),
- is within a margin on the judged quality score,
- is not worse on failure rate and latency,
- and has acceptable limits and pricing for your use.

Per task, not all or nothing: annotate could move to Mistral while translate stays on Gemini. Mistral's free tier is for evaluation and prototyping (about 1 request per second), so a production move means a paid plan.

### Step 6: production use
A winning context file needs a way into production calls (bundled with the worker, or stored in KV), and a provider switch is the `AI_PROVIDER` settings. Not built until a comparison shows a reason.

## Decisions still open
- Which Mistral models to compare first (suggest a small and a large one, as with Gemini's light and default).
- Whether the benchmark may use your real recipes as the golden set (suggest yes, and keep the repo private).
