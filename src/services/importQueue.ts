import { Recipe } from '../types/recipe';
import {
  parseUrlToRecipe,
  parseHtmlContentToRecipe,
  parseRawTextToRecipe,
  isUsableRecipe,
} from './recipeParserService';
import { parseRecipeWithGemini, isGeminiAvailable } from './geminiService';
import { classifyGeminiError } from '../shared/geminiErrors';
import { dropDefaultSeasoningAmounts } from '../shared/importTasks';
import { findImageForRecipe } from './imageSearchService';
import { withPendingTranslation, startTranslationQueue } from './translationService';
import { getStoredRecipes, saveStoredRecipes } from './storageService';
import { startLog, updateLog, finishLog, recordLog } from './activityLog';
import { fetchServerWork, registerServerImport, ServerPatch } from './serverWork';
import { uploadDataUrl } from './imageService';

// Imports run in the background, one at a time. The import dialog only queues a job;
// the finished recipe is saved straight away (the translation queue picks it up next).

export type ImportJobKind = 'url' | 'text' | 'photo';

export interface ImportJob {
  id: string;
  kind: ImportJobKind;
  label: string; // shown to the user: the URL, "Pasted text" or the photo name
  status: 'queued' | 'running' | 'failed';
  createdAt: string;
  error?: string;
  // payloads: text and url survive a reload; a photo only lives in memory
  url?: string;
  text?: string;
  // a photo handed to the server: it is read there, also when the app is closed; the recipe arrives as a patch
  remote?: boolean;
  imageUrl?: string;
}

export type ImportEvent =
  | { type: 'started'; job: ImportJob }
  | { type: 'done'; job: ImportJob; recipe: Recipe }
  | { type: 'failed'; job: ImportJob; error: string };

const STORAGE_KEY = 'gourmet_craft_import_jobs_v1';

const photoPayloads = new Map<string, { dataUrl: string; fileName: string }>();

const loadJobs = (): ImportJob[] => {
  try {
    const jobs: ImportJob[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // A running job was cut off by closing the app: run it again. Photos are gone with the page.
    return jobs.map((j) =>
      j.kind === 'photo' && j.status !== 'failed' && !j.remote
        ? { ...j, status: 'failed' as const, error: 'Interrupted when the app was closed. Add the photo again.' }
        : j.status === 'running'
          ? { ...j, status: 'queued' as const }
          : j
    );
  } catch {
    return [];
  }
};

let jobs: ImportJob[] = loadJobs();
let running = false;
const jobListeners = new Set<() => void>();
const eventListeners = new Set<(event: ImportEvent) => void>();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // ignore
  }
  jobListeners.forEach((cb) => cb());
};

export const getImportJobs = (): ImportJob[] => jobs;

export function subscribeImportJobs(cb: () => void): () => void {
  jobListeners.add(cb);
  return () => jobListeners.delete(cb);
}

export function subscribeImportEvents(cb: (event: ImportEvent) => void): () => void {
  eventListeners.add(cb);
  return () => eventListeners.delete(cb);
}

const emit = (event: ImportEvent) => eventListeners.forEach((cb) => cb(event));

const patchJob = (id: string, patch: Partial<ImportJob>) => {
  jobs = jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));
  persist();
};

type NewJob =
  | { kind: 'url'; url: string }
  | { kind: 'text'; text: string }
  | { kind: 'photo'; dataUrl: string; fileName: string };

