import test from 'node:test';
import assert from 'node:assert/strict';
import { mealsOfPerson, mealsWithRecipe } from '../src/services/mealService.ts';

const meal = (id, extra) => ({ id, name: id, recipes: [], archived: false, createdAt: '2026-01-01T10:00:00Z', ...extra });
const meals = [
  meal('old', { date: '2026-02-01', attendeeIds: ['a'], recipes: [{ recipeId: 'r1', servings: 2 }] }),
  meal('new', { date: '2026-05-01', attendeeIds: ['a', 'b'], recipes: [{ recipeId: 'r1', servings: 2 }, { recipeId: 'r2', servings: 2 }] }),
  meal('undated', { attendeeIds: ['b'], recipes: [{ recipeId: 'r2', servings: 2 }] }),
  meal('none', {}),
];

test('a person sees the meals they attended, newest first', () => {
  assert.deepEqual(mealsOfPerson(meals, 'a').map((m) => m.id), ['new', 'old']);
  assert.deepEqual(mealsOfPerson(meals, 'b').map((m) => m.id), ['new', 'undated']);
  assert.deepEqual(mealsOfPerson(meals, 'zzz'), []);
});

test('a recipe lists the meals it was part of', () => {
  assert.deepEqual(mealsWithRecipe(meals, 'r1').map((m) => m.id), ['new', 'old']);
  assert.deepEqual(mealsWithRecipe(meals, 'r2').map((m) => m.id), ['new', 'undated']);
  assert.deepEqual(mealsWithRecipe(meals, 'r9'), []);
});

import { recipesServedTo, servedBefore } from '../src/services/mealService.ts';

test('a person sees which recipes they had, how often, when last and with whom', () => {
  const served = recipesServedTo(meals, 'a');
  assert.deepEqual(served.map((s) => [s.recipeId, s.count, s.last.id]), [['r1', 2, 'new'], ['r2', 1, 'new']]);
  assert.deepEqual(served.find((s) => s.recipeId === 'r1').withNames, ['b']);
  assert.deepEqual(recipesServedTo(meals, 'zzz'), []);
});

test('"did I make this for Anna?": the latest other meal where somebody had the recipe', () => {
  const planned = meal('plan', { date: '2026-06-01', attendeeIds: ['a', 'b', 'c'], recipes: [{ recipeId: 'r1', servings: 2 }] });
  const all = [...meals, planned];
  const hits = servedBefore(all, 'r1', ['a', 'b', 'c'], 'plan');
  assert.deepEqual(hits.map((h) => [h.personId, h.meal.id]), [['a', 'new'], ['b', 'new']]); // c never had it
  // meals after the planned one do not count, and the meal itself is skipped
  assert.deepEqual(servedBefore(all, 'r1', ['a'], 'new').map((h) => h.meal.id), ['old']);
  assert.deepEqual(servedBefore(all, 'r1', ['a', 'b'], 'old').map((h) => h.meal.id), []);
  assert.deepEqual(servedBefore(all, 'r2', ['c'], 'plan'), []);
});
