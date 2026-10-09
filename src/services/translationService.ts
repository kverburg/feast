import { Recipe } from '../types/recipe';
import { translateRecipeWithGemini, isGeminiAvailable, classifyGeminiError, GeminiHttpError } from './geminiService';
import { getStoredRecipes, saveStoredRecipes } from './storageService';

// ---------------------------------------------------------------------------
// Dutch translation via Gemini, run as a background queue.
// A recipe waiting for translation carries its English text in the main fields plus a copy in
// the *En fields, and translationPending. The queue translates one recipe at a time, backs off
// on rate limits, and reports a missing or rejected key through subscribeTranslationError.
// The flag lives on the recipe, so the queue survives reloads and syncs across devices.
// ---------------------------------------------------------------------------

const MISSING_KEY_MESSAGE =
  'Gemini API key missing: recipes cannot be translated to Dutch. Add a key in Settings.';
const rejectedKeyMessage = (status?: number) =>
  `Gemini rejected the request${status ? ` (status ${status})` : ''}: check the API key in Settings. Recipes stay in English until it works.`;

/** Turn a freshly imported English recipe into one that waits for its Dutch translation. */
export function withPendingTranslation(recipe: Recipe): Recipe {
  return {
    ...recipe,
    titleEn: recipe.title,
    descriptionEn: recipe.description,
    ingredientSectionsEn: recipe.ingredientSections,
    instructionsEn: recipe.instructions,
    translationPending: true,
  };
}

const englishSource = (r: Recipe): Partial<Recipe> => ({
  title: r.titleEn,
  description: r.descriptionEn,
  ingredientSections: r.ingredientSectionsEn,
  instructions: r.instructionsEn,
});

// A queued recipe still carries the English text in its main fields; untouched means it still does.
const isUntouchedPending = (r: Recipe): boolean =>
  !!r.translationPending &&
  JSON.stringify([r.title, r.ingredientSections, r.instructions]) ===
    JSON.stringify([r.titleEn, r.ingredientSectionsEn, r.instructionsEn]);

const GAP_BETWEEN_CALLS_MS = 6000; // stay under free-tier requests-per-minute
const FIRST_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 15 * 60_000;
const MAX_BAD_OUTPUT_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let queueRunning = false;
let queueError: string | null = null;
const badOutputAttempts = new Map<string, number>();
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

    try {
      const result = await translateRecipeWithGemini(englishSource(next));
      // Re-read storage so edits made while we were waiting are not overwritten.
      const latest = getStoredRecipes();
      const idx = latest.findIndex((r) => r.id === next.id);
      if (idx !== -1 && isUntouchedPending(latest[idx])) {
        latest[idx] = {
          ...latest[idx],
          title: result.title,
          description: result.description,
          ingredientSections: result.ingredientSections,
          instructions: result.instructions,
          translationVersion: 2,
          translationPending: false,
        };
        saveStoredRecipes(latest);
        changeListeners.forEach((cb) => cb());
      }
      setQueueError(null);
      backoff = FIRST_BACKOFF_MS;
      await sleep(GAP_BETWEEN_CALLS_MS);
    } catch (e) {
      const kind = classifyGeminiError(e);
      if (kind === 'transient') {
        await sleep(backoff);
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      } else if (kind === 'other') {
        badOutputAttempts.set(next.id, (badOutputAttempts.get(next.id) ?? 0) + 1);
      } else if (kind === 'unavailable') {
        setQueueError(MISSING_KEY_MESSAGE);
        return;
      } else {
        setQueueError(rejectedKeyMessage(e instanceof GeminiHttpError ? e.status : undefined));
        return; // retried when the app is opened again or a key is saved
      }
    }
  }
}