export function enqueueImport(spec: NewJob): ImportJob {
  const id = `imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const job: ImportJob = {
    id,
    kind: spec.kind,
    label: spec.kind === 'url' ? spec.url : spec.kind === 'text' ? 'Pasted text' : spec.fileName,
    status: 'queued',
    createdAt: new Date().toISOString(),
    url: spec.kind === 'url' ? spec.url : undefined,
    text: spec.kind === 'text' ? spec.text : undefined,
  };
  if (spec.kind === 'photo') photoPayloads.set(id, { dataUrl: spec.dataUrl, fileName: spec.fileName });
  jobs = [...jobs, job];
  persist();
  startImportQueue();
  return job;
}

export function retryImport(id: string): void {
  const job = jobs.find((j) => j.id === id);
  if (!job || job.status !== 'failed') return;
  if (job.kind === 'photo' && !photoPayloads.has(id) && !job.imageUrl) return; // the photo is gone, add it again
  patchJob(id, { status: 'queued', error: undefined, remote: undefined });
  startImportQueue();
}

export function dismissImport(id: string): void {
  jobs = jobs.filter((j) => j.id !== id);
  photoPayloads.delete(id);
  persist();
}

export function startImportQueue(): void {
  if (running) return;
  running = true;
  void (async () => {
    try {
      for (;;) {
        const next = jobs.find((j) => j.status === 'queued');
        if (!next) return;
        await processJob(next);
      }
    } finally {
      running = false;
    }
  })();
}

// The AI is sometimes busy (503) or rate limited (429): wait and try again before giving up
async function withRetries<T>(call: () => Promise<T>, setMethod: (m: string) => void, method: string): Promise<T> {
  const waits = [15000, 45000, 90000];
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (e) {
      if (classifyGeminiError(e) !== 'transient' || attempt >= waits.length) throw e;
      setMethod(`${method} (busy, trying again in ${waits[attempt] / 1000}s)`);
      await new Promise((r) => setTimeout(r, waits[attempt]));
      setMethod(method);
    }
  }
}

async function parseJob(job: ImportJob, setMethod: (m: string) => void): Promise<Partial<Recipe>> {
  if (job.kind === 'url') {
    const { recipe, method } = await parseUrlToRecipe(job.url!, setMethod);
    setMethod(method);
    return { ...recipe, sourceUrl: recipe.sourceUrl || job.url };
  }

  if (job.kind === 'text') {
    const text = job.text!;
    setMethod('Pasted text');
    let parsed = parseHtmlContentToRecipe(text, 'Pasted Recipe');
    if (!isUsableRecipe(parsed)) parsed = parseRawTextToRecipe(text);
    if (isUsableRecipe(parsed)) return parsed;
    // The built-in readers found no recipe: let Gemini try, when a key is available.
    if (await isGeminiAvailable()) {
      setMethod('Gemini (pasted text)');
      return parseRecipeWithGemini(text.slice(0, 60000), false);
    }
    throw new Error('Could not find a recipe in the pasted text.');
  }

  // photo
  const photo = photoPayloads.get(job.id);
  if (!photo) throw new Error('The photo is no longer available. Add it again.');
  // Photos are read by the AI model only: the old text scanner (Tesseract) misread cookbook pages badly
  // (wrong language model, merged columns), and a junk recipe is worse than a clear error you can retry.
  if (!(await isGeminiAvailable())) {
    throw new Error('Reading a photo needs the AI key. Add one in Settings, then retry.');
  }
  setMethod('AI vision');
  const parsed = await withRetries(() => parseRecipeWithGemini(photo.dataUrl, true), setMethod, 'AI vision');
  // The photo stays with the recipe as its source (when there is a server to keep it); the picture is a search result
  const sourceImage = (await uploadDataUrl(photo.dataUrl)) || undefined;
  return { ...parsed, sourceImage };
}

// Photos are read by the server when there is one: it keeps going when the app is closed.
async function handOffToServer(job: ImportJob): Promise<boolean> {
  const info = await fetchServerWork();
  if (!info?.enabled) return false;
  const photo = photoPayloads.get(job.id);
  const imageUrl = job.imageUrl || (photo ? await uploadDataUrl(photo.dataUrl) : null);
  if (!imageUrl) return false;
  if (!(await registerServerImport(job.id, imageUrl, job.label))) return false;
  patchJob(job.id, { status: 'running', remote: true, imageUrl, error: undefined });
  photoPayloads.delete(job.id);
  // the translation queue's server loop collects the result, now and after a reload
  startTranslationQueue();
  return true;
}

// Build and save the recipe from what was read. Shared by the in-page import and the server's result.
function saveImportedRecipe(parsed: Partial<Recipe>, id: string, image: string): Recipe {
  const sections = dropDefaultSeasoningAmounts(parsed.ingredientSections || []);
  // live: you are waiting for this one, so it is translated and annotated now, not in the background batch
  const recipe: Recipe = withPendingTranslation({
    id,
    title: parsed.title || 'Imported Recipe',
    description: parsed.description || '',
    category: parsed.category || 'Main',
    prepTime: parsed.prepTime || 15,
    cookTime: parsed.cookTime || 20,
    servings: parsed.servings || 4,
    image,
    sourceUrl: parsed.sourceUrl,
    sourceImage: parsed.sourceImage,
    ingredientSections: sections,
    instructions: parsed.instructions || [],
    tags: parsed.tags || ['Imported'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
  }, true);
  saveStoredRecipes([recipe, ...getStoredRecipes()]);
  return recipe;
}

// Look for a picture of the dish (the photo of the page stays as the source) and swap it in unless the recipe was edited meanwhile
async function replaceWithDishImage(recipe: Recipe): Promise<void> {
  try {
    const found = await findImageForRecipe(recipe.title, recipe.category, undefined, recipe.tags || []);
    if (!found || found === recipe.image) return;
    const all = getStoredRecipes();
    const current = all.find((r) => r.id === recipe.id);
    if (!current || current.image !== recipe.image) return;
    saveStoredRecipes(all.map((r) => (r.id === recipe.id ? { ...r, image: found } : r)));
  } catch {
    // the photo stays as the picture
  }
}

/** The server finished (or gave up on) a photo import: save the recipe or report the failure. */
export function completeServerImport(patch: Extract<ServerPatch, { kind: 'p' }>): void {
  const job = jobs.find((j) => j.id === patch.id);
  const logBase = {
    id: `srv-${patch.key}-${patch.endedAt}`,
    kind: 'import' as const,
    label: patch.label || job?.label || 'Photo',
    method: patch.method || 'AI vision (server)',
    started: patch.startedAt,
    ended: patch.endedAt,
  };
  const drop = () => {
    jobs = jobs.filter((j) => j.id !== patch.id);
    persist();
  };

  if (patch.gaveUp || !patch.result) {
    const error = patch.error || 'The server could not read this photo.';
    recordLog({ ...logBase, status: 'failed', detail: error });
    if (job) {
      patchJob(job.id, { status: 'failed', error, remote: undefined });
      emit({ type: 'failed', job, error });
    }
    return;
  }

  const recipeId = `imp-${patch.id}`;
  if (getStoredRecipes().some((r) => r.id === recipeId)) return drop(); // already saved (another device or tab)
  // Saved right away with the photo as its picture; a nicer picture of the dish replaces it when one is found
  const recipe = saveImportedRecipe(patch.result, recipeId, patch.result.sourceImage || '');
  void replaceWithDishImage(recipe);
  recordLog({
    ...logBase,
    label: recipe.title,
    recipeId: recipe.id,
    status: 'done',
    detail: `${recipe.ingredientSections.flatMap((s) => s.items).length} ingredients, ${recipe.instructions.length} steps (read by the server)`,
  });
  drop();
  if (job) emit({ type: 'done', job, recipe });
}

async function processJob(job: ImportJob): Promise<void> {
  if (job.kind === 'photo' && (await handOffToServer(job))) return;
  patchJob(job.id, { status: 'running' });
  emit({ type: 'started', job });
  const logId = startLog('import', job.label);
  let method = '';
  const setMethod = (m: string) => {
    method = m;
    updateLog(logId, { method: m });
  };

  try {
    const parsed = await parseJob(job, setMethod);
    const title = parsed.title || 'Imported Recipe';
    const image = await findImageForRecipe(title, parsed.category || 'Main', parsed.image, parsed.tags || []);
    const recipe = saveImportedRecipe(parsed, `imported-${Date.now()}`, image);
    finishLog(logId, 'done', { label: title, recipeId: recipe.id, method, detail: `${recipe.ingredientSections.flatMap((s) => s.items).length} ingredients, ${recipe.instructions.length} steps` });
    jobs = jobs.filter((j) => j.id !== job.id);
    photoPayloads.delete(job.id);
    persist();
    emit({ type: 'done', job, recipe });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    finishLog(logId, 'failed', { method, detail: error });
    patchJob(job.id, { status: 'failed', error });
    emit({ type: 'failed', job, error });
  }
}
