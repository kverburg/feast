// Background work on the server: translating recipes and annotating them (plural names, step quantities).
// It keeps going when no one has the app open.
//
// How it fits the Workers free plan (10 ms CPU per run, 1000 KV writes a day):
//  - The app tells the worker what is waiting: with every state save it sends a short work list, which the
//    worker stores as metadata of the 'state' key. A cron run reads only that metadata (no parsing of
//    the state) and stops at once when nothing waits.
//  - Only when there is work does it read the state, run the Gemini calls (waiting on Google is not CPU time)
//    and write ONE small key, 'work', with the results ("patches"). It never writes the recipes themselves,
//    so it cannot collide with what you are editing.
//  - The app fetches the patches the next time it is open, applies the ones that still match the recipe
//    (same fingerprint), and acknowledges them.
import {
  translateRecipe,
  annotateVersion,
  buildTranslationRequest,
  parseTranslation,
  buildAnnotationRequest,
  parseAnnotation,
  readJson,
} from '../src/shared/geminiTasks.ts';
import { classifyGeminiError, GeminiHttpError } from '../src/shared/geminiErrors.ts';
import { contentHash, annotationSource, isUntouchedPending, needsAnnotation } from '../src/shared/recipeWork.ts';
import { generateContent, batchModelCandidates, submitBatch, getBatch } from './gemini.js';

const GAP_BETWEEN_CALLS_MS = 6000; // stay under free-tier requests per minute (WORK_GAP_MS overrides it in tests)
const FIRST_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 15 * 60_000;
const STOPPED_RETRY_MS = 30 * 60_000; // key missing or rejected: look again later
const MAX_BAD_OUTPUT_ATTEMPTS = 3;
const MAX_PATCHES = 60;
const PATCH_MAX_AGE_MS = 14 * 86400000;
const METADATA_LIMIT = 1000; // KV allows 1024 bytes

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const emptyWork = () => ({ patches: [], attempts: {}, batches: [], batchModel: '', batchOff: null, status: { state: 'idle', note: '', nextAt: 0, failures: 0, updatedAt: 0 } });

export async function readWork(env) {
  try {
    const raw = await env.FEAST.get('work');
    return raw ? { ...emptyWork(), ...JSON.parse(raw) } : emptyWork();
  } catch {
    return emptyWork();
  }
}

async function writeWork(env, doc) {
  const cutoff = Date.now() - PATCH_MAX_AGE_MS;
  doc.patches = doc.patches.filter((p) => p.endedAt > cutoff).slice(-MAX_PATCHES);
  await env.FEAST.put('work', JSON.stringify(doc));
}

/** Keep a work list that fits KV metadata. */
export function clipWorkList(work) {
  if (!Array.isArray(work)) return [];
  const list = work.filter((w) => typeof w === 'string' && /^[ta]\|[^|]{1,80}\|-?\d{1,12}$/.test(w)).slice(0, 40);
  while (list.length > 0 && JSON.stringify({ work: list }).length > METADATA_LIMIT) list.pop();
  return list;
}

const parseEntry = (entry) => {
  const [kind, id, hash] = String(entry).split('|');
  return kind && id && hash ? { kind, id, hash, key: entry } : null;
};

/**
 * What the app has reported as waiting. It is read from the metadata of the 'state' key. (KV list calls would do
 * it too, but the free plan allows only 1000 of those a day and the cron runs 1440 times; reads are 100,000.)
 * The value is fetched as a stream and cancelled unread, so the state is not parsed.
 */
export async function pendingEntries(env) {
  const { value, metadata } = await env.FEAST.getWithMetadata('state', 'stream');
  if (value && typeof value.cancel === 'function') await value.cancel();
  return (metadata?.work || []).map(parseEntry).filter(Boolean);
}

// Re-read the stored doc but keep the attempt counters this run has recorded
async function freshCopy(env, mine) {
  const stored = await readWork(env);
  return { ...stored, attempts: { ...stored.attempts, ...mine.attempts } };
}

function backoffFor(failures) {
  return Math.min(FIRST_BACKOFF_MS * 2 ** Math.max(0, failures - 1), MAX_BACKOFF_MS);
}

