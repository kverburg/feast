import test from 'node:test';
import assert from 'node:assert/strict';
import { isSeasoningName, dropDefaultSeasoningAmounts, normalizeParsedRecipe } from '../src/shared/importTasks.ts';
import { stripLeadingQuantity, parseTranslation } from '../src/shared/geminiTasks.ts';

test('salt and pepper are recognised in both languages', () => {
  for (const n of ['Zout en peper', 'zout', 'peper', 'Salt and Pepper', 'zwarte peper', 'versgemalen zwarte peper', 'zeezout', 'salt & pepper', 'zout en zwarte peper'])
    assert.equal(isSeasoningName(n), true, n);
  for (const n of ['pepertje', 'paprika', 'zoute haring', 'peperkoek', 'olijfolie', 'knoflook', 'chilipeper vlokken'])
    assert.equal(isSeasoningName(n), false, n);
});

test('a default amount of 1 in front of a seasoning becomes "no quantity"', () => {
  const sections = [{ id: 's', title: '', items: [
    { id: 'a', amount: 1, unit: '', name: 'Zout en peper' },
    { id: 'b', amount: 1, unit: 'tl', name: 'zout' },
    { id: 'c', amount: 2, unit: '', name: 'peper' },
    { id: 'd', amount: 1, unit: '', name: 'ui' },
  ] }];
  const out = dropDefaultSeasoningAmounts(sections)[0].items;
  assert.deepEqual(out.map((i) => i.amount), [0, 1, 2, 1]);
});

test('imports end up without a quantity for seasonings, and keep 0 as 0', () => {
  const r = normalizeParsedRecipe({ title: 'x', ingredientSections: [{ title: 'I', items: [{ amount: 1, unit: '', name: 'zout en peper' }, { amount: 0, unit: '', name: 'olijfolie', notes: 'naar smaak' }] }], instructions: [{ text: 'a' }] });
  assert.deepEqual(r.ingredientSections[0].items.map((i) => i.amount), [0, 0]);
});

test('a number the model copied into a translated name is removed', () => {
  assert.equal(stripLeadingQuantity('1 Salt and Pepper', 'Zout en peper'), 'Salt and Pepper');
  assert.equal(stripLeadingQuantity('1/2 cup flour', 'bloem'), 'cup flour');
  assert.equal(stripLeadingQuantity('2 eggs', '2 eieren'), '2 eggs'); // the original has it too
  assert.equal(stripLeadingQuantity('Salt', 'Zout'), 'Salt');
  const recipe = { ingredientSections: [{ id: 's', title: 'I', items: [{ id: 'a', amount: 0, unit: '', name: 'Zout en peper' }] }], instructions: [{ id: 't', stepNumber: 1, text: 'x' }] };
  const out = parseTranslation(recipe, { title: 'T', sourceLanguage: 'nl', ingredientSections: [{ title: 'I', items: [{ name: '1 Salt and Pepper', unit: '' }] }], instructions: [{ text: 'x' }] });
  assert.equal(out.ingredientSections[0].items[0].name, 'Salt and Pepper');
  assert.equal(out.ingredientSections[0].items[0].amount, 0);
});
