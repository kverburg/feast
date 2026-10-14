# Gemini keys and models

One key per environment, each from its own secret store. The app never holds a key itself: it calls
`/api/gemini/*`, and whoever serves that route adds the key.

| Environment | Key lives in | Set it with |
| --- | --- | --- |
| **Production** (`feast.kmverburg.nl`) | Worker secret `GEMINI_API_KEY` | `npx wrangler secret put GEMINI_API_KEY` (paste the prod key at the prompt) |
| **Test** (PR previews) | GitHub Actions secret `GEMINI_API_KEY_TEST` | repo > Settings > Secrets and variables > Actions. The preview job uploads it with that preview version only (`--secrets-file`), so production keeps its own. |
| **Dev** (`npm run dev`) | `.env.local` (git-ignored) | copy `.env.example` to `.env.local` and fill in `GEMINI_API_KEY` |

Notes
- Free-tier limits are counted per Google project (and per model): give each environment its own project.
  Put the key with the most headroom on production.
- **Leave the key field in Settings empty.** A key typed there overrides the server key and is stored,
  synced and shown in plain text. It is only meant as a fallback.
- If `GEMINI_API_KEY_TEST` is not set, previews use the production secret (the CI log says so).
- Rotating a key: change the secret in its store, nothing in the code.
- Check what is set (names only): `npx wrangler secret list --name feast`.
- Never put a key in a file that is committed, in a `VITE_` variable (those are bundled into the app) or in chat.

## Models
`worker/gemini.js` (shared by the worker and the dev server) picks the model:

| Task | Model | Variable (in `wrangler.toml`, `[vars]`) |
| --- | --- | --- |
| Translation, parsing a recipe from text or a photo | `gemini-flash-latest` | `GEMINI_MODEL` |
| Annotation (plural names, step quantities) | `gemini-flash-lite-latest` | `GEMINI_MODEL_LIGHT` |

Limits are counted per model, so the lighter model also spreads the load. Safety nets: a missing model
name (404) falls back to the default model; if the light model gives an unusable answer for a recipe,
the retry for that recipe uses the default model. The activity log shows which one was used
("Gemini (light model)" or "Gemini").
