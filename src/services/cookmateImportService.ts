import { Recipe, IngredientSection, InstructionStep } from '../types/recipe';
import { parseIngredientLine } from './recipeParserService';
import { withPendingTranslation } from './translationService';
import { findImageForRecipe } from './imageSearchService';

function parseDurationString(str: string): number {
  if (!str) return 0;
  const s = str.trim().toLowerCase();
  
  // Format like "1h30m", "1h", "40m", "20"
  let minutes = 0;
  const hMatch = s.match(/(\d+)\s*h(?:our|ours|r|rs)?/);
  if (hMatch) {
    minutes += parseInt(hMatch[1], 10) * 60;
  }
  const mMatch = s.match(/(\d+)\s*m(?:in|ins|inute|inutes)?/);
  if (mMatch) {
    minutes += parseInt(mMatch[1], 10);
  } else if (!hMatch) {
    // If just digits like "20" or "40"
    const digitMatch = s.match(/^(\d+)$/);
    if (digitMatch) {
      minutes = parseInt(digitMatch[1], 10);
    }
  }
  return minutes;
}

function mapCookmateCategory(cat: string): Recipe['category'] {
  const c = (cat || '').toLowerCase().trim();
  if (c.includes('toetje') || c.includes('dessert')) return 'Dessert';
  if (c.includes('koek') || c.includes('baking') || c.includes('bakken')) return 'Baking';
  if (c.includes('voorgerecht') || c.includes('appetizer')) return 'Appetizer';
  if (c.includes('ontbijt') || c.includes('breakfast')) return 'Breakfast';
  if (c.includes('drank') || c.includes('beverage')) return 'Beverage';
  if (c.includes('bijgerecht') || c.includes('side')) return 'Side';
  if (c.includes('saus') || c.includes('sauce')) return 'Sauce';
  return 'Main';
}

function cleanHtmlTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function parseCookmateXml(xmlString: string): Promise<Recipe[]> {
  const recipeBlocks = xmlString.split('<recipe>').slice(1);
  const recipes: Recipe[] = [];

  for (let idx = 0; idx < recipeBlocks.length; idx++) {
    const rawBlock = recipeBlocks[idx].split('</recipe>')[0];

    const getField = (tag: string): string => {
      const match = rawBlock.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
      return match ? cleanHtmlTags(match[1]) : '';
    };

    const title = getField('title') || `Recipe ${idx + 1}`;
    const description = getField('description');
    const preptime = parseDurationString(getField('preptime'));
    const cooktime = parseDurationString(getField('cooktime'));
    const totaltime = parseDurationString(getField('totaltime'));
    const prepTime = preptime || 15;
    const cookTime = cooktime || (totaltime > prepTime ? totaltime - prepTime : 20);

    const quantityStr = getField('quantity');
    const qMatch = quantityStr.match(/\d+/);
    const servings = qMatch ? parseInt(qMatch[0], 10) : 4;

    const sourceUrl = getField('url') || undefined;
    const sourceName = getField('source') || undefined;
    const category = mapCookmateCategory(getField('category'));
    const imageurl = getField('imageurl');
    // Use image search service to find a photo if imageurl is absent or a local Android file path
    const image = await findImageForRecipe(title, category, imageurl, [getField('category')].filter(Boolean));
    const lang = getField('lang').toLowerCase();

    // Parse ingredients <li>...</li>
    const ingBlockMatch = rawBlock.match(/<ingredient>(.*?)<\/ingredient>/s);
    const ingredientLines: string[] = [];
    if (ingBlockMatch) {
      const liMatches = ingBlockMatch[1].matchAll(/<li>(.*?)<\/li>/gs);
      for (const m of liMatches) {
        const cleaned = cleanHtmlTags(m[1]);
        if (cleaned) ingredientLines.push(cleaned);
      }
    }

    // Split into sections if any section indicators exist (e.g. lines starting with "Voor ..." or ending with ":")
    const ingredientSections: IngredientSection[] = [];
    let currentSectionTitle = 'Ingrediënten';
    let currentItems: any[] = [];

    for (const line of ingredientLines) {
      const isHeader = line.endsWith(':') || /^Voor\s+/i.test(line) || /^For\s+/i.test(line);
      if (isHeader) {
        if (currentItems.length > 0) {
          ingredientSections.push({
            id: `sec-${Math.random().toString(36).substr(2, 7)}`,
            title: currentSectionTitle,
            items: currentItems,
          });
          currentItems = [];
        }
        currentSectionTitle = line.replace(/:$/, '').trim();
      } else {
        currentItems.push(parseIngredientLine(line));
      }
    }
    if (currentItems.length > 0) {
      ingredientSections.push({
        id: `sec-${Math.random().toString(36).substr(2, 7)}`,
        title: currentSectionTitle,
        items: currentItems,
      });
    }

    // Parse instructions <li>...</li>
    const textBlockMatch = rawBlock.match(/<recipetext>(.*?)<\/recipetext>/s);
    const instructionSteps: InstructionStep[] = [];
    let stepNum = 1;
    if (textBlockMatch) {
      const liMatches = textBlockMatch[1].matchAll(/<li>(.*?)<\/li>/gs);
      for (const m of liMatches) {
        const text = cleanHtmlTags(m[1]);
        if (text) {
          let timerMinutes: number | undefined;
          const timerMatch = text.match(/(?:bake|cook|boil|simmer|roast|rest|chill|leave|rise|heat|bak|kook|sudderen|oven)\s+(?:for\s+|gedurende\s+)?(\d+)\s*(?:min|mins|minutes|minuten|uur|hour|hours)/i);
          if (timerMatch) {
            const val = parseInt(timerMatch[1], 10);
            timerMinutes = (text.toLowerCase().includes('hour') || text.toLowerCase().includes('uur')) ? val * 60 : val;
          }

          instructionSteps.push({
            id: `st-${idx}-${stepNum}`,
            stepNumber: stepNum++,
            text,
            timerMinutes,
          });
        }
      }
    }

    const baseRecipe: Recipe = {
      id: `cookmate-${Date.now()}-${idx}`,
      title,
      description,
      category,
      prepTime,
      cookTime,
      servings,
      image,
      sourceUrl,
      sourceName,
      ingredientSections: ingredientSections.length > 0 ? ingredientSections : [
        { id: `sec-default-${idx}`, title: 'Ingrediënten', items: [] }
      ],
      instructions: instructionSteps.length > 0 ? instructionSteps : [
        { id: `st-def-${idx}`, stepNumber: 1, text: 'Bereid het recept volgens aanwijzingen.' }
      ],
      tags: ['Cookmate'],
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    // English recipes are queued for Gemini translation to Dutch (the English original is kept)
    const isEnglish = lang === 'en' || (!lang && /^(apple|banana|pie|chicken|beef|pasta|cookie|bread|cake)/i.test(title));
    recipes.push(isEnglish ? withPendingTranslation(baseRecipe) : baseRecipe);

  }

  return recipes;
}
