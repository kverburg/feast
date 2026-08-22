import { createWorker } from 'tesseract.js';
import { Recipe, IngredientSection, IngredientItem, InstructionStep } from '../types/recipe';
import { convertCupToMetric, parsePureMetricIngredient, convertFahrenheitToCelsiusInText } from './unitConverterService';

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&frasl;/g, '/')
    .replace(/½/g, ' 1/2 ')
    .replace(/⅓/g, ' 1/3 ')
    .replace(/⅔/g, ' 2/3 ')
    .replace(/¼/g, ' 1/4 ')
    .replace(/¾/g, ' 3/4 ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseIsoDuration(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

// Helper to parse single ingredient line into quantity, unit, name, notes (100% Metric)
export function parseIngredientLine(line: string): IngredientItem {
  const result = parsePureMetricIngredient(line);
  return {
    id: `ing-parsed-${Math.random().toString(36).substr(2, 9)}`,
    amount: result.amount,
    unit: result.unit,
    name: result.name,
    notes: result.notes
  };
}

// Extract all text steps recursively from Schema.org recipeInstructions (handles HowToSection / HowToStep nested objects)
function extractInstructionSteps(rawInstructions: any[]): InstructionStep[] {
  const stepTexts: string[] = [];

  function recurse(item: any) {
    if (!item) return;

    if (typeof item === 'string') {
      const clean = convertFahrenheitToCelsiusInText(decodeHtmlEntities(item));
      if (clean.length > 2) stepTexts.push(clean);
      return;
    }

    if (Array.isArray(item)) {
      item.forEach(recurse);
      return;
    }

    // Handles HowToSection with itemListElement
    if (item['@type'] === 'HowToSection' || Array.isArray(item.itemListElement)) {
      if (item.itemListElement) {
        recurse(item.itemListElement);
      }
      return;
    }

    // Handles HowToStep
    const textVal = item.text || item.name || item.description || '';
    if (typeof textVal === 'string') {
      const clean = convertFahrenheitToCelsiusInText(decodeHtmlEntities(textVal));
      if (clean.length > 2) stepTexts.push(clean);
    }
  }

  recurse(rawInstructions);

  return stepTexts.map((text, idx) => {
    // Detect timers (e.g. "Bake for 15 minutes", "Rest for 60 minutes")
    let timerMinutes: number | undefined = undefined;
    const timerMatch = text.match(/(?:bake|cook|boil|simmer|roast|rest|chill|leave|rise|heat)\s+(?:for\s+)?(\d+)\s*(?:min|mins|minutes|hour|hours)/i);
    if (timerMatch) {
      const val = parseInt(timerMatch[1], 10);
      timerMinutes = text.toLowerCase().includes('hour') ? val * 60 : val;
    }

    return {
      id: `st-parsed-${idx + 1}`,
      stepNumber: idx + 1,
      text,
      timerMinutes
    };
  });
}

// Parse structured raw text (from OCR or text paste) into sections and steps
export function parseRawTextToRecipe(text: string): Partial<Recipe> {
  const lines = text.split('\n').map(l => decodeHtmlEntities(l)).filter(Boolean);
  
  let title = 'Imported Recipe';
  let description = '';
  let servings = 4;
  let prepTime = 15;
  let cookTime = 25;
  
  const ingredientSections: IngredientSection[] = [];
  let currentSection: IngredientSection = {
    id: 'sec-main',
    title: 'Ingredients',
    items: []
  };

  const instructions: InstructionStep[] = [];
  let isParsingInstructions = false;
  let stepCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect title from first non-empty line
    if (i === 0 && line.length < 90 && !line.match(/ingredient|instruction|method|step|servings/i)) {
      title = line;
      continue;
    }

    // Detect servings
    const servingsMatch = line.match(/(?:serves|servings|yield|portions):\s*(\d+)/i);
    if (servingsMatch) {
      servings = parseInt(servingsMatch[1], 10);
      continue;
    }

    // Detect times
    const timeMatch = line.match(/(?:prep|cook|total)\s*time:\s*(\d+)\s*(?:min|mins|minutes)?/i);
    if (timeMatch) {
      const timeVal = parseInt(timeMatch[1], 10);
      if (line.toLowerCase().includes('prep')) prepTime = timeVal;
      else cookTime = timeVal;
      continue;
    }

    // Detect Section Header for Ingredients
    const isSectionHeader = line.match(/^(?:for the|for|part\s*\d+:?|section\s*\d+:?|[\w\s]+ingredients?:?)$/i) ||
                           (line.endsWith(':') && !line.match(/prep|cook|servings|instructions|steps|method/i));
    
    if (isSectionHeader && !isParsingInstructions) {
      if (currentSection.items.length > 0) {
        ingredientSections.push(currentSection);
      }
      currentSection = {
        id: `sec-${Math.random().toString(36).substr(2, 7)}`,
        title: line.replace(':', '').trim(),
        items: []
      };
      continue;
    }

    // Detect transition to instructions/method
    if (line.match(/^(?:instructions|method|directions|steps|preparation):?/i)) {
      isParsingInstructions = true;
      if (currentSection.items.length > 0) {
        ingredientSections.push(currentSection);
      }
      continue;
    }

    if (isParsingInstructions) {
      const stepText = line.replace(/^(?:\d+[\.\)]|step\s*\d+:?)\s*/i, '').trim();
      if (stepText.length > 3) {
        let timerMinutes: number | undefined = undefined;
        const timerMatch = stepText.match(/(?:bake|cook|boil|simmer|roast|rest|chill|leave)\s+(?:for\s+)?(\d+)\s*(?:min|mins|minutes)/i);
        if (timerMatch) {
          timerMinutes = parseInt(timerMatch[1], 10);
        }

        instructions.push({
          id: `st-parsed-${stepCounter}`,
          stepNumber: stepCounter++,
          text: stepText,
          timerMinutes
        });
      }
    } else {
      if (line.length > 2) {
        currentSection.items.push(parseIngredientLine(line));
      }
    }
  }

  if (currentSection.items.length > 0 && !ingredientSections.includes(currentSection)) {
    ingredientSections.push(currentSection);
  }

  if (ingredientSections.length === 0) {
    ingredientSections.push({
      id: 'sec-default',
      title: 'Ingredients',
      items: [
        { id: 'ing-1', amount: 1, unit: 'tbsp', name: 'Sample Ingredient' }
      ]
    });
  }

  if (instructions.length === 0) {
    instructions.push({
      id: 'st-1',
      stepNumber: 1,
      text: 'Follow cooking instructions as per recipe source.'
    });
  }

  return {
    title,
    description,
    servings,
    prepTime,
    cookTime,
    ingredientSections,
    instructions,
    category: 'Main',
    tags: ['Imported'],
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80'
  };
}

