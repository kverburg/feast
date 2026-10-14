import { Recipe } from '../types/recipe';
import { translateRecipeWithGemini, isGeminiAvailable, classifyGeminiError, GeminiHttpError } from './geminiService';
import { getStoredRecipes, saveStoredRecipes } from './storageService';
import { startLog, updateLog, finishLog } from './activityLog';

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

const contentHash = (r: Recipe): string => {
  const text = JSON.stringify([r.title, r.description, r.ingredientSections, r.instructions]);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return String(h);
};

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

let queueRunning = false;
let queueError: string | null = null;
const badOutputAttempts = new Map<string, number>();
const logIds = new Map<string, string>(); // recipe id -> its entry in the activity log
const changeListeners = new Set<() => void>();
const errorListeners = new Set<(message: string | null) => void>();

function setQueueError(message: string | null) {
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
  runQueue().finally(() => {
    queueRunning = false;
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
  }

  const nextPending = () =>
    getStoredRecipes().find(
      (r) => isUntouchedPending(r) && (badOutputAttempts.get(r.id) ?? 0) < MAX_BAD_OUTPUT_ATTEMPTS
    );

  if (!nextPending()) {
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
      setQueueError(null);
      return;
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
        await sleep(backoff);
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