const MAX_ACTIVE_BATCHES = 3;
const BATCH_OFF_MS = 12 * 3600_000; // batch refused for this key: use direct calls for a while
const batchOffNote = (status) => `The Gemini batch API is not available for this key (status ${status}); using direct calls`;

/**
 * Process waiting work. Safe to call from cron or on demand. Returns a short description of what
 * happened (used in logs and tests).
 *
 * The default is Gemini's batch API: the requests of all waiting recipes go in one batch job (half the price,
 * separate and much roomier limits); a later run collects the answers, which usually take minutes and at most a day.
 * If Google refuses batches for the key (free-tier keys may batch only the Flash-Lite models) or batch is switched
 * off (GEMINI_BATCH=off) it falls back to direct calls, one recipe at a time.
 */
export async function processWork(env, opts = {}) {
  if (!env.GEMINI_API_KEY) return 'no_key';
  const log = opts.log || (() => {});

  const entries = await pendingEntries(env);
  let doc = await readWork(env);
  if (entries.length === 0 && doc.batches.length === 0) return 'idle';
  if (doc.status.nextAt > Date.now()) return 'backing_off';

  const batchOn = env.GEMINI_BATCH !== 'off' && !(doc.batchOff && doc.batchOff.until > Date.now());
  if (!batchOn && doc.batches.length === 0) return processDirect(env, doc, entries, opts);

  // 1. collect finished batches
  let collected = 'none';
  if (doc.batches.length > 0) {
    const polled = await collectBatches(env, doc, log);
    doc = polled.doc;
    collected = polled.result;
    if (doc.status.nextAt > Date.now()) return 'backing_off'; // a batch failed: wait before sending it again
  }

  // 2. send new work
  if (!batchOn) return collected === 'none' ? processDirect(env, doc, entries, opts) : collected;
  const submitted = await submitNewBatch(env, doc, entries, log);
  if (submitted === 'batch_unavailable') return processDirect(env, await readWork(env), entries, opts);
  if (submitted !== 'nothing_to_do') return submitted;
  if (collected !== 'none' && collected !== 'batch_pending') return collected;
  return doc.batches.length > 0 ? 'batch_pending' : 'nothing_to_do';
}

// ---- batch ------------------------------------------------------------------------------------------------

const subKeysOf = (entry, recipe) =>
  entry.kind === 't' ? [entry.key] : [`${entry.key}|nl`, ...(recipe.ingredientSectionsEn && recipe.instructionsEn ? [`${entry.key}|en`] : [])];

const isStillValid = (entry, recipe) =>
  recipe &&
  (entry.kind === 't'
    ? isUntouchedPending(recipe) && contentHash(recipe) === entry.hash
    : needsAnnotation(recipe) && annotationSource(recipe) === entry.hash);

async function readRecipes(env) {
  const stateRaw = await env.FEAST.get('state');
  return stateRaw ? JSON.parse(stateRaw).data?.recipes || [] : [];
}

