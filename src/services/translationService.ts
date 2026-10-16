import { Recipe } from '../types/recipe';
import { translateRecipeWithGemini, isGeminiAvailable, classifyGeminiError, GeminiHttpError } from './geminiService';
import { getStoredRecipes, saveStoredRecipes } from './storageService';
import { startLog, updateLog, finishLog, recordLog } from './activityLog';
import { fetchServerWork, acknowledgePatches, retryServerWork, ServerPatch, ServerWork } from './serverWork';
import { annotateRecipeVersion, VersionAnnotation } from './annotationService';
import {
  annotationSource,
  applyAnnotationResult,
  applyTranslationResult,
  computeWorkList,
  contentHash,
  isUntouchedPending,
  needsAnnotation,
  withPendingTranslation,
} from '../shared/recipeWork';

// ---------------------------------------------------------------------------
// Translation via Gemini, run as a background queue.
// Dutch recipes get an English version, every other language gets a Dutch one; the main fields
// always hold Dutch and the *En fields the English text. A recipe waiting for translation keeps
// its original text in the main fields plus translationPending. The queue translates one recipe
// at a time, backs off on rate limits, and reports a missing or rejected key through
// subscribeTranslationError. The flag lives on the recipe, so it survives reloads and syncs.
// ---------------------------------------------------------------------------

const MISSING_KEY_MESSAGE =
  'Gemini API key missing: recipes cannot be translated. Add a key in Settings.';
const rejectedKeyMessage = (e?: unknown) =>
  `Gemini rejected the request${e instanceof GeminiHttpError ? ` (${e.message.replace('Gemini API returned ', '')})` : ''}. Check the API key in Settings. Recipes stay untranslated until it works.`;

export { withPendingTranslation };

const GAP_BETWEEN_CALLS_MS = 6000; // stay under free-tier requests-per-minute
const FIRST_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 15 * 60_000;
const MAX_BAD_OUTPUT_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface QueueStatus {
  state: 'idle' | 'working' | 'waiting' | 'stopped';
  translating: number; // recipes waiting for their translation
  annotating: number; // recipes waiting for plural names and step quantities
  note?: string; // why it waits or stopped
  mode: 'server' | 'local'; // server: the worker does it, also when the app is closed
}

let queueState: QueueStatus['state'] = 'idle';
let queueNote: string | undefined;
let queueMode: 'server' | 'local' = 'local';
const statusListeners = new Set<() => void>();
const notifyStatus = () => statusListeners.forEach((cb) => cb());
function setState(state: QueueStatus['state'], note?: string) {
  queueState = state;
  queueNote = note;
  notifyStatus();
}

const needsAnnotationNow = (r: Recipe): boolean =>
  needsAnnotation(r) && (badOutputAttempts.get(`annotate:${r.id}`) ?? 0) < MAX_BAD_OUTPUT_ATTEMPTS;

/** What the background queue is doing and how much is waiting (shown on the activity page). */
export function getQueueStatus(): QueueStatus {
  const recipes = getStoredRecipes();
  return {
    state: queueState,
    note: queueNote,
    mode: queueMode,
    translating: recipes.filter(isUntouchedPending).length,
    annotating: recipes.filter(needsAnnotationNow).length,
  };
}