// Optical Character Recognition (OCR) Photo Parser using Tesseract.js
export async function parsePhotoToRecipe(
  imageFile: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<Partial<Recipe>> {
  try {
    if (onProgress) onProgress(10, 'Initializing OCR Engine...');

    const worker = await createWorker('eng');
    if (onProgress) onProgress(40, 'Scanning & Extracting Text from Image...');

    const ret = await worker.recognize(imageFile);
    if (onProgress) onProgress(85, 'Analyzing Recipe Parts & Ingredients...');

    const rawText = ret.data.text;
    await worker.terminate();

    if (onProgress) onProgress(100, 'Parsing Complete!');

    return parseRawTextToRecipe(rawText);
  } catch (error) {
    console.error('OCR Parsing Error:', error);
    throw new Error('Failed to extract text from photo. Please try a clearer image or paste text manually.');
  }
}

// Extract Recipe JSON object from HTML string (finds Schema.org JSON-LD or Microdata)
export function parseHtmlContentToRecipe(htmlContent: string, sourceUrl?: string): Partial<Recipe> | null {
  try {
    // 1. Search for <script type="application/ld+json"> script tags
    const ldScriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = ldScriptRegex.exec(htmlContent)) !== null) {
      const jsonStr = match[1].trim();
      try {
        const parsedJson = JSON.parse(jsonStr);

        // Helper to find Recipe object inside JSON-LD graph or array
        const findRecipeObj = (obj: any): any => {
          if (!obj) return null;
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const res = findRecipeObj(item);
              if (res) return res;
            }
            return null;
          }
          if (obj['@type'] === 'Recipe' || (Array.isArray(obj['@type']) && obj['@type'].includes('Recipe'))) {
            return obj;
          }
          if (obj['@graph']) {
            return findRecipeObj(obj['@graph']);
          }
          return null;
        };

        const recipeObj = findRecipeObj(parsedJson);

        if (recipeObj) {
          const title = decodeHtmlEntities(recipeObj.name || 'Imported Recipe');
          const description = decodeHtmlEntities(recipeObj.description || '');
          
          let servings = 4;
          if (recipeObj.recipeYield) {
            const y = Array.isArray(recipeObj.recipeYield) ? recipeObj.recipeYield[0] : recipeObj.recipeYield;
            const yMatch = String(y).match(/\d+/);
            if (yMatch) servings = parseInt(yMatch[0], 10);
          }

          const prepTime = parseIsoDuration(recipeObj.prepTime) || 15;
          const cookTime = parseIsoDuration(recipeObj.cookTime) || 20;

          let image = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
          if (recipeObj.image) {
            if (typeof recipeObj.image === 'string') image = recipeObj.image;
            else if (Array.isArray(recipeObj.image)) image = typeof recipeObj.image[0] === 'string' ? recipeObj.image[0] : (recipeObj.image[0]?.url || image);
            else if (recipeObj.image.url) image = recipeObj.image.url;
          }

          // Parse Ingredients into Sections / Parts
          const rawIngredients: string[] = recipeObj.recipeIngredient || [];
          const ingredientSections: IngredientSection[] = [];
          let currentSection: IngredientSection = {
            id: 'sec-1',
            title: 'Ingredients',
            items: []
          };

          rawIngredients.forEach((ingStr) => {
            const cleanIng = decodeHtmlEntities(ingStr);
            if (cleanIng.endsWith(':') || cleanIng.toLowerCase().startsWith('for the') || cleanIng.toLowerCase().startsWith('part')) {
              if (currentSection.items.length > 0) ingredientSections.push(currentSection);
              currentSection = {
                id: `sec-${Math.random().toString(36).substr(2, 6)}`,
                title: cleanIng.replace(':', '').trim(),
                items: []
              };
            } else {
              currentSection.items.push(parseIngredientLine(cleanIng));
            }
          });

          if (currentSection.items.length > 0 && !ingredientSections.includes(currentSection)) {
            ingredientSections.push(currentSection);
          }

          // Parse Instructions recursively
          const instructions = extractInstructionSteps(recipeObj.recipeInstructions || []);

          return {
            title,
            description,
            servings,
            prepTime,
            cookTime,
            image,
            sourceUrl,
            ingredientSections,
            instructions: instructions.length > 0 ? instructions : [
              { id: 'st-1', stepNumber: 1, text: 'Follow instructions as per recipe source.' }
            ],
            category: 'Main',
            tags: ['Web Import']
          };
        }
      } catch (err) {
        // Skip invalid JSON block
      }
    }

    // 2. DOM Scraper Fallback if JSON-LD tag was not present
    return parseRawTextToRecipe(htmlContent);
  } catch (error) {
    console.error('HTML parsing error:', error);
    return null;
  }
}

// Multi-Proxy Web URL Recipe Parser
export async function parseUrlToRecipe(url: string): Promise<Partial<Recipe>> {
  const proxies = [
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  let responseText = '';

  for (const proxyFn of proxies) {
    try {
      const proxyUrl = proxyFn(url);
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 500) {
          responseText = text;
          break;
        }
      }
    } catch (e) {
      // Try next proxy
    }
  }

  if (responseText) {
    const parsed = parseHtmlContentToRecipe(responseText, url);
    if (parsed) return parsed;
  }

  // If live proxy fetching failed, return helpful message placeholder
  throw new Error('Unable to automatically fetch URL due to website CORS restrictions. Please switch to the "Paste HTML/Text" option below to parse instantly!');
}