/** Look at the batches in flight; turn finished ones into patches. */
async function collectBatches(env, doc, log) {
  const remaining = [];
  const finished = [];
  let transientError = null;

  for (const batch of doc.batches) {
    try {
      const { state, results } = await getBatch(env, batch.name);
      if (state === 'JOB_STATE_SUCCEEDED') finished.push({ batch, results });
      else if (['JOB_STATE_FAILED', 'JOB_STATE_CANCELLED', 'JOB_STATE_EXPIRED'].includes(state)) {
        log('warn', { event: 'batch_failed', name: batch.name, state });
        doc.status = { state: 'waiting', note: `A Gemini batch ended as ${state.replace('JOB_STATE_', '').toLowerCase()}; its recipes are sent again`, nextAt: Date.now() + backoffFor((doc.status.failures || 0) + 1), failures: (doc.status.failures || 0) + 1, updatedAt: Date.now() };
        // the items fall out of "in flight" and are sent again in a later batch
      } else remaining.push(batch);
    } catch (e) {
      if (e instanceof GeminiHttpError && e.status === 404) {
        log('warn', { event: 'batch_gone', name: batch.name }); // expired or deleted on Google's side
      } else {
        transientError = e;
        remaining.push(batch); // keep it, ask again next time
      }
    }
  }

  if (finished.length === 0 && doc.batches.length === remaining.length) {
    if (transientError) log('warn', { event: 'batch_poll_failed', reason: String(transientError.message || transientError) });
    return { doc, result: 'batch_pending' }; // still running: nothing to write
  }

  if (finished.length > 0) {
    const recipes = await readRecipes(env);
    doc = await freshCopy(env, doc);
    for (const { batch, results } of finished) {
      for (const item of batch.items) {
        const entry = parseEntry(item.key);
        if (!entry || doc.patches.some((p) => p.key === entry.key)) continue;
        const recipe = recipes.find((r) => r.id === entry.id);
        if (!isStillValid(entry, recipe)) {
          doc.attempts[entry.key] = MAX_BAD_OUTPUT_ATTEMPTS; // changed since: skip, the app reports it again
          continue;
        }
        try {
          let result;
          const answer = (subKey) => {
            const r = results.get(subKey);
            if (!r || r.error) throw new Error(r?.error?.message || 'No answer in the batch result');
            return readJson(r.data);
          };
          if (entry.kind === 't') result = parseTranslation(recipe, answer(item.subKeys[0]));
          else {
            const main = parseAnnotation(recipe.ingredientSections, recipe.instructions, answer(item.subKeys[0]));
            const en = item.subKeys[1] ? parseAnnotation(recipe.ingredientSectionsEn, recipe.instructionsEn, answer(item.subKeys[1])) : undefined;
            result = { main, en };
          }
          doc.patches.push({
            key: entry.key, id: entry.id, kind: entry.kind, hash: entry.hash, label: recipe.title, result,
            method: `Gemini batch (${batch.model})`, calls: item.subKeys.length,
            startedAt: batch.submittedAt, endedAt: Date.now(),
          });
          log('info', { event: 'work_done', via: 'batch', kind: entry.kind, ms: Date.now() - batch.submittedAt });
        } catch (e) {
          const attempts = (doc.attempts[entry.key] || 0) + 1;
          doc.attempts[entry.key] = attempts;
          const reason = e instanceof Error ? e.message : String(e);
          if (attempts >= MAX_BAD_OUTPUT_ATTEMPTS) {
            doc.patches.push({ key: entry.key, id: entry.id, kind: entry.kind, hash: entry.hash, label: recipe.title, gaveUp: true, error: `${reason} (gave up after ${attempts} attempts)`, startedAt: batch.submittedAt, endedAt: Date.now(), calls: item.subKeys.length });
          }
          log('warn', { event: 'work_bad_output', via: 'batch', kind: entry.kind, reason, attempts });
        }
      }
    }
    doc.status = { state: remaining.length > 0 ? 'waiting' : 'working', note: remaining.length > 0 ? doc.status.note : '', nextAt: 0, failures: 0, updatedAt: Date.now() };
  }

  doc.batches = remaining;
  await writeWork(env, doc);
  return { doc, result: finished.length > 0 ? 'processed' : 'batch_pending' };
}

