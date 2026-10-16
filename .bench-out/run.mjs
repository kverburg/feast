// bench/run.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

// src/shared/geminiErrors.ts
var GeminiHttpError = class extends Error {
  constructor(status, detail) {
    super(`Gemini API returned status ${status}${detail ? `: ${summarizeDetail(detail)}` : ""}`);
    this.status = status;
    this.detail = detail;
  }
};
var summarizeDetail = (detail) => {
  try {
    const message = JSON.parse(detail)?.error?.message;
    if (typeof message === "string") return message.slice(0, 200);
  } catch {
  }
  return detail.slice(0, 200);
};

// worker/providers.js
var MISTRAL_BASE = "https://api.mistral.ai/v1";
var MISTRAL_DEFAULT_MODEL = "mistral-small-latest";
var providerFor = (env2, tier) => {
  const chosen = tier === "light" && env2.AI_PROVIDER_LIGHT || env2.AI_PROVIDER || "gemini";
  return chosen === "mistral" ? "mistral" : "gemini";
};
var mistralModelFor = (env2, tier) => tier === "light" && env2.MISTRAL_MODEL_LIGHT || env2.MISTRAL_MODEL || MISTRAL_DEFAULT_MODEL;
function toMistralRequest(body, model2) {
  const toContent = (parts) => {
    const out2 = [];
    for (const part of parts || []) {
      if (typeof part.text === "string") out2.push({ type: "text", text: part.text });
      else if (part.inlineData) out2.push({ type: "image_url", image_url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
    }
    return out2.length === 1 && out2[0].type === "text" ? out2[0].text : out2;
  };
  const messages = [];
  const system = body.systemInstruction?.parts?.map((p) => p.text || "").join("\n").trim();
  if (system) messages.push({ role: "system", content: system });
  for (const c of body.contents || []) messages.push({ role: c.role === "model" ? "assistant" : "user", content: toContent(c.parts) });
  const cfg = body.generationConfig || {};
  const out = { model: model2, messages };
  if (typeof cfg.temperature === "number") out.temperature = cfg.temperature;
  if (typeof cfg.maxOutputTokens === "number") out.max_tokens = cfg.maxOutputTokens;
  if (cfg.responseMimeType === "application/json") out.response_format = { type: "json_object" };
  return out;
}
function fromMistralResponse(data) {
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map((c) => c.text || "").join("") : content || "";
  return {
    candidates: [{ content: { parts: [{ text }] }, finishReason: data?.choices?.[0]?.finish_reason }],
    usageMetadata: data?.usage ? { promptTokenCount: data.usage.prompt_tokens, candidatesTokenCount: data.usage.completion_tokens, totalTokenCount: data.usage.total_tokens } : void 0
  };
}
async function mistralGenerate(env2, body, tier, log = () => {
}) {
  const model2 = mistralModelFor(env2, tier);
  const request = JSON.stringify(toMistralRequest(body, model2));
  const started = Date.now();
  const res = await fetch(`${env2.MISTRAL_BASE || MISTRAL_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env2.MISTRAL_API_KEY}` },
    body: request
  });
  const text = await res.text();
  log(res.ok ? "info" : "warn", {
    event: "ai_upstream",
    provider: "mistral",
    model: model2,
    status: res.status,
    ms: Date.now() - started,
    requestBytes: request.length,
    error: res.ok ? void 0 : text.slice(0, 300)
  });
  if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 500));
  return fromMistralResponse(JSON.parse(text));
}

