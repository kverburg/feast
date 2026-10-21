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