/** Put everything that waits (and is not in a batch yet) into a new batch job. */
async function submitNewBatch(env, doc, entries, log) {
  if (doc.batches.length >= MAX_ACTIVE_BATCHES) return 'nothing_to_do';
  const inFlight = new Set(doc.batches.flatMap((b) => b.items.map((i) => i.key)));
  const todo = entries.filter((e) => !inFlight.has(e.key) && !doc.patches.some((p) => p.key === e.key) && (doc.attempts[e.key] || 0) < MAX_BAD_OUTPUT_ATTEMPTS);
  if (todo.length === 0) return 'nothing_to_do';

  const recipes = await readRecipes(env);
  const items = [];
  const requests = [];
  for (const entry of todo) {
    const recipe = recipes.find((r) => r.id === entry.id);
    if (!isStillValid(entry, recipe)) {
      doc.attempts[entry.key] = MAX_BAD_OUTPUT_ATTEMPTS;
      continue;
    }
    const subKeys = subKeysOf(entry, recipe);
    if (entry.kind === 't') requests.push({ key: subKeys[0], body: buildTranslationRequest(recipe) });
    else {
      requests.push({ key: subKeys[0], body: buildAnnotationRequest(recipe.ingredientSections, recipe.instructions, 'nl') });
      if (subKeys[1]) requests.push({ key: subKeys[1], body: buildAnnotationRequest(recipe.ingredientSectionsEn, recipe.instructionsEn, 'en') });
    }
    items.push({ key: entry.key, subKeys });
  }
  if (requests.length === 0) {
    await writeWork(env, doc);
    return 'skipped';
  }

  const candidates = doc.batchModel ? [doc.batchModel] : await batchModelCandidates(env, log);
  let lastStatus = 0;
  for (const model of candidates) {
    try {
      const name = await submitBatch(env, model, requests, `feast ${new Date().toISOString().slice(0, 16)}`);
      doc = await freshCopy(env, doc);
      doc.batchModel = model;
      doc.batchOff = null;
      doc.batches.push({ name, model, submittedAt: Date.now(), items });
      doc.status = { state: 'waiting', note: `${requests.length} request${requests.length === 1 ? '' : 's'} sent to Gemini's batch queue (${model}); answers usually take minutes, at most a day`, nextAt: 0, failures: 0, updatedAt: Date.now() };
      await writeWork(env, doc);
      log('info', { event: 'batch_submitted', model, requests: requests.length, name });
      return 'submitted';
    } catch (e) {
      const kind = classifyGeminiError(e);
      lastStatus = e instanceof GeminiHttpError ? e.status : 0;
      log('warn', { event: 'batch_submit_failed', model, status: lastStatus, detail: e.detail, reason: String(e.message || e) });
      if (kind === 'transient') {
        // rate limited or Google is down: wait, then try again (not a reason to give up on batches)
        doc = await freshCopy(env, doc);
        const failures = (doc.status.failures || 0) + 1;
        const wait = backoffFor(failures);
        doc.status = { state: 'waiting', note: `Gemini batch is rate limiting or unavailable (${e.message}); trying again in ${Math.round(wait / 60000)} min`, nextAt: Date.now() + wait, failures, updatedAt: Date.now() };
        await writeWork(env, doc);
        return 'rate_limited';
      }
      doc.batchModel = ''; // try the next candidate model
    }
  }

  // No model accepted a batch: use direct calls for a while
  doc = await freshCopy(env, doc);
  doc.batchOff = { until: Date.now() + BATCH_OFF_MS, note: batchOffNote(lastStatus) };
  await writeWork(env, doc);
  log('warn', { event: 'batch_unavailable', status: lastStatus });
  return 'batch_unavailable';
}

// ---- direct calls (fallback) ------------------------------------------------------------------------------

