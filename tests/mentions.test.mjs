import test from 'node:test';
import assert from 'node:assert/strict';
import { findMention } from '../src/shared/mentions.ts';
import { buildStepSegments } from '../src/services/amounts.ts';
import { parseAnnotation } from '../src/shared/geminiTasks.ts';

test('a mention is a whole word, not a piece of a longer one', () => {
  assert.equal(findMention('Serveer de maïssoep met wat extra maïs', 'maïs'), 34);
  assert.equal(findMention('Serveer de maïssoep', 'maïs'), -1);
  assert.equal(findMention('Voeg de ui toe', 'ui'), 8);
  assert.equal(findMention('Voeg de kruiden toe', 'ui'), -1);
  assert.equal(findMention('Bak de uien.', 'de uien'), 4);
});

test('step display puts the quantity after the whole word only', () => {
  const text = 'Serveer de maïssoep met extra maïs en olie';
  const segs = buildStepSegments(text, [{ ingredientId: 'a', mention: 'maïs', fraction: 1 }], new Set(['a']));
  assert.equal(segs[0].text, 'Serveer de maïssoep met extra maïs');
  assert.equal(segs[0].ref.ingredientId, 'a');
});

test('annotation drops a mention that only occurs inside a longer word', () => {
  const sections = [{ id: 's', title: '', items: [{ id: 'a', amount: 30, unit: 'g', name: 'maïs' }] }];
  const steps = [{ id: 't', stepNumber: 1, text: 'Serveer de maïssoep.' }];
  const out = parseAnnotation(sections, steps, { ingredients: [{ id: 'a', singular: 'maïs', plural: 'maïs' }], steps: [{ refs: [{ id: 'a', mention: 'maïs', fraction: 1 }] }] });
  assert.deepEqual(out.refs[0], []);
});
