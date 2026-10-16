# Background work on the server

Translating a recipe and annotating it (plural names, quantities in steps) keeps going when the app is closed.

## How it works
1. The app marks recipes that wait for work (`translationPending`, or not annotated yet) and, with every save of the
   recipes, sends the worker a short **work list**. The worker stores it as KV metadata of the `state` key.
2. A **cron run every minute** reads only that metadata. If nothing waits it stops at once. If something waits it reads the
   state and sends the requests to Gemini's **batch API** with the server key (`GEMINI_API_KEY`); on later runs it collects the
   answers and stores the results as **patches** in one small KV key, `work` (details below).
   It never writes the recipes themselves, so it cannot collide with something you are editing.
3. The next time the app is open it fetches the patches (`GET /api/work`), applies the ones that still match the recipe
   (same fingerprint: nothing you edited meanwhile is overwritten), logs them in the activity log ("done by the server")
   and acknowledges them (`POST /api/work/ack`). While work waits, the app checks every 30 seconds.

Without a server key (local `npm run dev`, or only a key typed into Settings) the app does the work itself, as before.

## Live or batch
- **Live:** a recipe you just **imported** (URL, pasted text, photo) or **re-parsed with AI** is translated and then annotated right away with
  direct Gemini calls, on the server, so it is done within about a minute. These show up in the work list with a capital letter (`T|`, `A|`)
  and carry `liveWork` on the recipe until the annotation is applied.
- **Batch:** everything else (recipes that were already there, the Cookmate XML import with its hundreds of recipes, recipes edited later) goes
  through the batch API below.
- A run handles live work first; if a live call is rate limited, the batch part waits for the same backoff.

## Gemini batch API (for the backlog)
The backlog is not urgent, so it uses the batch API: asynchronous, half the price and with limits of its own, separate from the
interactive calls that were running into rate limits.
- All waiting recipes go into **one batch job** (translation: 1 request per recipe, annotation: 1 per language version). Answers usually
  come within minutes and at the latest after a day. Each cron run polls the job (no writes while it is still running), and when it has
  succeeded the answers are checked and become patches. At most 3 jobs are in flight; a recipe is never in two of them.
- **Free-tier keys:** per Google's pricing page the free tier may batch only the **Flash-Lite** models, so batch jobs use the newest
  Flash-Lite model that lists `batchGenerateContent` (found with the models list, remembered afterwards; `GEMINI_MODEL_BATCH` forces one).
  That includes translation, which used the main Flash model for direct calls.
- **Fallback to direct calls:** if no model accepts a batch (key without access) the worker uses direct calls for 12 hours and says so
  (`GEMINI_BATCH = "off"` does the same permanently). Rate limits when submitting back off like before and do not switch batch off.
- A request that comes back as an error is sent again in a later batch (3 attempts, then it is logged as failed). A batch that fails or
  expires is sent again after a wait. Results for a recipe you edited in the meantime are dropped.

## What the server does when things go wrong
| Situation | Behaviour |
| --- | --- |
| Gemini rate limit or outage (429, 5xx) | waits 1, 2, 4 ... up to 15 minutes; the activity page shows "Waiting" with the reason (batch submit or direct call alike) |
| Key missing or rejected (400/401/403) | stops, looks again after 30 minutes; the app shows the error banner |
| Unusable answer | tries again; after 3 attempts it gives up on that recipe (logged as failed) |
| Recipe edited in the meantime | the result is dropped; the app reports the recipe again |

## Free plan budget (Workers free: 10 ms CPU per run, 1000 KV writes and 1000 KV list calls a day)
- The cron never calls `list` (only 1000 a day allowed, the cron runs 1440 times); it uses `getWithMetadata` on the state key.
- Idle cron run: one KV read. With batches: submitting a job is one state read and one write; polling a running job costs no write; collecting its answers is one write for all recipes together. (Direct calls: one write per finished recipe.)
- Waiting on Gemini is not CPU time. Nothing is parsed here except JSON; imports (HTML parsing) stay in the app for that reason.

## Where it lives
- `worker/work.js`: the work (cron, patches, backoff). `worker/index.js`: `/api/work`, `/api/work/ack`, cron handler, work list metadata on state saves.
- `src/shared/`: the Gemini tasks, the "needs work / still the same recipe" rules and how results are applied: the same code runs in the app and the worker.
- `src/services/translationService.ts`: chooses server mode or local mode, applies patches. `src/services/serverWork.ts`: the API calls.

## Previews and local testing
- Preview versions have **no cron** (only the deployed version runs it). While the app is open, polling moves the work along instead (`PUMP_ON_POLL` in `wrangler.preview.toml`).
- Run the worker locally: copy `.dev.vars.example` to `.dev.vars`, `npm run dev:worker`, and trigger a cron run with
  `curl "localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"`.
- Log events to look for in Workers Logs: `batch_submitted`, `batch_submit_failed`, `batch_unavailable`, `batch_failed`, `batch_poll_failed`, `work_done`, `work_waiting`, `work_stopped`, `work_bad_output`, `cron_work`.

## Not covered
- Imports (fetching and parsing a page) and photo OCR still run in the app: they are CPU heavy and OCR only exists in the browser.
  Once an import has finished, its translation and annotation do run on the server.
- The Gemini key typed into Settings is only used by the app itself, never by the server.

## Photo imports

A photo import is read by the worker, so it keeps going when the app is closed:

1. The app uploads the (already shrunk) photo to `/api/image` and registers it with `POST /api/work/import {id, imageUrl, fileName}`. The worker stores it in the work document (`imports`), no extra KV key.
2. The cron (or the request itself) reads the photo from KV, asks the AI with direct calls (imports are live work, handled before translations), and leaves the recipe as a patch of kind `p`. Busy or rate limited: it waits and tries again; a refused request is retried 3 times, then given up with the reason.
3. The app collects the patch (it polls every 8 seconds while imports wait, also after a reload), saves the recipe as `imp-<job id>` (so two devices do not both add it), logs it in the activity log and starts its translation.

Without a server (local dev), or when the upload fails, the app reads the photo itself as before (the import job then only lives while the page is open).
