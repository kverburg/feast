import { Recipe } from '../types/recipe';
import { fetchPageText, htmlToText } from './recipeParserService';
import { parseRecipeWithGemini, GeminiUnavailableError } from './geminiService';
import { startLog, updateLog, finishLog } from './activityLog';

const MAX_CHARS = 60000;

/**
 * "Re-parse from source with AI": read the recipe again from its source page (or pasted text)
 * with Gemini. Returns the parsed recipe; the caller decides what to do with it.
 */
export async function reparseFromSource(source: { url: string } | { text: string }): Promise<Partial<Recipe>> {
  const logId = startLog('reparse', 'url' in source ? source.url : 'Pasted text');
  try {
    let text: string;
    let method: string;
    if ('url' in source) {
      ({ text, method } = await fetchPageText(source.url));
    } else {
      text = /<\/?[a-z][\s\S]*>/i.test(source.text) ? htmlToText(source.text) : source.text;
      method = 'Pasted text';
    }
    updateLog(logId, { method: `${method} + Gemini` });
    const parsed = await parseRecipeWithGemini(text.slice(0, MAX_CHARS), false);
    const ingredients = (parsed.ingredientSections || []).flatMap((s) => s.items).length;
    finishLog(logId, 'done', { label: parsed.title || undefined, detail: `${ingredients} ingredients, ${parsed.instructions?.length || 0} steps` });
    return parsed;
  } catch (e) {
    const message =
      e instanceof GeminiUnavailableError
        ? 'No Gemini API key available. Add one in Settings.'
        : e instanceof Error
          ? e.message
          : String(e);
    finishLog(logId, 'failed', { detail: message });
    throw new Error(message);
  }
}
