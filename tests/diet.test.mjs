import test from 'node:test';
import assert from 'node:assert/strict';
import { termMatches, recipeConflicts, mealConflicts } from '../src/services/dietService.ts';

test('terms match whole words and, when long enough, parts of compounds', () => {
  assert.equal(termMatches('noten', 'walnoten'), true);
  assert.equal(termMatches('pinda', 'pindakaas'), true);
  assert.equal(termMatches('ui', 'ui'), true);
  assert.equal(termMatches('ui', 'kruiden'), false);
  assert.equal(termMatches('Koriander', 'verse koriander (fijngehakt)'), true);
  assert.equal(termMatches('ei', 'bleekselderij'), false);
  assert.equal(termMatches('', 'melk'), false);
});

test('accents and case do not matter', () => {
  assert.equal(termMatches('maïs', 'MAIS'), true);
  assert.equal(termMatches('peper', 'Zwarte peper'), true);
});

const recipe = {
  id: 'r1',
  title: 'Pastasalade',
  ingredientSections: [{ id: 's', title: '', items: [{ id: 'i1', amount: 1, unit: '', name: 'walnoten' }, { id: 'i2', amount: 1, unit: '', name: 'verse koriander' }] }],
  ingredientSectionsEn: [{ id: 's', title: '', items: [{ id: 'i1', amount: 1, unit: '', name: 'walnuts' }] }],
};
const anna = { id: 'p1', name: 'Anna', allergies: ['noten'], dislikes: ['koriander', 'olijven'] };
const bram = { id: 'p2', name: 'Bram' };

test('a recipe is checked against allergies and dislikes', () => {
  const c = recipeConflicts(recipe, [anna, bram]);
  assert.deepEqual(c.map((x) => [x.person.name, x.kind, x.term]), [['Anna', 'allergy', 'noten'], ['Anna', 'dislike', 'koriander']]);
});

test('the English ingredient names count too', () => {
  const en = recipeConflicts(recipe, [{ id: 'p3', name: 'Cleo', allergies: ['walnuts'] }]);
  assert.equal(en.length, 1);
  assert.equal(en[0].ingredient, 'walnuts');
});

test('a meal only checks the people attending it', () => {
  const meal = { id: 'm', name: 'Dinner', recipes: [{ recipeId: 'r1', servings: 2 }], archived: false, createdAt: '', attendeeIds: ['p2', 'gone'] };
  assert.equal(mealConflicts(meal, [recipe], [anna, bram]).length, 0);
  assert.equal(mealConflicts({ ...meal, attendeeIds: ['p1'] }, [recipe], [anna, bram]).length, 2);
  assert.equal(mealConflicts({ ...meal, attendeeIds: undefined }, [recipe], [anna, bram]).length, 0);
});