async function processDirect(env, doc, entries, { budgetMs = 20000, log = () => {} } = {}) {
  if (entries.length === 0) return 'idle';
  const todo = entries.filter((e) => !doc.patches.some((p) => p.key === e.key) && (doc.attempts[e.key] || 0) < MAX_BAD_OUTPUT_ATTEMPTS);
  if (todo.length === 0) return 'nothing_to_do';

  const stateRaw = await env.FEAST.get('state');
  const recipes = stateRaw ? JSON.parse(stateRaw).data?.recipes || [] : [];

  const gap = env.WORK_GAP_MS !== undefined ? Number(env.WORK_GAP_MS) : GAP_BETWEEN_CALLS_MS;
  const generateFor = () => (body, tier) => generateContent(env, body, tier, log);
  const started = Date.now();
  let processed = 0;

  for (const entry of todo) {
    if (Date.now() - started > budgetMs) break;
    const recipe = recipes.find((r) => r.id === entry.id);
    const stillValid =
      recipe &&
      (entry.kind === 't'
        ? isUntouchedPending(recipe) && contentHash(recipe) === entry.hash
        : needsAnnotation(recipe) && annotationSource(recipe) === entry.hash);
    if (!stillValid) {
      doc.attempts[entry.key] = MAX_BAD_OUTPUT_ATTEMPTS; // changed since it was reported: skip, the app reports it again
      continue;
    }

    const attempt = doc.attempts[entry.key] || 0;
    const tier = entry.kind === 'a' && attempt === 0 ? 'light' : 'default';
    const startedAt = Date.now();
    let calls = 0;
    const generate = generateFor();
    const counting = (body, t) => {
      calls += 1;
      return generate(body, t);
    };

    try {
      let result;
      if (entry.kind === 't') {
        result = await translateRecipe(recipe, counting);
      } else {
        const main = await annotateVersion(recipe.ingredientSections, recipe.instructions, 'nl', counting, tier);
        let en;
        if (recipe.ingredientSectionsEn && recipe.instructionsEn) {
          await sleep(gap);
          en = await annotateVersion(recipe.ingredientSectionsEn, recipe.instructionsEn, 'en', counting, tier);
        }
        result = { main, en };
      }

      doc = await freshCopy(env, doc); // an acknowledgement may have happened meanwhile
      if (!doc.patches.some((p) => p.key === entry.key)) {
        doc.patches.push({
          key: entry.key,
          id: entry.id,
          kind: entry.kind,
          hash: entry.hash,
          label: recipe.title,
          result,
          method: entry.kind === 'a' && tier === 'light' ? 'Gemini (light model, server)' : 'Gemini (server)',
          calls,
          startedAt,
          endedAt: Date.now(),
        });
      }
      doc.status = { state: 'working', note: '', nextAt: 0, failures: 0, updatedAt: Date.now() };
      await writeWork(env, doc);
      processed += 1;
      log('info', { event: 'work_done', kind: entry.kind, ms: Date.now() - startedAt, calls });
      await sleep(gap);
    } catch (e) {
      const kind = classifyGeminiError(e);
      const reason = e instanceof Error ? e.message : String(e);
      doc = await freshCopy(env, doc);
      if (kind === 'transient') {
        const failures = (doc.status.failures || 0) + 1;
        const wait = backoffFor(failures);
        doc.status = { state: 'waiting', note: `Gemini is rate limiting or unavailable (${reason}); trying again in ${Math.round(wait / 60000)} min`, nextAt: Date.now() + wait, failures, updatedAt: Date.now() };
        await writeWork(env, doc);
        log('warn', { event: 'work_waiting', kind: entry.kind, reason, waitMs: wait });
        return 'rate_limited';
      }
      if (kind === 'other') {
        const attempts = (doc.attempts[entry.key] || 0) + 1;
        doc.attempts[entry.key] = attempts;
        if (attempts >= MAX_BAD_OUTPUT_ATTEMPTS) {
          doc.patches.push({ key: entry.key, id: entry.id, kind: entry.kind, hash: entry.hash, label: recipe.title, gaveUp: true, error: `${reason} (gave up after ${attempts} attempts)`, startedAt, endedAt: Date.now(), calls });
        }
        await writeWork(env, doc);
        log('warn', { event: 'work_bad_output', kind: entry.kind, reason, attempts });
        continue;
      }
      // key missing or rejected: stop, and look again later
      doc.status = {
        state: 'stopped',
        note: e instanceof GeminiHttpError ? `Gemini rejected the request (status ${e.status}): check the API key. Recipes stay as they are until it works.` : `Gemini could not be used: ${reason}`,
        nextAt: Date.now() + STOPPED_RETRY_MS,
        failures: (doc.status.failures || 0) + 1,
        updatedAt: Date.now(),
      };
      await writeWork(env, doc);
      log('error', { event: 'work_stopped', kind: entry.kind, reason });
      return 'stopped';
    }
  }

  // persist skipped/stale markers if nothing else was written
  if (processed === 0) await writeWork(env, doc);
  return processed > 0 ? 'processed' : 'skipped';
}

/** Remove patches the app has applied. */
export async function acknowledge(env, keys) {
  if (!Array.isArray(keys) || keys.length === 0) return 0;
  const doc = await readWork(env);
  const before = doc.patches.length;
  doc.patches = doc.patches.filter((p) => !keys.includes(p.key));
  if (doc.patches.length !== before) await writeWork(env, doc);
  return before - doc.patches.length;
}
