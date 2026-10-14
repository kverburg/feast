import { Recipe } from '../types/recipe';
import {
  parseUrlToRecipe,
  parsePhotoToRecipe,
  parseHtmlContentToRecipe,
  parseRawTextToRecipe,
  isUsableRecipe,
} from './recipeParserService';
import { parseRecipeWithGemini, isGeminiAvailable } from './geminiService';
import { findImageForRecipe } from './imageSearchService';
import { withPendingTranslation } from './translationService';
import { getStoredRecipes, saveStoredRecipes } from './storageService';
import { startLog, updateLog, finishLog } from './activityLog';

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
      j.kind === 'photo' && j.status !== 'failed'
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
  if (job.kind === 'photo' && !photoPayloads.has(id)) return; // the photo is gone, add it again
  patchJob(id, { status: 'queued', error: undefined });
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
  let parsed: Partial<Recipe>;
  if (await isGeminiAvailable()) {
    try {
      setMethod('Gemini vision');
      parsed = await parseRecipeWithGemini(photo.dataUrl, true);
    } catch {
      setMethod('OCR (Tesseract)');
      parsed = await parsePhotoToRecipe(photo.dataUrl);
    }
  } else {
    setMethod('OCR (Tesseract)');
    parsed = await parsePhotoToRecipe(photo.dataUrl);
  }
  return { ...parsed, image: photo.dataUrl };
}

async function processJob(job: ImportJob): Promise<void> {
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
    const category = parsed.category || 'Main';
    const title = parsed.title || 'Imported Recipe';
    const image = await findImageForRecipe(title, category, parsed.image, parsed.tags || []);

    // live: you are waiting for this one, so it is translated and annotated now, not in the background batch
    const recipe: Recipe = withPendingTranslation({
      id: `imported-${Date.now()}`,
      title,
      description: parsed.description || '',
      category,
      prepTime: parsed.prepTime || 15,
      cookTime: parsed.cookTime || 20,
      servings: parsed.servings || 4,
      image,
      sourceUrl: parsed.sourceUrl,
      ingredientSections: parsed.ingredientSections || [],
      instructions: parsed.instructions || [],
      tags: parsed.tags || ['Imported'],
      isFavorite: false,
      createdAt: new Date().toISOString(),
    }, true);

    saveStoredRecipes([recipe, ...getStoredRecipes()]);
    finishLog(logId, 'done', { label: title, method, detail: `${recipe.ingredientSections.flatMap((s) => s.items).length} ingredients, ${recipe.instructions.length} steps` });
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
