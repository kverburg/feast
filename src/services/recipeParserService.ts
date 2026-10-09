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
    // Unwrap JSON wrapper if proxy returned { contents: "<html>..." }
    if (htmlContent.trim().startsWith('{') && htmlContent.includes('"contents":')) {
      try {
        const parsedObj = JSON.parse(htmlContent);
        if (parsedObj.contents && typeof parsedObj.contents === 'string') {
          htmlContent = parsedObj.contents;
        }
      } catch (e) {}
    }

    // 1. Search for <script type="application/ld+json"> script tags
    const ldScriptRegex = /<script[^>]*type=[\"'\\]*application\/ld\+json[\"'\\]*>[^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = ldScriptRegex.exec(htmlContent)) !== null) {
      let jsonStr = match[1].trim();
      try {
        // Sanitize control characters that break JSON.parse
        jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, ' ');
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
            const rawYield = Array.isArray(recipeObj.recipeYield) ? recipeObj.recipeYield[0] : (recipeObj.recipeYield.value || recipeObj.recipeYield);
            const yMatch = String(rawYield).match(/\d+/);
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

// ---------------------------------------------------------------------------
// Jina AI Markdown Parser – parses the clean markdown returned by r.jina.ai
// ---------------------------------------------------------------------------
function parseJinaMarkdownToRecipe(markdown: string, sourceUrl?: string): Partial<Recipe> | null {
  const lines = markdown.split('\n').map(l => l.trim()).filter(Boolean);

  // Title
  let title = 'Imported Recipe';
  for (const l of lines) {
    const m = l.match(/^Title:\s*(.+)/i);
    if (m) { title = m[1].trim(); break; }
    if (l.startsWith('# ')) { title = l.replace(/^#+\s*/, '').trim(); break; }
  }

  // Description (block after ### Description heading)
  let description = '';
  const descIdx = lines.findIndex(l => /^#+\s*description/i.test(l));
  if (descIdx !== -1 && lines[descIdx + 1]) {
    description = lines[descIdx + 1].replace(/[_*]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
  }

  // First image
  let image = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
  for (const l of lines) {
    const m = l.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/);
    if (m) { image = m[1]; break; }
  }

  // Times / servings from full text
  let servings = 4;
  let prepTime = 15;
  let cookTime = 25;
  const fullText = lines.join(' ');
  const servMatch = fullText.match(/(?:yield[s]?|serves?|servings?)[:\s]+(\d+)/i);
  if (servMatch) servings = parseInt(servMatch[1], 10);
  const prepMatch = fullText.match(/prep\s*time[:\s]+(\d+)/i);
  if (prepMatch) prepTime = parseInt(prepMatch[1], 10);
  const cookMatch = fullText.match(/cook\s*time[:\s]+(\d+)/i);
  if (cookMatch) cookTime = parseInt(cookMatch[1], 10);

  function cleanMarkdown(s: string): string {
    return s
      .replace(/\[([^\]]+)\]\([^)]+\)/g, (_, text) => text)
      .replace(/[*_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stripListPrefix(l: string): string {
    return l.replace(/^([*\-\s]|\[\s*[xX]?\s*\])+/, '').trim();
  }

  function looksLikeIngredient(l: string): boolean {
    const clean = cleanMarkdown(stripListPrefix(l));
    return /^\d|^[¼½¾⅓⅔]|^\d+\s*\/\s*\d+|^(?:a |an |some |pinch|dash|handful|splash|few|sprinkle|extra)/i.test(clean);
  }

  // Find dedicated Ingredients and Instructions section anchors in the recipe card
  let ingSectionIdx = lines.findIndex(l => /^#+\s*ingredients/i.test(l));
  let instSectionIdx = lines.findIndex(l => /^#+\s*(?:instructions|directions|method|preparation)/i.test(l));

  // If no explicit "### Ingredients" header, look for "### Description" or first ingredient-like header
  let recipeCardStart = ingSectionIdx !== -1 ? ingSectionIdx + 1 : 0;
  if (ingSectionIdx === -1) {
    const dIdx = lines.findIndex(l => /^#+\s*description/i.test(l));
    if (dIdx !== -1) {
      recipeCardStart = dIdx;
    } else {
      for (let i = 0; i < lines.length; i++) {
        if (/^#{2,4}\s/.test(lines[i])) {
          for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
            if (looksLikeIngredient(lines[j])) {
              recipeCardStart = i;
              break;
            }
          }
          if (recipeCardStart > 0) break;
        }
      }
    }
  }

  const ingSearchEnd = instSectionIdx !== -1 ? instSectionIdx : lines.length;

  // Pass 1: Parse ingredient sections between recipeCardStart and Instructions
  const ingredientSections: IngredientSection[] = [];
  let currentSectionTitle = 'Ingredients';
  let currentItems: IngredientItem[] = [];

  for (let i = recipeCardStart; i < ingSearchEnd; i++) {
    const l = lines[i];

    if (l === '* * *' || l === '---' || /cook\s*mode/i.test(l)) {
      if (currentItems.length > 0) {
        ingredientSections.push({
          id: `sec-${Math.random().toString(36).substr(2, 6)}`,
          title: currentSectionTitle,
          items: currentItems
        });
        currentItems = [];
      }
      continue;
    }

    // Section headings like #### Dough, #### Toppings
    const headingMatch = l.match(/^#{3,5}\s+(.+)/);
    if (headingMatch) {
      const h = headingMatch[1].replace(/:$/, '').trim();
      if (!h.match(/description|note|tip|instruction|keyword|author|rating|print/i) && h.length < 80) {
        if (currentItems.length > 0) {
          ingredientSections.push({
            id: `sec-${Math.random().toString(36).substr(2, 6)}`,
            title: currentSectionTitle,
            items: currentItems
          });
          currentItems = [];
        }
        currentSectionTitle = h;
      }
      continue;
    }

    if (looksLikeIngredient(l)) {
      const raw = cleanMarkdown(stripListPrefix(l));
      if (raw.length > 2) {
        currentItems.push(parseIngredientLine(convertFahrenheitToCelsiusInText(raw)));
      }
    }
  }

  if (currentItems.length > 0) {
    ingredientSections.push({
      id: `sec-${Math.random().toString(36).substr(2, 6)}`,
      title: currentSectionTitle,
      items: currentItems
    });
  }

  // Pass 2: Parse numbered instruction steps strictly within the Instructions section
  const instructionSteps: string[] = [];
  const instStartIdx = instSectionIdx !== -1 ? instSectionIdx + 1 : 0;
  const instEndIdx = lines.findIndex((l, idx) => idx > instStartIdx && /^#+\s*(?:notes|nutrition|faq|comments)/i.test(l));
  const finalInstEnd = instEndIdx !== -1 ? instEndIdx : lines.length;

  for (let i = instStartIdx; i < finalInstEnd; i++) {
    const l = lines[i];
    const stepMatch = l.match(/^(\d+)\.\s{1,8}(.+)/);
    if (stepMatch) {
      const text = cleanMarkdown(stepMatch[2]);
      if (text.length > 10) {
        instructionSteps.push(text);
      }
    }
  }

  if (ingredientSections.length === 0 && instructionSteps.length === 0) return null;

  const instructions: InstructionStep[] = instructionSteps.map((text, idx) => {
    let timerMinutes: number | undefined;
    const timerMatch = text.match(/(?:bake|cook|boil|simmer|roast|rest|chill|rise|heat|knead)\s+(?:for\s+)?(\d+)[\s-]*(?:to[\s-]*(\d+)\s*)?(?:min|mins|minutes|hour|hours)/i);
    if (timerMatch) {
      const val = parseInt(timerMatch[2] || timerMatch[1], 10);
      timerMinutes = text.toLowerCase().includes('hour') ? val * 60 : val;
    }
    return { id: `st-parsed-${idx + 1}`, stepNumber: idx + 1, text: convertFahrenheitToCelsiusInText(text), timerMinutes };
  });

  return {
    title,
    description,
    servings,
    prepTime,
    cookTime,
    image,
    sourceUrl,
    ingredientSections: ingredientSections.length > 0 ? ingredientSections : [{ id: 'sec-1', title: 'Ingredients', items: [{ id: 'ing-1', amount: 1, unit: '', name: 'See source recipe' }] }],
    instructions: instructions.length > 0 ? instructions : [{ id: 'st-1', stepNumber: 1, text: 'Follow instructions as per recipe source.' }],
    category: 'Main',
    tags: ['Web Import'],
  };
}

// ---------------------------------------------------------------------------
// Multi-Proxy Web URL Recipe Parser
// Primary: Jina AI reader (bypasses bot protection, free, no key needed)
// Fallback: HTML proxies for non-protected sites
// ---------------------------------------------------------------------------
export async function parseUrlToRecipe(url: string): Promise<Partial<Recipe>> {
  // --- Primary: Jina AI reader ---
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'markdown' },
    });
    if (jinaRes.ok) {
      const markdown = await jinaRes.text();
      if (markdown && markdown.length > 300) {
        const parsed = parseJinaMarkdownToRecipe(markdown, url);
        if (parsed && ((parsed.ingredientSections?.some(s => s.items.length > 0)) || (parsed.instructions?.length ?? 0) > 1)) {
          return parsed;
        }
      }
    }
  } catch (_) { /* fall through to HTML proxies */ }

  // --- Fallback: HTML proxy list ---
  const proxyFns: Array<(u: string) => Promise<string>> = [
    async (u) => {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`);
      if (!res.ok) return '';
      const data = await res.json();
      return data.contents || '';
    },
    async (u) => {
      const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`);
      return res.ok ? await res.text() : '';
    },
    async (u) => {
      const res = await fetch(`https://cors-get-proxy.sirnev.workers.dev/?url=${encodeURIComponent(u)}`);
      return res.ok ? await res.text() : '';
    },
    async (u) => {
      const res = await fetch(`https://htmlproxy.site/?url=${encodeURIComponent(u)}`);
      return res.ok ? await res.text() : '';
    },
  ];

  for (const proxyFn of proxyFns) {
    try {
      const text = await proxyFn(url);
      if (text && text.length > 200) {
        const parsed = parseHtmlContentToRecipe(text, url);
        if (parsed && (parsed.ingredientSections?.length || parsed.instructions?.length)) {
          return parsed;
        }
      }
    } catch (_) { /* try next */ }
  }

  throw new Error('Unable to automatically fetch this URL. Please open it in a new tab, copy the page content, and use the "Paste HTML / Text" tab to import it.');
}


