import test from 'node:test';
import assert from 'node:assert/strict';
import { checkTranslation, checkAnnotation, scoreOf, summarize } from '../bench/checks.mjs';

const recipe = {
  title: 'Soep',
  ingredientSections: [{ title: '', items: [{ id: 'a', amount: 2, unit: 'el', name: 'olie' }, { id: 'b', amount: 1.5, unit: 'kg', name: 'ui' }] }],
  instructions: [{ text: 'Verhit de olie.' }, { text: 'Voeg de ui toe.' }],
};
const goodOut = {
  title: 'Soup',
  sourceLanguage: 'nl',
  ingredientSections: [{ title: '', items: [{ amount: 2, unit: 'tbsp', name: 'oil' }, { amount: 1.5, unit: 'kg', name: 'onion' }] }],
  instructions: [{ text: 'Heat the oil.' }, { text: 'Add the onion.' }],
};

test('a faithful translation passes every check', () => {
  const checks = checkTranslation({ recipe, lang: 'nl' }, { raw: goodOut, parsed: {}, error: undefined });
  assert.equal(scoreOf(checks), 1);
});

test('changed amount, wrong language flag and untranslated steps are caught', () => {
  const bad = { ...goodOut, sourceLanguage: 'other', ingredientSections: [{ title: '', items: [{ amount: 3, unit: 'tbsp', name: 'oil' }, goodOut.ingredientSections[0].items[1]] }], instructions: recipe.instructions };
  const checks = checkTranslation({ recipe, lang: 'nl' }, { raw: bad, parsed: {}, error: undefined });
  assert.equal(checks.amounts_kept, false);
  assert.equal(checks.language_detected, false);
  assert.equal(checks.steps_translated, false);
  assert.equal(checks.valid_structure, true);
});

test('an error fails the structure check', () => {
  const checks = checkTranslation({ recipe, lang: 'nl' }, { raw: undefined, parsed: undefined, error: 'boom' });
  assert.equal(checks.valid_structure, false);
  assert.equal(scoreOf(checks), 0);
});

test('annotation: verbatim mentions and known ids', () => {
  const raw = { ingredients: [], steps: [{ refs: [{ id: 'a', mention: 'de olie' }] }, { refs: [{ id: 'zzz', mention: 'de kaas' }] }] };
  const parsed = { forms: { a: {}, b: {} }, refs: [[{}], []] };
  const checks = checkAnnotation({ recipe: { ...recipe, ingredientSectionsEn: undefined }, lang: 'nl' }, { raw, parsed, error: undefined });
  assert.equal(checks.forms_complete, true);
  assert.equal(checks.has_refs, true);
  assert.equal(checks.mentions_verbatim, false); // "de kaas" is not in step 2 (1 of 2 = 50%)
  assert.equal(checks.ids_valid, false);
});

test('summary: rates, latency percentiles and errors', () => {
  const s = summarize([
    { name: 'r1', checks: { valid_structure: true, x: true }, score: 1, ms: 100, tokens: { input: 5, output: 2 } },
    { name: 'r2', checks: { valid_structure: false, x: false }, score: 0, ms: 300, error: 'bad', tokens: { input: 1, output: 1 } },
  ]);
  assert.equal(s.meanScore, 0.5);
  assert.equal(s.structureRate, 0.5);
  assert.equal(s.latencyMs.p50, 300);
  assert.deepEqual(s.tokens, { input: 6, output: 3 });
  assert.equal(s.errors[0].message, 'bad');
});
