# AI benchmark

Compares AI providers, models and prompts on the same recipes, over time. Background and plan: `AI_PROVIDER_BENCHMARK.md`.

## Run it
```bash
npm run bench -- --task translate --provider mistral --model mistral-small-latest
npm run bench -- --task annotate --provider gemini --context bench/contexts/v1.md --label v1
```
Options: `--task translate|annotate`, `--provider gemini|mistral`, `--model`, `--context <file>`, `--label`, `--limit N`, `--gap ms` (default 1100, Mistral's free tier is about 1 request per second).
Keys come from `.env.local` (`GEMINI_API_KEY`, `MISTRAL_API_KEY`) or the environment.

## What it scores
Automatic checks only (see `bench/checks.mjs`), cheap and repeatable:
- translate: valid structure, amounts kept exactly, language detected right, steps actually translated, no empty names.
- annotate: valid structure, ingredient name forms complete, step references present, mentions copied verbatim, ids valid.

A recipe's score is the share of checks passed; a run's score is the mean. Latency and tokens are recorded too. A model-judged quality score for translations (fluency, faithfulness) is the next step.

## Where results go
- Always: `.bench-results/<run>.json` (not committed).
- Cloudflare KV, when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set: `bench:run:<id>` and the list `bench:index`. The app shows them in Settings > AI benchmark. The token needs Workers KV Storage edit permission.
- The `AI benchmark` GitHub workflow runs weekly (and by hand) with the `GEMINI_API_KEY_TEST`, `MISTRAL_API_KEY` and Cloudflare secrets.

## Contexts and golden recipes
See `bench/contexts/README.md` and `bench/golden/README.md`.
