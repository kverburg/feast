import { Recipe, IngredientItem } from '../types/recipe';
import { Language, localizeRecipe } from './localizeRecipe';
import { buildStepSegments, convertUnit, displayName, formatAmount, formatUnit } from './amounts';

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LABELS = {
  nl: { ingredients: 'Ingrediënten', method: 'Bereiding', portions: 'personen', total: 'totaal', prep: 'voorbereiding', cook: 'bereiding', source: 'Bron', minutes: 'min' },
  en: { ingredients: 'Ingredients', method: 'Method', portions: 'servings', total: 'total', prep: 'prep', cook: 'cook', source: 'Source', minutes: 'min' },
} as const;

/** The recipe as a printable page: in the language shown, with the portions and units chosen on screen. */
export function recipeToPrintHtml(original: Recipe, language: Language, servings: number, unitSystem: 'metric' | 'imperial'): string {
  const recipe = localizeRecipe(original, language);
  const t = LABELS[language];
  const ratio = servings / (recipe.servings || 1);
  const items: IngredientItem[] = recipe.ingredientSections.flatMap((s) => s.items);
  const byId = new Map(items.map((i) => [i.id, i]));

  const quantity = (item: IngredientItem, fraction = 1): string => {
    if (!item.amount) return '';
    const converted = convertUnit(item.amount * fraction * ratio, item.unit, unitSystem, item.name);
    const unit = formatUnit(converted.unit, converted.amount, language);
    return `${formatAmount(converted.amount)}${unit ? ` ${unit}` : ''}`.trim();
  };

  const sections = recipe.ingredientSections
    .map((sec) => {
      const rows = sec.items
        .map((item) => {
          const converted = convertUnit((item.amount || 0) * ratio, item.unit, unitSystem, item.name);
          const name = displayName(item, converted.amount, converted.unit);
          return `<li><span class="qty">${escapeHtml(quantity(item))}</span> ${escapeHtml(name)}${item.notes ? ` <span class="note">(${escapeHtml(item.notes)})</span>` : ''}</li>`;
        })
        .join('');
      const heading = recipe.ingredientSections.length > 1 && sec.title ? `<h3>${escapeHtml(sec.title)}</h3>` : '';
      return `${heading}<ul>${rows}</ul>`;
    })
    .join('');

  const steps = recipe.instructions
    .map((step) => {
      const text = buildStepSegments(step.text, step.refs, new Set(byId.keys()))
        .map((seg) => {
          const item = seg.ref ? byId.get(seg.ref.ingredientId) : undefined;
          const q = item && seg.ref ? quantity(item, seg.ref.fraction && seg.ref.fraction > 0 ? seg.ref.fraction : 1) : '';
          return escapeHtml(seg.text) + (q ? ` <b>(${escapeHtml(q)})</b>` : '');
        })
        .join('');
      return `<li>${text}${step.timerMinutes ? ` <span class="note">[${step.timerMinutes} ${t.minutes}]</span>` : ''}</li>`;
    })
    .join('');

  const image = /^(https?:|data:|\/api\/image\/)/.test(recipe.image || '') ? `<img class="hero" src="${escapeHtml(recipe.image)}" alt="">` : '';
  const source = recipe.sourceUrl ? `<p class="source">${t.source}: ${escapeHtml(recipe.sourceUrl)}</p>` : '';

  return `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><title>${escapeHtml(recipe.title)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1f2420; font-size: 11pt; line-height: 1.45; margin: 0; }
  h1 { font-size: 22pt; margin: 0 0 4pt; }
  h2 { font-size: 13pt; margin: 14pt 0 6pt; border-bottom: 1px solid #c9d1c8; padding-bottom: 3pt; color: #3f5a47; }
  h3 { font-size: 11pt; margin: 8pt 0 3pt; }
  .desc { color: #55605a; margin: 0 0 8pt; }
  .meta { color: #55605a; font-size: 10pt; margin: 0 0 10pt; }
  .hero { width: 100%; max-height: 70mm; object-fit: cover; border-radius: 6pt; margin-bottom: 10pt; }
  ul { list-style: none; padding: 0; margin: 0 0 4pt; }
  li { padding: 2pt 0; }
  .qty { display: inline-block; min-width: 24mm; font-weight: 700; color: #3f5a47; }
  .note { color: #77817b; font-size: 9.5pt; }
  ol { padding-left: 18pt; margin: 0; }
  ol li { padding: 4pt 0; break-inside: avoid; }
  .source { color: #77817b; font-size: 9pt; margin-top: 14pt; word-break: break-all; }
  ul, h3 { break-inside: avoid; }
</style></head><body>
${image}
<h1>${escapeHtml(recipe.title)}</h1>
${recipe.description ? `<p class="desc">${escapeHtml(recipe.description)}</p>` : ''}
<p class="meta">${servings} ${t.portions} · ${recipe.prepTime + recipe.cookTime} ${t.minutes} ${t.total} (${recipe.prepTime} ${t.prep} / ${recipe.cookTime} ${t.cook})</p>
<h2>${t.ingredients}</h2>
${sections}
<h2>${t.method}</h2>
<ol>${steps}</ol>
${source}
</body></html>`;
}

/** Open the print dialog for the recipe: "Save as PDF" there gives the file. Uses a hidden frame, so no pop-up is needed. */
export function exportRecipePdf(recipe: Recipe, language: Language, servings: number, unitSystem: 'metric' | 'imperial'): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(recipeToPrintHtml(recipe, language, servings, unitSystem));
  doc.close();
  // let the picture load first (but not forever)
  const print = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 60000);
  };
  const img = doc.querySelector('img');
  if (img && !img.complete) {
    const timer = window.setTimeout(print, 3000);
    const done = () => {
      window.clearTimeout(timer);
      print();
    };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  } else {
    window.setTimeout(print, 100);
  }
}
