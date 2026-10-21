import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeToPrintHtml } from '../src/services/pdfExport.ts';

const recipe = {
  id: 'r', title: 'Soep <b>', description: 'Lekker', category: 'Main', prepTime: 10, cookTime: 20, servings: 2, image: 'https://x.test/a.jpg', tags: [], isFavorite: false, createdAt: '',
  titleEn: 'Soup', descriptionEn: 'Tasty',
  ingredientSections: [{ id: 's', title: 'Basis', items: [{ id: 'a', amount: 200, unit: 'g', name: 'ui' }, { id: 'b', amount: 0, unit: '', name: 'zout en peper' }] }],
  ingredientSectionsEn: [{ id: 's', title: 'Base', items: [{ id: 'a', amount: 200, unit: 'g', name: 'onion' }, { id: 'b', amount: 0, unit: '', name: 'salt and pepper' }] }],
  instructions: [{ id: 't', stepNumber: 1, text: 'Bak de ui.', timerMinutes: 5, refs: [{ ingredientId: 'a', mention: 'ui', fraction: 1 }] }],
  instructionsEn: [{ id: 't', stepNumber: 1, text: 'Fry the onion.', refs: [{ ingredientId: 'a', mention: 'onion', fraction: 1 }] }],
};

test('the print page is escaped, scaled to the portions and in the chosen language', () => {
  const nl = recipeToPrintHtml(recipe, 'nl', 4, 'metric');
  assert.match(nl, /Soep &lt;b&gt;/);
  assert.match(nl, /400 g/); // 2 -> 4 servings
  assert.match(nl, /<b>\(400 g\)<\/b>/); // quantity after the mention in the step
  assert.match(nl, /4 personen/);
  assert.match(nl, /Ingrediënten/);
  const en = recipeToPrintHtml(recipe, 'en', 2, 'metric');
  assert.match(en, /<h1>Soup<\/h1>/);
  assert.match(en, /Fry the onion\. ?|Fry the onion <b>/);
  assert.match(en, /Ingredients/);
});

test('an ingredient without quantity prints no number', () => {
  const html = recipeToPrintHtml(recipe, 'nl', 2, 'metric');
  assert.match(html, /<span class="qty"><\/span> zout en peper/);
});