// worker/gemini.js
var GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
var DEFAULT_MODEL = "gemini-flash-latest";
var LIGHT_MODEL = "gemini-flash-lite-latest";
var MAX_BODY_BYTES = 12 * 1024 * 1024;
function modelsFor(tier, env2) {
  const main = env2.GEMINI_MODEL || DEFAULT_MODEL;
  return tier === "light" ? [env2.GEMINI_MODEL_LIGHT || LIGHT_MODEL, main] : [main];
}
async function generateContent(env2, body, tier, log = () => {
}) {
  if (providerFor(env2, tier) === "mistral") return mistralGenerate(env2, body, tier, log);
  const bodyText = JSON.stringify(body);
  const models = modelsFor(tier, env2);
  for (let i = 0; i < models.length; i++) {
    const started = Date.now();
    const res = await fetch(`${env2.GEMINI_BASE || GEMINI_BASE}/models/${models[i]}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env2.GEMINI_API_KEY },
      body: bodyText
    });
    const text = await res.text();
    log(res.ok ? "info" : "warn", {
      event: "gemini_upstream",
      source: "background",
      model: models[i],
      status: res.status,
      ms: Date.now() - started,
      requestBytes: bodyText.length,
      error: res.ok ? void 0 : text.slice(0, 300)
    });
    if (res.status === 404 && i < models.length - 1) continue;
    if (!res.ok) throw new GeminiHttpError(res.status, text.slice(0, 500));
    return JSON.parse(text);
  }
  throw new GeminiHttpError(404);
}

// src/shared/geminiTasks.ts
function jsonRequest(prompt, temperature = 0.1) {
  return {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature }
  };
}
function readJson(data) {
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}
function buildTranslationRequest(recipe) {
  const source = {
    title: recipe.title || "",
    description: recipe.description || "",
    ingredientSections: (recipe.ingredientSections || []).map((s) => ({
      title: s.title,
      items: s.items.map((i) => ({ amount: i.amount, unit: i.unit, name: i.name, notes: i.notes ?? null }))
    })),
    instructions: (recipe.instructions || []).map((st) => ({ text: st.text }))
  };
  const prompt = `Below is a recipe. First decide whether it is written in Dutch.
- If it is Dutch, translate it into natural English, the way a good English cookbook would write it.
- Otherwise (English or any other language), translate it into natural Dutch, the way a good Dutch cookbook would write it.
Rules:
- Natural, fluent text for home cooks. Use the usual cooking terms of the target language; do not translate word by word.
- Ingredient names: normal names of the target language, lowercase unless a proper noun (e.g. "Parmigiano-Reggiano"). Keep brand names.
- Units: use the target language's usual abbreviations or words (Dutch: g, kg, ml, l, el, tl, teentje/teentjes, snufje, stuk/stuks, bosje; English: g, kg, ml, l, tbsp, tsp, clove/cloves, pinch, piece/pieces, bunch). Do not convert amounts or switch unit systems.
- Keep every number, the number of sections, items and steps, and their order exactly as given. Do not add or remove anything.
- Respond ONLY with JSON of exactly the same shape as the input ("notes" stays null when it is null), plus one extra field "sourceLanguage": "nl" if the source recipe was Dutch, otherwise "other".

Recipe JSON:
${JSON.stringify(source)}`;
  return jsonRequest(prompt, 0.2);
}
function parseTranslation(recipe, out) {
  const sections = recipe.ingredientSections || [];
  const steps = recipe.instructions || [];
  const valid = typeof out?.title === "string" && (out.sourceLanguage === "nl" || out.sourceLanguage === "other") && Array.isArray(out.ingredientSections) && out.ingredientSections.length === sections.length && out.ingredientSections.every((s, i) => Array.isArray(s.items) && s.items.length === sections[i].items.length) && Array.isArray(out.instructions) && out.instructions.length === steps.length;
  if (!valid) throw new Error("Gemini returned a translation with a different structure.");
  return {
    sourceLanguage: out.sourceLanguage,
    title: out.title || recipe.title || "",
    description: typeof out.description === "string" ? out.description : recipe.description || "",
    ingredientSections: sections.map((section, si) => ({
      ...section,
      title: out.ingredientSections[si].title || section.title,
      items: section.items.map((item, ii) => {
        const t = out.ingredientSections[si].items[ii];
        return {
          ...item,
          name: t.name || item.name,
          unit: typeof t.unit === "string" ? t.unit : item.unit,
          notes: item.notes ? t.notes || item.notes : item.notes
        };
      })
    })),
    instructions: steps.map((step, i) => ({ ...step, text: out.instructions[i].text || step.text }))
  };
}
function buildAnnotationRequest(sections, steps, language) {
  const items = sections.flatMap((s) => s.items);
  const prompt = `This is a recipe in ${language === "nl" ? "Dutch" : "English"}. Annotate it and respond ONLY with JSON:
{
  "ingredients": [ { "id": "<ingredient id>", "singular": "...", "plural": "..." } ],
  "steps": [ { "refs": [ { "id": "<ingredient id>", "mention": "<exact words from the step>", "fraction": 1 } ] } ]
}
Rules for "ingredients" (one entry per ingredient, same ids):
- "singular" and "plural" are the name of the ingredient as it reads after "1" and after "2", in the recipe's language, lowercase, keeping adjectives ("grote ui" / "grote uien", "red onion" / "red onions").
- For ingredients that have no plural (milk, flour, water, melk, bloem) give the same text for both.
- Do not translate or change the wording otherwise.
Rules for "steps" (one entry per step, same order and count):
- "refs" lists the ingredients from the list that this step uses or adds. "mention" must be copied EXACTLY (same letters, case and accents) from that step's text and should be the shortest words that name the ingredient, for example "de uien" or "olive oil".
- "fraction" is the share of the ingredient's total amount used in this step: 1 for all of it, 0.5 for half. If an ingredient is spread over several steps, the fractions add up to about 1.
- Only include an ingredient when the step really names it. Never invent ingredients, never repeat the same ingredient twice in one step. Use an empty "refs" list when a step names none.

Ingredients:
${items.map((i) => `${i.id} | ${i.amount} ${i.unit} ${i.name}`.trim()).join("\n")}

Steps:
${steps.map((st, n) => `${n + 1}. ${st.text}`).join("\n")}`;
  return jsonRequest(prompt);
}
function parseAnnotation(sections, steps, out) {
  const items = sections.flatMap((s) => s.items);
  const itemIds = new Set(items.map((i) => i.id));
  if (!out || !Array.isArray(out.ingredients) || !Array.isArray(out.steps) || out.steps.length !== steps.length) {
    throw new Error("Gemini returned an annotation with a different structure.");
  }
  const forms = {};
  for (const entry of out.ingredients) {
    if (!entry || !itemIds.has(entry.id)) continue;
    const singular = String(entry.singular || "").trim();
    const plural = String(entry.plural || "").trim();
    if (singular && plural) forms[entry.id] = { singular, plural };
  }
  const refs = steps.map((step, n) => {
    const raw = Array.isArray(out.steps[n]?.refs) ? out.steps[n].refs : [];
    const seen = /* @__PURE__ */ new Set();
    const valid = [];
    for (const r of raw) {
      if (!r || !itemIds.has(r.id) || seen.has(r.id)) continue;
      const mention = String(r.mention || "");
      if (!mention || !step.text.includes(mention)) continue;
      const fraction = typeof r.fraction === "number" && r.fraction > 0 && r.fraction <= 1 ? r.fraction : 1;
      seen.add(r.id);
      valid.push({ ingredientId: r.id, mention, fraction });
    }
    return valid;
  });
  return { forms, refs };
}

// src/services/storageService.ts
var INITIAL_RECIPES = [
  {
    id: "seed-1",
    // Dutch (default)
    title: "Romige Truffel & Wilde Paddenstoel Tagliatelle",
    description: "Rijke fluweelzachte truffelroomsaus met al dente pasta, gebakken wilde paddenstoelen en geraspte parmigiano-reggiano.",
    category: "Main",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=1000&q=80",
    sourceName: "Gourmet Kitchen",
    sourceUrl: "https://cookmate.online/example/truffle-pasta",
    isFavorite: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    tags: ["Italiaans", "Pasta", "Vegetarisch", "Snel Diner"],
    ingredientSections: [
      {
        id: "sec-pasta-1",
        title: "Voor de Verse Tagliatelle Pasta",
        items: [
          { id: "ing-1", amount: 400, unit: "g", name: "Verse Tagliatelle Pasta" },
          { id: "ing-2", amount: 4, unit: "l", name: "Water" },
          { id: "ing-3", amount: 2, unit: "el", name: "Zeezout", notes: "voor het pasta water" }
        ]
      },
      {
        id: "sec-sauce-1",
        title: "Voor de Truffelroomsaus",
        items: [
          { id: "ing-4", amount: 3, unit: "el", name: "Ongezouten Boter" },
          { id: "ing-5", amount: 300, unit: "g", name: "Wilde Paddenstoelen", notes: "cantharellen & cremini, gesneden" },
          { id: "ing-6", amount: 3, unit: "teentjes", name: "Knoflook", notes: "fijngehakt" },
          { id: "ing-7", amount: 200, unit: "ml", name: "Slagroom" },
          { id: "ing-8", amount: 2, unit: "el", name: "Zwarte Truffelolie" },
          { id: "ing-9", amount: 80, unit: "g", name: "Parmigiano-Reggiano", notes: "vers geraspt" },
          { id: "ing-10", amount: 0.5, unit: "tl", name: "Versgemalen Zwarte Peper" }
        ]
      },
      {
        id: "sec-garnish-1",
        title: "Voor de Garnering & Serveren",
        items: [
          { id: "ing-11", amount: 2, unit: "el", name: "Verse Peterselie", notes: "gehakt" },
          { id: "ing-12", amount: 20, unit: "g", name: "Geschaafde Zwarte Truffel", notes: "optioneel" }
        ]
      }
    ],
    instructions: [
      { id: "st-1", stepNumber: 1, text: "Breng een grote pan gezouten water aan de kook.", timerMinutes: 8 },
      { id: "st-2", stepNumber: 2, text: "Smelt de boter in een koekenpan op middelhoog vuur. Voeg de gesneden wilde paddenstoelen toe en bak ze goudbruin (ca. 6 min). Voeg de knoflook toe en bak nog een minuut mee.", timerMinutes: 7 },
      { id: "st-3", stepNumber: 3, text: "Giet de slagroom erbij en zet het vuur laag. Roer de vers geraspte parmigiano-reggiano erdoor tot de saus romig en dik is.", timerMinutes: 4 },
      { id: "st-4", stepNumber: 4, text: "Kook de verse tagliatelle pasta in het kokende water 3-4 minuten tot al dente. Houd een half kopje pasta water apart en giet de pasta af.", timerMinutes: 4 },
      { id: "st-5", stepNumber: 5, text: "Schep de pasta door de truffelroomsaus met een scheutje pasta water. Besprenkel met zwarte truffelolie en beleg met gehakte verse peterselie en geschaafde truffel.", timerMinutes: 2 }
    ],
    // Original English
    titleEn: "Creamy Truffle & Wild Mushroom Tagliatelle",
    descriptionEn: "Rich, velvet truffle cream pasta cooked al dente, topped with saut\xE9ed wild mushrooms and aged Parmigiano-Reggiano.",
    ingredientSectionsEn: [
      {
        id: "sec-pasta-1",
        title: "For the Fresh Tagliatelle Pasta",
        items: [
          { id: "ing-1", amount: 400, unit: "g", name: "Fresh Tagliatelle Pasta" },
          { id: "ing-2", amount: 4, unit: "l", name: "Water" },
          { id: "ing-3", amount: 2, unit: "tbsp", name: "Sea Salt", notes: "for pasta water" }
        ]
      },
      {
        id: "sec-sauce-1",
        title: "For the Truffle Cream Sauce",
        items: [
          { id: "ing-4", amount: 3, unit: "tbsp", name: "Unsalted Butter" },
          { id: "ing-5", amount: 300, unit: "g", name: "Wild Mushrooms", notes: "chanterelles & cremini, sliced" },
          { id: "ing-6", amount: 3, unit: "cloves", name: "Garlic", notes: "minced" },
          { id: "ing-7", amount: 200, unit: "ml", name: "Heavy Cream" },
          { id: "ing-8", amount: 2, unit: "tbsp", name: "Black Truffle Oil" },
          { id: "ing-9", amount: 80, unit: "g", name: "Parmigiano-Reggiano", notes: "freshly grated" },
          { id: "ing-10", amount: 0.5, unit: "tsp", name: "Freshly Ground Black Pepper" }
        ]
      },
      {
        id: "sec-garnish-1",
        title: "For the Garnish & Serving",
        items: [
          { id: "ing-11", amount: 2, unit: "tbsp", name: "Fresh Parsley", notes: "chopped" },
          { id: "ing-12", amount: 20, unit: "g", name: "Shaved Black Truffle", notes: "optional" }
        ]
      }
    ],
    instructionsEn: [
      { id: "st-1", stepNumber: 1, text: "Bring a large pot of salted water to a rolling boil.", timerMinutes: 8 },
      { id: "st-2", stepNumber: 2, text: "Melt butter in a skillet over medium-high heat. Add sliced wild mushrooms and saut\xE9 until golden brown (approx 6 mins). Add garlic and cook for another minute.", timerMinutes: 7 },
      { id: "st-3", stepNumber: 3, text: "Pour in heavy cream and lower heat to simmer. Stir in freshly grated Parmigiano-Reggiano until melted and thick.", timerMinutes: 4 },
      { id: "st-4", stepNumber: 4, text: "Cook fresh Tagliatelle pasta in boiling water for 3-4 minutes until al dente. Reserve 1/2 cup pasta water, then drain pasta.", timerMinutes: 4 },
      { id: "st-5", stepNumber: 5, text: "Toss pasta into truffle cream sauce with a splash of pasta water. Drizzle black truffle oil and top with chopped fresh parsley and shaved truffle.", timerMinutes: 2 }
    ]
  },
  {
    id: "seed-2",
    // Dutch (default)
    title: "Ambachtelijke Houtgestookte Margherita Pizza",
    description: "Klassieke Napolitaanse pizza met langzaam gefermenteerd deeg, San Marzano tomatensaus, verse buffalo mozzarella en aromatische basilicumblaadjes.",
    category: "Main",
    prepTime: 25,
    cookTime: 12,
    servings: 2,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
    sourceName: "Neapolitan Tradition",
    isFavorite: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    tags: ["Bakken", "Italiaans", "Pizza", "Comfort Food"],
    ingredientSections: [
      {
        id: "sec-dough-2",
        title: "Voor het Pizzadeeg (2 Ballen)",
        items: [
          { id: "ing-21", amount: 350, unit: "g", name: "Tipo 00 Bloem" },
          { id: "ing-22", amount: 230, unit: "ml", name: "Lauwwarm Water" },
          { id: "ing-23", amount: 1, unit: "tl", name: "Actieve Droge Gist" },
          { id: "ing-24", amount: 1.5, unit: "tl", name: "Fijn Zeezout" }
        ]
      },
      {
        id: "sec-sauce-2",
        title: "Voor de San Marzano Tomatensaus",
        items: [
          { id: "ing-25", amount: 250, unit: "g", name: "San Marzano Gepelde Tomaten" },
          { id: "ing-26", amount: 1, unit: "teentje", name: "Knoflook", notes: "geplet" },
          { id: "ing-27", amount: 1, unit: "el", name: "Extra Vierge Olijfolie" },
          { id: "ing-28", amount: 0.5, unit: "tl", name: "Gedroogde Oregano" }
        ]
      },
      {
        id: "sec-toppings-2",
        title: "Voor de Kaas & Toppings",
        items: [
          { id: "ing-29", amount: 200, unit: "g", name: "Verse Buffalo Mozzarella", notes: "gescheurd & uitgelekt" },
          { id: "ing-30", amount: 10, unit: "blaadjes", name: "Verse Basilicum" },
          { id: "ing-31", amount: 2, unit: "el", name: "Extra Vierge Olijfolie" }
        ]
      }
    ],
    instructions: [
      { id: "st-21", stepNumber: 1, text: "Los de gist op in lauwwarm water. Meng de bloem en het zout, voeg het gistwater toe en kneed 10 minuten tot een glad deegbal. Laat 2 uur rijzen.", timerMinutes: 120 },
      { id: "st-22", stepNumber: 2, text: "Plet de San Marzano tomaten met geplete knoflook, olijfolie, oregano en zout tot een rauwe tomatensaus." },
      { id: "st-23", stepNumber: 3, text: "Verwarm de oven voor met een pizzasteen op maximale temperatuur (250\xB0C).", timerMinutes: 30 },
      { id: "st-24", stepNumber: 4, text: "Rek het deeg uit tot twee ronden van 25 cm. Smeer de tomatensaus gelijkmatig uit en verdeel de mozzarella." },
      { id: "st-25", stepNumber: 5, text: "Bak 8-10 minuten tot de korst mooi gebakken is en de kaas bubbelt. Garneer met verse basilicum en olijfolie.", timerMinutes: 10 }
    ],
    // Original English
    titleEn: "Artisanal Wood-Fired Margherita Pizza",
    descriptionEn: "Classic Neapolitan pizza with slow-fermented dough, San Marzano tomato sauce, fresh buffalo mozzarella, and aromatic basil leaves.",
    ingredientSectionsEn: [
      {
        id: "sec-dough-2",
        title: "For the Pizza Dough (2 balls)",
        items: [
          { id: "ing-21", amount: 350, unit: "g", name: "Tipo 00 Flour" },
          { id: "ing-22", amount: 230, unit: "ml", name: "Lukewarm Water" },
          { id: "ing-23", amount: 1, unit: "tsp", name: "Active Dry Yeast" },
          { id: "ing-24", amount: 1.5, unit: "tsp", name: "Fine Sea Salt" }
        ]
      },
      {
        id: "sec-sauce-2",
        title: "For the San Marzano Tomato Sauce",
        items: [
          { id: "ing-25", amount: 250, unit: "g", name: "San Marzano Whole Peeled Tomatoes" },
          { id: "ing-26", amount: 1, unit: "clove", name: "Garlic", notes: "crushed" },
          { id: "ing-27", amount: 1, unit: "tbsp", name: "Extra Virgin Olive Oil" },
          { id: "ing-28", amount: 0.5, unit: "tsp", name: "Dried Oregano" }
        ]
      },
      {
        id: "sec-toppings-2",
        title: "For the Cheese & Toppings",
        items: [
          { id: "ing-29", amount: 200, unit: "g", name: "Fresh Buffalo Mozzarella", notes: "torn & drained" },
          { id: "ing-30", amount: 10, unit: "leaves", name: "Fresh Basil" },
          { id: "ing-31", amount: 2, unit: "tbsp", name: "Extra Virgin Olive Oil" }
        ]
      }
    ],
    instructionsEn: [
      { id: "st-21", stepNumber: 1, text: "Dissolve yeast in warm water. Mix flour and salt, then pour yeast water and knead for 10 minutes into a smooth dough ball. Let rise for 2 hours.", timerMinutes: 120 },
      { id: "st-22", stepNumber: 2, text: "Hand-crush San Marzano tomatoes with crushed garlic, olive oil, oregano, and salt to create raw tomato sauce." },
      { id: "st-23", stepNumber: 3, text: "Preheat oven with pizza stone to maximum temperature (250\xB0C / 480\xB0F).", timerMinutes: 30 },
      { id: "st-24", stepNumber: 4, text: "Stretch dough into two 10-inch rounds. Spread tomato sauce evenly, arrange mozzarella pieces." },
      { id: "st-25", stepNumber: 5, text: "Bake for 8-10 minutes until crust is charred and cheese bubbles. Garnish with fresh basil and olive oil.", timerMinutes: 10 }
    ]
  },
  {
    id: "seed-3",
    // Dutch (default)
    title: "Bessenperfait met Honing Granola",
    description: "Verfrissende gelaagde Griekse yoghurt parfait met geroosterde amandel havergranola en wilde bessen.",
    category: "Breakfast",
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80",
    sourceName: "Healthy Morning",
    isFavorite: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    tags: ["Ontbijt", "Snel", "Gezond", "Vegetarisch"],
    ingredientSections: [
      {
        id: "sec-base-3",
        title: "Voor de Yoghurtbasis",
        items: [
          { id: "ing-31", amount: 300, unit: "g", name: "Griekse Yoghurt" },
          { id: "ing-32", amount: 2, unit: "el", name: "Wilde Bloemen Honing" },
          { id: "ing-33", amount: 0.5, unit: "tl", name: "Vanille-extract" }
        ]
      },
      {
        id: "sec-fruit-3",
        title: "Voor de Bessensaus & Crunch",
        items: [
          { id: "ing-34", amount: 150, unit: "g", name: "Gemengde Verse Bessen", notes: "aardbeien & bosbessen" },
          { id: "ing-35", amount: 100, unit: "g", name: "Honing Amandel Granola" },
          { id: "ing-36", amount: 1, unit: "el", name: "Chiazaad" }
        ]
      }
    ],
    instructions: [
      { id: "st-31", stepNumber: 1, text: "Klop de Griekse yoghurt, wilde bloemen honing en vanille-extract samen in een kom." },
      { id: "st-32", stepNumber: 2, text: "Maak laagjes in glazen met de honingyoghurt, granola en verse gemengde bessen." },
      { id: "st-33", stepNumber: 3, text: "Strooi chiazaad erover en serveer direct." }
    ],
    // Original English
    titleEn: "Berry Parfait with Honey Granola",
    descriptionEn: "Refreshing layered Greek yogurt parfait with roasted almond oat granola and wild berries.",
    ingredientSectionsEn: [
      {
        id: "sec-base-3",
        title: "For the Yogurt Base",
        items: [
          { id: "ing-31", amount: 300, unit: "g", name: "Greek Yogurt" },
          { id: "ing-32", amount: 2, unit: "tbsp", name: "Wildflower Honey" },
          { id: "ing-33", amount: 0.5, unit: "tsp", name: "Vanilla Extract" }
        ]
      },
      {
        id: "sec-fruit-3",
        title: "For the Berry Compote & Crunch",
        items: [
          { id: "ing-34", amount: 150, unit: "g", name: "Mixed Fresh Berries", notes: "strawberries & blueberries" },
          { id: "ing-35", amount: 100, unit: "g", name: "Honey Almond Granola" },
          { id: "ing-36", amount: 1, unit: "tbsp", name: "Chia Seeds" }
        ]
      }
    ],
    instructionsEn: [
      { id: "st-31", stepNumber: 1, text: "Whisk Greek yogurt, wildflower honey, and vanilla extract together in a bowl." },
      { id: "st-32", stepNumber: 2, text: "In glasses, alternate layers of honey yogurt, granola, and fresh mixed berries." },
      { id: "st-33", stepNumber: 3, text: "Top with chia seeds and serve immediately." }
    ]
  }
];

// bench/checks.mjs
var close = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-6;
var share = (list, pred) => list.length === 0 ? 1 : list.filter(pred).length / list.length;
function checkTranslation({ recipe, lang }, { raw, parsed, error }) {
  const checks = { valid_structure: !error && !!parsed };
  const sections = recipe.ingredientSections || [];
  const steps = recipe.instructions || [];
  const items = sections.flatMap((s) => s.items);
  const outItems = (raw?.ingredientSections || []).flatMap((s) => s.items || []);
  checks.amounts_kept = outItems.length === items.length && items.every((it, i) => close(outItems[i]?.amount, it.amount));
  checks.language_detected = raw?.sourceLanguage === (lang === "nl" ? "nl" : "other");
  const outSteps = raw?.instructions || [];
  checks.steps_translated = share(steps, (s, i) => typeof outSteps[i]?.text === "string" && outSteps[i].text.trim() && outSteps[i].text.trim() !== s.text.trim()) >= 0.9;
  checks.names_filled = outItems.length > 0 && outItems.every((it) => typeof it?.name === "string" && it.name.trim());
  return checks;
}
function checkAnnotation({ recipe, lang }, { raw, parsed, error }) {
  const checks = { valid_structure: !error && !!parsed };
  const steps = lang === "nl" ? recipe.instructions || [] : recipe.instructionsEn || recipe.instructions || [];
  const items = (lang === "nl" ? recipe.ingredientSections : recipe.ingredientSectionsEn || recipe.ingredientSections || []).flatMap((s) => s.items);
  checks.forms_complete = !!parsed && items.length > 0 && Object.keys(parsed.forms).length / items.length >= 0.9;
  const rawRefs = (raw?.steps || []).flatMap((s, n) => Array.isArray(s?.refs) ? s.refs.map((r) => ({ r, n })) : []);
  checks.has_refs = !!parsed && parsed.refs.some((r) => r.length > 0);
  checks.mentions_verbatim = rawRefs.length > 0 && share(rawRefs, ({ r, n }) => !!r?.mention && !!steps[n] && steps[n].text.includes(r.mention)) >= 0.9;
  checks.ids_valid = rawRefs.length > 0 && share(rawRefs, ({ r }) => items.some((i) => i.id === r?.id)) >= 0.95;
  return checks;
}
var scoreOf = (checks) => {
  const values = Object.values(checks);
  return values.length ? values.filter(Boolean).length / values.length : 0;
};
var percentile = (sorted, p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0;
function summarize(results2) {
  const n = results2.length;
  const names = [...new Set(results2.flatMap((r) => Object.keys(r.checks)))];
  const checks = Object.fromEntries(names.map((name) => [name, n ? results2.filter((r) => r.checks[name]).length / n : 0]));
  const latencies = results2.map((r) => r.ms).sort((a, b) => a - b);
  return {
    recipes: n,
    meanScore: n ? results2.reduce((s, r) => s + r.score, 0) / n : 0,
    structureRate: checks.valid_structure ?? 0,
    checks,
    latencyMs: { p50: percentile(latencies, 0.5), p95: percentile(latencies, 0.95) },
    tokens: { input: results2.reduce((s, r) => s + (r.tokens?.input || 0), 0), output: results2.reduce((s, r) => s + (r.tokens?.output || 0), 0) },
    errors: results2.filter((r) => r.error).slice(0, 10).map((r) => ({ recipe: r.name, message: r.error }))
  };
}

// bench/run.mjs
var args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"]] : acc, [])
);
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
var task = args.task || "translate";
var provider = args.provider || "gemini";
var gap = Number(args.gap ?? 1100);
var limit = args.limit ? Number(args.limit) : Infinity;
if (!["translate", "annotate"].includes(task)) throw new Error("--task must be translate or annotate");
if (!["gemini", "mistral"].includes(provider)) throw new Error("--provider must be gemini or mistral");
var env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  AI_PROVIDER: provider,
  AI_PROVIDER_LIGHT: provider,
  MISTRAL_BASE: process.env.MISTRAL_BASE,
  // overrides, used by tests with a stand-in server
  GEMINI_BASE: process.env.GEMINI_BASE
};
var model = args.model || (provider === "mistral" ? "mistral-small-latest" : "gemini-flash-latest");
if (provider === "mistral") env.MISTRAL_MODEL = env.MISTRAL_MODEL_LIGHT = model;
else env.GEMINI_MODEL = env.GEMINI_MODEL_LIGHT = model;
if (!(provider === "mistral" ? env.MISTRAL_API_KEY : env.GEMINI_API_KEY)) throw new Error(`No ${provider} key: set it in .env.local or the environment`);
var contextText = args.context ? fs.readFileSync(args.context, "utf8").trim() : "";
var contextHash = contextText ? crypto.createHash("sha256").update(contextText).digest("hex").slice(0, 8) : "none";
var label = args.label || (args.context ? path.basename(args.context, path.extname(args.context)) : "baseline");
var withContext = (body) => contextText ? { ...body, systemInstruction: { parts: [{ text: contextText }] } } : body;
var strip = (r, lang) => ({ ...r, titleEn: void 0, descriptionEn: void 0, ingredientSectionsEn: void 0, instructionsEn: void 0, translationPending: false, __lang: lang });
var golden = [];
for (const r of INITIAL_RECIPES) {
  golden.push({ name: `${r.id} (nl)`, lang: "nl", recipe: strip(r, "nl") });
  if (r.ingredientSectionsEn && r.instructionsEn) {
    golden.push({ name: `${r.id} (en)`, lang: "en", recipe: { ...strip(r, "en"), title: r.titleEn || r.title, description: r.descriptionEn || r.description, ingredientSections: r.ingredientSectionsEn, instructions: r.instructionsEn }, full: r });
  }
}
var goldenDir = "bench/golden";
if (fs.existsSync(goldenDir)) {
  for (const f of fs.readdirSync(goldenDir).filter((f2) => f2.endsWith(".json"))) {
    const data = JSON.parse(fs.readFileSync(path.join(goldenDir, f), "utf8"));
    for (const r of Array.isArray(data) ? data : data.recipes || []) {
      if (r.id?.startsWith("seed-")) continue;
      const lang = r.titleEn ? "nl" : "en";
      golden.push({ name: `${f}:${r.id}`, lang, recipe: r });
    }
  }
}
var cases = golden.slice(0, limit);
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var results = [];
console.log(`${task} on ${provider}/${model}, context ${label} (${contextHash}), ${cases.length} recipes`);
for (const c of cases) {
  const started = Date.now();
  let tokens;
  const generate = async (body, tier) => {
    const out = await generateContent(env, withContext(body), tier);
    const u = out?.usageMetadata;
    if (u) tokens = { input: u.promptTokenCount || 0, output: u.candidatesTokenCount || 0 };
    return out;
  };
  const run2 = { raw: void 0, parsed: void 0, error: void 0 };
  try {
    const sections = c.lang === "en" && c.full ? c.full.ingredientSectionsEn : c.recipe.ingredientSections;
    const steps = c.lang === "en" && c.full ? c.full.instructionsEn : c.recipe.instructions;
    if (task === "translate") {
      run2.raw = readJson(await generate(buildTranslationRequest(c.recipe), "default"));
      run2.parsed = parseTranslation(c.recipe, run2.raw);
    } else {
      run2.raw = readJson(await generate(buildAnnotationRequest(sections, steps, c.lang), "light"));
      run2.parsed = parseAnnotation(sections, steps, run2.raw);
    }
  } catch (e) {
    run2.error = e instanceof Error ? e.message : String(e);
  }
  const checks = (task === "translate" ? checkTranslation : checkAnnotation)({ recipe: c.full || c.recipe, lang: c.lang }, run2);
  const entry = { name: c.name, checks, score: scoreOf(checks), ms: Date.now() - started, tokens, error: run2.error };
  results.push(entry);
  console.log(`${entry.score.toFixed(2)}  ${entry.ms}ms  ${c.name}${run2.error ? `  ERROR ${run2.error.slice(0, 120)}` : ""}`);
  await sleep(gap);
}
var commit = "";
try {
  commit = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
}
var startedAt = (/* @__PURE__ */ new Date()).toISOString();
var run = {
  id: `${startedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}-${task}-${provider}-${label}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
  startedAt,
  task,
  provider,
  model,
  label,
  contextHash,
  commit,
  ...summarize(results),
  items: results.map((r) => ({ name: r.name, score: r.score, ms: r.ms, error: r.error }))
};
console.log(`
mean score ${run.meanScore.toFixed(3)}, structure ${(run.structureRate * 100).toFixed(0)}%, p50 ${run.latencyMs.p50}ms`);
console.log(Object.entries(run.checks).map(([k, v]) => `  ${k}: ${(v * 100).toFixed(0)}%`).join("\n"));
fs.mkdirSync(".bench-results", { recursive: true });
fs.writeFileSync(`.bench-results/${run.id}.json`, JSON.stringify(run, null, 2));
console.log(`saved .bench-results/${run.id}.json`);
var { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
if (token && account && args.upload !== "false") {
  const toml = fs.readFileSync("wrangler.toml", "utf8");
  const ns = (toml.match(/binding\s*=\s*"FEAST"\s*\nid\s*=\s*"([0-9a-f]+)"/) || [])[1];
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/storage/kv/namespaces/${ns}`;
  const headers = { Authorization: `Bearer ${token}` };
  const put = async (key, value) => {
    const res = await fetch(`${base}/values/${encodeURIComponent(key)}`, { method: "PUT", headers, body: JSON.stringify(value) });
    if (!res.ok) throw new Error(`KV write ${key}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  };
  const indexRes = await fetch(`${base}/values/bench%3Aindex`, { headers });
  const index = indexRes.ok ? await indexRes.json().catch(() => []) : [];
  const { items, ...summary } = run;
  await put(`bench:run:${run.id}`, run);
  await put("bench:index", [summary, ...index.filter((r) => r.id !== run.id)].slice(0, 200));
  console.log("uploaded to Cloudflare KV");
} else {
  console.log("not uploaded (set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to store it in Cloudflare)");
}