export function subscribeQueueStatus(cb: () => void): () => void {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

let queueRunning = false;
let queueError: string | null = null;
const badOutputAttempts = new Map<string, number>();
const logIds = new Map<string, string>(); // recipe id -> its entry in the activity log
const changeListeners = new Set<() => void>();
const errorListeners = new Set<(message: string | null) => void>();

function setQueueError(message: string | null) {
  if (message) setState('stopped', message);
  if (message === queueError) return;
  queueError = message;
  errorListeners.forEach((cb) => cb(message));
}

/** Called after a recipe was translated, so the UI can reload from storage. */
export function subscribeTranslationChange(cb: () => void): () => void {
  changeListeners.add(cb);
  return () => changeListeners.delete(cb);
}

/** Called with a message when translation is blocked by a missing/rejected key, and null when fine. */
export function subscribeTranslationError(cb: (message: string | null) => void): () => void {
  errorListeners.add(cb);
  cb(queueError);
  return () => errorListeners.delete(cb);
}

/**
 * Start (or nudge) the background queue. Safe to call any time: if it is already running it
 * picks up newly queued recipes by itself.
 */
/** The "Retry" button: forget what failed (here and on the server) and start again. */
export async function retryTranslation(): Promise<void> {
  badOutputAttempts.clear();
  setQueueError(null);
  await retryServerWork();
  startTranslationQueue();
}

export function startTranslationQueue(): void {
  if (queueRunning) return;
  queueRunning = true;
  setState('working');
  runQueue().finally(() => {
    queueRunning = false;
    if (queueState !== 'stopped') setState('idle');
  });
}

// Housekeeping before any queue (local or server) looks at the recipes
function prepareRecipes(): void {
  // Recipes without a second language yet (imported earlier, added by hand, ...) join the queue too.
  const all = getStoredRecipes();
  if (all.some((r) => !r.titleEn && !r.translationPending && !r.id.startsWith('seed-'))) {
    saveStoredRecipes(
      all.map((r) => (!r.titleEn && !r.translationPending && !r.id.startsWith('seed-') ? withPendingTranslation(r) : r))
    );
  }

  // A recipe edited by hand while it was queued no longer wants the automatic translation.
  const stored = getStoredRecipes();
  if (stored.some((r) => r.translationPending && !isUntouchedPending(r))) {
    saveStoredRecipes(
      stored.map((r) => (r.translationPending && !isUntouchedPending(r) ? { ...r, translationPending: false } : r))
    );
    changeListeners.forEach((cb) => cb());
    notifyStatus();
  }
}

// With a Gemini key on the server the worker does the translating and annotating, also when the app
// is closed; the app only reports what waits and applies the results. Without one (local development,
// or only a key typed into Settings) the app does the work itself, as before.
async function runQueue(): Promise<void> {
  prepareRecipes();
  const info = await fetchServerWork();
  if (info?.enabled) {
    queueMode = 'server';
    await runServerQueue(info);
    return;
  }
  queueMode = 'local';
  await runLocalQueue();
}

const SERVER_POLL_MS = 30_000;
const SERVER_MAX_POLLS = 120; // an hour; the next app start looks again

// Apply what the worker finished. A result only applies to the recipe it was made for: the fingerprint must
// still match, so nothing you edited meanwhile is overwritten.
function applyServerPatches(patches: ServerPatch[]): void {
  if (patches.length === 0) return;
  const recipes = getStoredRecipes();
  let changed = false;

  for (const patch of patches) {
    const idx = recipes.findIndex((r) => r.id === patch.id);
    const recipe = recipes[idx];
    const logBase = {
      id: `srv-${patch.key}-${patch.endedAt}`,
      recipeId: patch.id,
      kind: patch.kind === 't' ? ('translate' as const) : ('annotate' as const),
      label: patch.label || recipe?.title || patch.id,
      started: patch.startedAt,
      ended: patch.endedAt,
    };
    if (!recipe) continue;

    if (patch.gaveUp) {
      recordLog({ ...logBase, method: 'Gemini (server)', status: 'failed', detail: patch.error || 'The server gave up' });
      continue;
    }

    if (patch.kind === 't' && patch.result && isUntouchedPending(recipe) && contentHash(recipe) === patch.hash) {
      recipes[idx] = applyTranslationResult(recipe, patch.result);
      changed = true;
      recordLog({ ...logBase, method: patch.method, status: 'done', detail: `${patch.result.sourceLanguage === 'nl' ? 'Dutch to English' : 'To Dutch'} (done by the server)` });
    } else if (patch.kind === 'a' && patch.result && needsAnnotation(recipe) && annotationSource(recipe) === patch.hash) {
      recipes[idx] = applyAnnotationResult(recipe, patch.result.main, patch.result.en);
      changed = true;
      const refs = patch.result.main.refs.reduce((n, step) => n + step.length, 0);
      recordLog({ ...logBase, method: patch.method, status: 'done', detail: `${Object.keys(patch.result.main.forms).length} ingredient names, ${refs} step quantities (done by the server)` });
    }
    // anything else is stale (edited, or applied on another device already) and simply dropped
  }

  if (changed) {
    saveStoredRecipes(recipes);
    changeListeners.forEach((cb) => cb());
  }
}

async function runServerQueue(first: ServerWork): Promise<void> {
  let info: ServerWork | null = first;
  for (let poll = 0; poll < SERVER_MAX_POLLS; poll++) {
    if (!info || !info.enabled) return; // no server any more: the next start decides again

    applyServerPatches(info.patches);
    await acknowledgePatches(info.patches.map((p) => p.key));

    const status = info.status;
    if (status?.state === 'stopped') {
      setQueueError(status.note || 'The server could not use Gemini. Check the API key.');
      return;
    }
    setQueueError(null);
    setState(
      status?.state === 'waiting' ? 'waiting' : 'working',
      status?.state === 'waiting' ? status.note : info.batch?.off || undefined
    );

    const localWork = computeWorkList(getStoredRecipes());
    if (localWork.length === 0 && info.pending === 0) return; // nothing waits, anywhere
    await sleep(SERVER_POLL_MS);
    info = await fetchServerWork();
  }
}

async function runLocalQueue(): Promise<void> {
  let backoff = FIRST_BACKOFF_MS;

  const nextPending = () =>
    getStoredRecipes().find(
      (r) => isUntouchedPending(r) && (badOutputAttempts.get(r.id) ?? 0) < MAX_BAD_OUTPUT_ATTEMPTS
    );

  const nextToAnnotate = () => getStoredRecipes().find(needsAnnotationNow);

  // Adds plural forms and step quantities (see annotationService). Returns false to stop the queue.
  const annotateOne = async (r: Recipe): Promise<boolean> => {
    const key = `annotate:${r.id}`;
    // The lighter model first; if it produced an unusable answer for this recipe, use the default one
    const tier = (badOutputAttempts.get(key) ?? 0) === 0 ? 'light' : 'default';
    const method = tier === 'light' ? 'Gemini (light model)' : 'Gemini';
    let logId = logIds.get(key);
    if (!logId) {
      logId = startLog('annotate', r.title, method, r.id);
      logIds.set(key, logId);
    } else {
      updateLog(logId, { method });
    }
    try {
      const before = annotationSource(r);
      const main = await annotateRecipeVersion(r.ingredientSections, r.instructions, 'nl', tier);
      let en: VersionAnnotation | undefined;
      if (r.ingredientSectionsEn && r.instructionsEn) {
        await sleep(GAP_BETWEEN_CALLS_MS);
        en = await annotateRecipeVersion(r.ingredientSectionsEn, r.instructionsEn, 'en', tier);
      }

      const latest = getStoredRecipes();
      const idx = latest.findIndex((x) => x.id === r.id);
      if (idx === -1 || annotationSource(latest[idx]) !== before) {
        finishLog(logId, 'done', { detail: 'Skipped: the recipe was edited meanwhile, it will be annotated again' });
      } else {
        latest[idx] = applyAnnotationResult(latest[idx], main, en);
        saveStoredRecipes(latest);
        changeListeners.forEach((cb) => cb());
        notifyStatus();
        const refCount = main.refs.reduce((n, step) => n + step.length, 0);
        finishLog(logId, 'done', { detail: `${Object.keys(main.forms).length} ingredient names, ${refCount} step quantities${en ? ' (both languages)' : ''}` });
      }
      logIds.delete(key);
      setQueueError(null);
      backoff = FIRST_BACKOFF_MS;
      await sleep(GAP_BETWEEN_CALLS_MS);
      return true;
    } catch (e) {
      const kind = classifyGeminiError(e);
      const reason = e instanceof Error ? e.message : String(e);
      if (kind === 'transient') {
        updateLog(logId, { status: 'retrying', detail: `${reason}; retrying in ${Math.round(backoff / 1000)}s` });
        setState('waiting', `Gemini is rate limiting or unavailable (${reason}); trying again in ${Math.round(backoff / 1000)}s`);
        await sleep(backoff);
        setState('working');
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        return true;
      }
      if (kind === 'other') {
        const attempts = (badOutputAttempts.get(key) ?? 0) + 1;
        badOutputAttempts.set(key, attempts);
        if (attempts >= MAX_BAD_OUTPUT_ATTEMPTS) {
          finishLog(logId, 'failed', { detail: `${reason} (gave up after ${attempts} attempts)` });
          logIds.delete(key);
        } else {
          updateLog(logId, { status: 'retrying', detail: reason });
        }
        return true;
      }
      finishLog(logId, 'failed', { detail: kind === 'unavailable' ? 'No Gemini API key' : reason });
      logIds.delete(key);
      setQueueError(kind === 'unavailable' ? MISSING_KEY_MESSAGE : rejectedKeyMessage(e));
      return false;
    }
  };

  if (!nextPending() && !nextToAnnotate()) {
    setQueueError(null);
    return;
  }
  if (!(await isGeminiAvailable())) {
    setQueueError(MISSING_KEY_MESSAGE);
    return;
  }

  for (;;) {
    const next = nextPending();
    if (!next) {
      // Translations first; once none are waiting, annotate recipes one at a time
      const toAnnotate = nextToAnnotate();
      if (!toAnnotate) {
        setQueueError(null);
        return;
      }
      if (!(await annotateOne(toAnnotate))) return;
      continue;
    }

    let logId = logIds.get(next.id);
    if (!logId) {
      logId = startLog('translate', next.title, 'Gemini', next.id);
      logIds.set(next.id, logId);
    }

    try {
      const result = await translateRecipeWithGemini(next);
      // Re-read storage so edits made while we were waiting are not overwritten.
      const latest = getStoredRecipes();
      const idx = latest.findIndex((r) => r.id === next.id);
      if (idx !== -1 && isUntouchedPending(latest[idx])) {
        latest[idx] = applyTranslationResult(latest[idx], result);
        saveStoredRecipes(latest);
        changeListeners.forEach((cb) => cb());
        notifyStatus();
      }
      finishLog(logId, 'done', {
        detail: result.sourceLanguage === 'nl' ? 'Dutch to English' : 'To Dutch',
      });
      logIds.delete(next.id);
      setQueueError(null);
      backoff = FIRST_BACKOFF_MS;
      await sleep(GAP_BETWEEN_CALLS_MS);
    } catch (e) {
      const kind = classifyGeminiError(e);
      const reason = e instanceof Error ? e.message : String(e);
      if (kind === 'transient') {
        updateLog(logId, { status: 'retrying', detail: `${reason}; retrying in ${Math.round(backoff / 1000)}s` });
        setState('waiting', `Gemini is rate limiting or unavailable (${reason}); trying again in ${Math.round(backoff / 1000)}s`);
        await sleep(backoff);
        setState('working');
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      } else if (kind === 'other') {
        const attempts = (badOutputAttempts.get(next.id) ?? 0) + 1;
        badOutputAttempts.set(next.id, attempts);
        if (attempts >= MAX_BAD_OUTPUT_ATTEMPTS) {
          finishLog(logId, 'failed', { detail: `${reason} (gave up after ${attempts} attempts)` });
          logIds.delete(next.id);
        } else {
          updateLog(logId, { status: 'retrying', detail: reason });
        }
      } else if (kind === 'unavailable') {
        finishLog(logId, 'failed', { detail: 'No Gemini API key' });
        logIds.delete(next.id);
        setQueueError(MISSING_KEY_MESSAGE);
        return;
      } else {
        finishLog(logId, 'failed', { detail: reason });
        logIds.delete(next.id);
        setQueueError(rejectedKeyMessage(e));
        return; // retried when the app is opened again or a key is saved
      }
    }
  }
}
