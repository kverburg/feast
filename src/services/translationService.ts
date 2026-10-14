import { Recipe } from '../types/recipe';
import { translateRecipeWithGemini, isGeminiAvailable, classifyGeminiError, GeminiHttpError } from './geminiService';
import { getStoredRecipes, saveStoredRecipes } from './storageService';
import { startLog, updateLog, finishLog } from './activityLog';
import { ANNOTATION_VERSION, annotateRecipeVersion, applyAnnotation, VersionAnnotation } from './annotationService';

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
const rejectedKeyMessage = (status?: number) =>
  `Gemini rejected the request${status ? ` (status ${status})` : ''}: check the API key in Settings. Recipes stay untranslated until it works.`;

const hashValue = (value: unknown): string => {
  const text = JSON.stringify(value);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return String(h);
};

const contentHash = (r: Recipe): string => hashValue([r.title, r.description, r.ingredientSections, r.instructions]);

// Everything the annotation depends on, in both languages
const annotationSource = (r: Recipe): string =>
  hashValue([r.ingredientSections, r.instructions, r.ingredientSectionsEn, r.instructionsEn]);

/** Mark a freshly imported recipe (any language) as waiting for translation. */
export function withPendingTranslation(recipe: Recipe): Recipe {
  return { ...recipe, translationPending: true, translationSourceHash: contentHash(recipe) };
}

// Still exactly as queued, so translating it loses nothing. Recipes queued by an older version
// carry an English copy in the *En fields instead of a hash.
const isUntouchedPending = (r: Recipe): boolean => {
  if (!r.translationPending) return false;
  if (r.translationSourceHash) return contentHash(r) === r.translationSourceHash;
  return (
    JSON.stringify([r.title, r.ingredientSections, r.instructions]) ===
    JSON.stringify([r.titleEn, r.ingredientSectionsEn, r.instructionsEn])
  );
};

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
}

let queueState: QueueStatus['state'] = 'idle';
let queueNote: string | undefined;
const statusListeners = new Set<() => void>();
const notifyStatus = () => statusListeners.forEach((cb) => cb());
function setState(state: QueueStatus['state'], note?: string) {
  queueState = state;
  queueNote = note;
  notifyStatus();
}

const needsAnnotationNow = (r: Recipe): boolean =>
  !r.translationPending &&
  r.annotationVersion !== ANNOTATION_VERSION &&
  r.ingredientSections.some((sec) => sec.items.length > 0) &&
  r.instructions.length > 0 &&
  (badOutputAttempts.get(`annotate:${r.id}`) ?? 0) < MAX_BAD_OUTPUT_ATTEMPTS;

/** What the background queue is doing and how much is waiting (shown on the activity page). */
export function getQueueStatus(): QueueStatus {
  const recipes = getStoredRecipes();
  return {
    state: queueState,
    note: queueNote,
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
export function startTranslationQueue(): void {
  if (queueRunning) return;
  queueRunning = true;
  setState('working');
  runQueue().finally(() => {
    queueRunning = false;
    if (queueState !== 'stopped') setState('idle');
  });
}

async function runQueue(): Promise<void> {
  let backoff = FIRST_BACKOFF_MS;

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
      logId = startLog('annotate', r.title, method);
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
        const current = latest[idx];
        const nl = applyAnnotation(current.ingredientSections, current.instructions, main);
        const enApplied =
          en && current.ingredientSectionsEn && current.instructionsEn
            ? applyAnnotation(current.ingredientSectionsEn, current.instructionsEn, en)
            : undefined;
        latest[idx] = {
          ...current,
          ingredientSections: nl.sections,
          instructions: nl.steps,
          ...(enApplied ? { ingredientSectionsEn: enApplied.sections, instructionsEn: enApplied.steps } : {}),
          annotationVersion: ANNOTATION_VERSION,
        };
        saveStoredRecipes(latest);
        changeListeners.forEach((cb) => cb());
        notifyStatus();
        const refCount = main.refs.reduce((n, step) => n + step.length, 0);
        finishLog(logId, 'done', { detail: `${main.forms.size} ingredient names, ${refCount} step quantities${en ? ' (both languages)' : ''}` });
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
      setQueueError(kind === 'unavailable' ? MISSING_KEY_MESSAGE : rejectedKeyMessage(e instanceof GeminiHttpError ? e.status : undefined));
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
      logId = startLog('translate', next.title, 'Gemini');
      logIds.set(next.id, logId);
    }

    try {
      const result = await translateRecipeWithGemini(next);
      // Re-read storage so edits made while we were waiting are not overwritten.
      const latest = getStoredRecipes();
      const idx = latest.findIndex((r) => r.id === next.id);
      if (idx !== -1 && isUntouchedPending(latest[idx])) {
        const current = latest[idx];
        const translated = {
          title: result.title,
          description: result.description,
          ingredientSections: result.ingredientSections,
          instructions: result.instructions,
        };
        const original = {
          title: current.title,
          description: current.description,
          ingredientSections: current.ingredientSections,
          instructions: current.instructions,
        };
        // Dutch source: keep it as is and store the translation as the English version.
        // Anything else: the translation becomes the Dutch main text, the original the English one.
        const [dutch, english] = result.sourceLanguage === 'nl' ? [original, translated] : [translated, original];
        latest[idx] = {
          ...current,
          ...dutch,
          titleEn: english.title,
          descriptionEn: english.description,
          ingredientSectionsEn: english.ingredientSections,
          instructionsEn: english.instructions,
          translationVersion: 2,
          translationPending: false,
          translationSourceHash: undefined,
        };
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
        setQueueError(rejectedKeyMessage(e instanceof GeminiHttpError ? e.status : undefined));
        return; // retried when the app is opened again or a key is saved
      }
    }
  }
}
