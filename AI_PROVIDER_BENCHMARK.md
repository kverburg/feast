# Switching the AI provider (Mistral) and a long-running benchmark

Status: proposal, nothing built yet. Decisions that need you are marked **Decide**.

## Where we are

All AI work is three tasks, each a prompt plus a parser in `src/shared/geminiTasks.ts` (and `recipeParserService.ts` for import parsing):

| Task | Input | Output | Model tier |
|---|---|---|---|
| translate | a recipe | NL/EN translation, ingredient and step texts | default |
| annotate | ingredients + steps | ingredient name forms, step quantity references | light |
| parse (import) | page text, pasted text or photo | a structured recipe | default |

The tasks never talk to Gemini directly: they call an injected `generate(body, tier)`. The worker (`worker/gemini.js`, `worker/work.js`) supplies that function, plus the Gemini batch API. So a second provider is a new `generate`, not a rewrite. Two things are Gemini-shaped and need care: the request body (`contents`, `generationConfig`, JSON mode) and the batch API.

## Part 1: making providers swappable

1. **Provider interface.** `generate(task, messages, { tier, json, schema })` returns parsed JSON. Each provider (Gemini, Mistral) maps this to its own request format. The prompt builders return provider-neutral messages instead of Gemini bodies.
2. **Config per task.** Environment variables `AI_PROVIDER_TRANSLATE`, `AI_PROVIDER_ANNOTATE`, `AI_PROVIDER_PARSE` (each `gemini` or `mistral`, plus model name). The default stays Gemini, so nothing changes until we flip a switch. A task can fall back to the other provider on rate limits.
3. **Batch.** Mistral has its own batch API (to be verified against their docs before building). Until the Mistral batch path exists, Mistral tasks run as direct calls in the existing background worker, which already handles backoff.
4. **Errors.** `classifyGeminiError` becomes provider-independent (rate limit, server, bad key, refused request), reusing the 400 handling from PR 22.
5. **Keys.** A `MISTRAL_API_KEY` secret per environment, handled like the Gemini keys (`GEMINI_KEYS.md`).

## Part 2: the benchmark

Goal: answer "is provider/model/prompt X as good as what we run today, and is it getting better or worse over time?" with data, repeatedly, not once.

### Golden set (`bench/golden/`)
- 30 to 50 recipes: the seed recipes, your real recipes, and the ones that failed before (miljuschka, bakingmischief, Cookmate samples). Both languages, with and without sections, with fractions, ranges and "to taste" amounts.
- For import parsing: the raw inputs (HTML text, pasted text, a few photos) next to the expected structured recipe.
- Expected outputs start as the current Gemini output, which you review and correct once. After that they are the reference. Stored in git, so changes to the reference are visible.
- **Decide:** are you fine with recipe text being sent to the providers under test? (It already goes to Gemini.)

### Checks per task
Automatic, no model involved:
- Valid JSON that passes the existing parser.
- Counts preserved: same number of ingredients, sections and steps.
- Numbers preserved: every amount in the source appears in the output.
- Annotation: every quantity reference points at a real ingredient; no invented ingredients.
- Translation: no untranslated source sentences left, units kept.
- Latency, tokens, retries, rate-limit hits.

Judged by a model (translation fluency, faithfulness, naturalness of Dutch cooking language):
- A judge model from a third provider, or at least not the one being scored, compares candidate against reference without knowing which is which.
- A small hand-rated sample each month to check that the judge agrees with you. If it does not, the judge scores are ignored.

### Running it
- `npm run bench -- --task translate --provider mistral --model mistral-small-latest --prompt v2` runs the set and writes `bench/results/<date>-<task>-<provider>-<model>-<prompt>.json` (scores per recipe, plus run metadata: git commit, prompt version, timestamp).
- `npm run bench:report` builds a comparison table (provider x model x prompt, per task) and a trend over time from the stored runs.
- A scheduled GitHub Action runs the current production setup weekly and each challenger monthly, commits the results, and opens an issue if the production score drops. That catches silent model changes behind aliases like `gemini-flash-latest`.
- Prompts are versioned (`prompts/translate.v1.ts`, `v2`, ...). Improving a prompt means adding a version and benchmarking it against the current one on the same set.
- Costs and limits: free tiers limit requests per minute and per day, so a run paces itself and can resume where it stopped.

### Deciding to switch
A challenger replaces the incumbent for a task when, on the golden set, it:
- matches or beats on the automatic checks (no regressions on counts and numbers),
- is within a margin on the judged quality score,
- is not worse on failure rate and latency,
- and has acceptable limits and pricing for your use.

Per task, not all or nothing: for example annotate could move to Mistral while translate stays on Gemini.

## Suggested order

1. Provider interface plus a Mistral `generate`, behind config, default unchanged. No behaviour change.
2. Benchmark skeleton: the golden set for translate only, automatic checks, one report.
3. Add judged quality and the other two tasks.
4. Scheduled runs and trend report.
5. First real comparison (Gemini vs Mistral small and large), then decide per task.
6. Prompt iteration using the same harness.

## Decide before step 1
- Which Mistral models to try first (suggest a small and a large one, as with Gemini's light and default).
- Whether the benchmark may use your real recipes as the golden set (suggest yes, and keep the repo private).
- Where results live: committed in the repo (simple, diffable) or elsewhere. Suggest the repo.
