# AI providers

The AI work (translate, annotate, import parsing) runs on Gemini by default. Mistral can take over, per tier, by configuration only.

| Setting | Meaning | Default |
|---|---|---|
| `AI_PROVIDER` | Provider for the default tier (translate, import parsing): `gemini` or `mistral` | `gemini` |
| `AI_PROVIDER_LIGHT` | Provider for the light tier (annotation). Falls back to `AI_PROVIDER` | same as `AI_PROVIDER` |
| `MISTRAL_API_KEY` | Secret. Set it as a GitHub secret of the same name; the production deploy uploads it | none |
| `MISTRAL_API_KEY_TEST` | GitHub secret only: used by PR previews (as `MISTRAL_API_KEY` there) and the benchmark | none |
| `MISTRAL_MODEL`, `MISTRAL_MODEL_LIGHT` | Model names | `mistral-small-latest` |

Set the first two as `[vars]` in `wrangler.toml` (or in `.env.local` / `.dev.vars` locally). Without them nothing changes.

How it works: the tasks keep building Gemini-shaped requests; `worker/providers.js` translates them for Mistral and turns the answer back into Gemini's shape, so the parsers are untouched. Text, images (photo import), a system instruction, temperature, max tokens and JSON mode are carried over.

Limits to know:
- Batch (cheaper, roomier limits) is Gemini only. While either tier runs on Mistral, background work uses direct calls with the usual pacing and backoff.
- The app's own "typed key" fallback (a key saved in Settings) is Gemini only.
- Mistral's free tier is for evaluation and prototyping, about 1 request per second.

Tests: `npm test` (the adapter and routing).
