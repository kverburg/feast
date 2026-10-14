# Background work on the server

Translating a recipe and annotating it (plural names, quantities in steps) keeps going when the app is closed.

## How it works
1. The app marks recipes that wait for work (`translationPending`, or not annotated yet) and, with every save of the
   recipes, sends the worker a short **work list**. The worker stores it as KV metadata of the `state` key.
2. A **cron run every minute** reads only that metadata. If nothing waits it stops at once. If something waits it reads the
   state, calls Gemini with the server key (`GEMINI_API_KEY`) and stores the results as **patches** in one small KV key, `work`.
   It never writes the recipes themselves, so it cannot collide with something you are editing.
3. The next time the app is open it fetches the patches (`GET /api/work`), applies the ones that still match the recipe
   (same fingerprint: nothing you edited meanwhile is overwritten), logs them in the activity log ("done by the server")
   and acknowledges them (`POST /api/work/ack`). While work waits, the app checks every 30 seconds.

Without a server key (local `npm run dev`, or only a key typed into Settings) the app does the work itself, as before.

## What the server does when things go wrong
| Situation | Behaviour |
| --- | --- |
| Gemini rate limit or outage (429, 5xx) | waits 1, 2, 4 ... up to 15 minutes; the activity page shows "Waiting" with the reason |
| Key missing or rejected (400/401/403) | stops, looks again after 30 minutes; the app shows the error banner |
| Unusable answer | tries again; after 3 attempts it gives up on that recipe (logged as failed) |
| Recipe edited in the meantime | the result is dropped; the app reports the recipe again |

## Free plan budget (Workers free: 10 ms CPU per run, 1000 KV writes and 1000 KV list calls a day)
- The cron never calls `list` (only 1000 a day allowed, the cron runs 1440 times); it uses `getWithMetadata` on the state key.
- Idle cron run: one KV read. A run with work: one state read (a few ms to parse) and **one write per finished recipe** plus one per rate-limit event.
- Waiting on Gemini is not CPU time. Nothing is parsed here except JSON; imports (HTML parsing) stay in the app for that reason.

## Where it lives
- `worker/work.js`: the work (cron, patches, backoff). `worker/index.js`: `/api/work`, `/api/work/ack`, cron handler, work list metadata on state saves.
- `src/shared/`: the Gemini tasks, the "needs work / still the same recipe" rules and how results are applied: the same code runs in the app and the worker.
- `src/services/translationService.ts`: chooses server mode or local mode, applies patches. `src/services/serverWork.ts`: the API calls.

## Previews and local testing
- Preview versions have **no cron** (only the deployed version runs it). While the app is open, polling moves the work along instead (`PUMP_ON_POLL` in `wrangler.preview.toml`).
- Run the worker locally: copy `.dev.vars.example` to `.dev.vars`, `npm run dev:worker`, and trigger a cron run with
  `curl "localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"`.
- Log events to look for in Workers Logs: `work_done`, `work_waiting`, `work_stopped`, `work_bad_output`, `cron_work`.

## Not covered
- Imports (fetching and parsing a page) and photo OCR still run in the app: they are CPU heavy and OCR only exists in the browser.
  Once an import has finished, its translation and annotation do run on the server.
- The Gemini key typed into Settings is only used by the app itself, never by the server.
