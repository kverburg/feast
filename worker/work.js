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
import { translateRecipe, annotateVersion } from '../src/shared/geminiTasks.ts';
import { classifyGeminiError, GeminiHttpError } from '../src/shared/geminiErrors.ts';
import { contentHash, annotationSource, isUntouchedPending, needsAnnotation } from '../src/shared/recipeWork.ts';
import { generateContent } from './gemini.js';

const GAP_BETWEEN_CALLS_MS = 6000; // stay under free-tier requests per minute (WORK_GAP_MS overrides it in tests)
const FIRST_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 15 * 60_000;
const STOPPED_RETRY_MS = 30 * 60_000; // key missing or rejected: look again later
const MAX_BAD_OUTPUT_ATTEMPTS = 3;
const MAX_PATCHES = 60;
const PATCH_MAX_AGE_MS = 14 * 86400000;
const METADATA_LIMIT = 1000; // KV allows 1024 bytes

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const emptyWork = () => ({ patches: [], attempts: {}, status: { state: 'idle', note: '', nextAt: 0, failures: 0, updatedAt: 0 } });

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

/**
 * Process waiting work for up to `budgetMs`. Safe to call from cron or on demand.
 * Returns a short description of what happened (used in logs and tests).
 */
export async function processWork(env, { budgetMs = 20000, log = () => {} } = {}) {
  if (!env.GEMINI_API_KEY) return 'no_key';

  const entries = await pendingEntries(env);
  if (entries.length === 0) return 'idle';

  let doc = await readWork(env);
  const now = Date.now();
  if (doc.status.nextAt > now) return 'backing_off';

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
