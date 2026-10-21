import test from 'node:test';
import assert from 'node:assert/strict';
import { addImport, processWork, readWork, acknowledge } from '../worker/work.js';

const fakeKv = () => {
  const store = new Map();
  return {
    store,
    async get(key, type) {
      const v = store.get(key);
      if (!v) return null;
      return type === 'arrayBuffer' ? v.value : v.value;
    },
    async getWithMetadata(key, type) {
      const v = store.get(key);
      if (!v) return { value: null, metadata: null };
      if (type === 'stream') return { value: { cancel: async () => {} }, metadata: v.metadata ?? null };
      return { value: v.value, metadata: v.metadata ?? null };
    },
    async put(key, value, opts) {
      store.set(key, { value, metadata: opts?.metadata });
    },
  };
};

const IMG_ID = '11111111-2222-3333-4444-555555555555';
const recipeAnswer = (extra = {}) => ({
  candidates: [{ content: { parts: [{ text: JSON.stringify({
    title: 'Courgettesoep', servings: 8, prepTime: 10, cookTime: 20,
    ingredientSections: [{ title: 'Ingredients', items: [{ amount: 6, unit: '', name: 'courgettes' }] }],
    instructions: [{ text: 'Kook de soep.', timerMinutes: 7 }], ...extra,
  }) }] } }],
});

const setup = async (answers) => {
  const kv = fakeKv();
  await kv.put(`img:${IMG_ID}`, new Uint8Array([1, 2, 3]).buffer, { metadata: { type: 'image/jpeg' } });
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    const a = answers.shift();
    return typeof a === 'number' ? new Response(JSON.stringify({ error: { message: 'busy' } }), { status: a }) : new Response(JSON.stringify(a));
  };
  return { env: { FEAST: kv, GEMINI_API_KEY: 'k', WORK_GAP_MS: '0' }, calls };
};

test('a registered photo is read by the server and left as a patch', async () => {
  const { env, calls } = await setup([recipeAnswer()]);
  assert.equal(await addImport(env, { id: 'imp-a1', imageUrl: `/api/image/${IMG_ID}`, fileName: 'page.jpeg' }), true);
  assert.equal((await readWork(env)).imports.length, 1);
  await processWork(env);
  const doc = await readWork(env);
  assert.equal(doc.imports.length, 0);
  assert.equal(doc.patches.length, 1);
  const patch = doc.patches[0];
  assert.equal(patch.kind, 'p');
  assert.equal(patch.id, 'imp-a1');
  assert.equal(patch.result.title, 'Courgettesoep');
  assert.equal(patch.result.instructions[0].timerMinutes, 7);
  assert.equal(patch.result.sourceImage, `/api/image/${IMG_ID}`);
  // the photo went to the model as inline data
  assert.equal(calls[0].body.contents[0].parts[1].inlineData.data, 'AQID');
  assert.equal(await acknowledge(env, [patch.key]), 1);
});

test('bad requests are refused', async () => {
  const { env } = await setup([]);
  assert.equal(await addImport(env, { id: 'x', imageUrl: 'https://evil.example/a.jpg' }), false);
  assert.equal(await addImport(env, { id: 'bad id!', imageUrl: `/api/image/${IMG_ID}` }), false);
});

test('a busy model keeps the import queued and backs off', async () => {
  const { env } = await setup([503]);
  await addImport(env, { id: 'imp-b', imageUrl: `/api/image/${IMG_ID}`, fileName: 'p.jpeg' });
  assert.equal(await processWork(env), 'rate_limited');
  const doc = await readWork(env);
  assert.equal(doc.imports.length, 1);
  assert.equal(doc.status.state, 'waiting');
  assert.ok(doc.status.nextAt > Date.now());
});

test('an answer without a recipe is retried, then given up with the reason', async () => {
  const { env } = await setup([{ candidates: [{ content: { parts: [{ text: '{"title":"x"}' }] } }] }, { candidates: [{ content: { parts: [{ text: '{"title":"x"}' }] } }] }, { candidates: [{ content: { parts: [{ text: '{"title":"x"}' }] } }] }]);
  await addImport(env, { id: 'imp-c', imageUrl: `/api/image/${IMG_ID}`, fileName: 'p.jpeg' });
  for (let i = 0; i < 3; i++) await processWork(env);
  const doc = await readWork(env);
  assert.equal(doc.imports.length, 0);
  assert.equal(doc.patches[0].gaveUp, true);
  assert.match(doc.patches[0].error, /did not find a recipe/);
});

test('a photo that is gone from the server ends the import with a clear error', async () => {
  const { env } = await setup([]);
  await addImport(env, { id: 'imp-d', imageUrl: '/api/image/99999999-2222-3333-4444-555555555555', fileName: 'p.jpeg' });
  await processWork(env);
  const doc = await readWork(env);
  assert.equal(doc.patches[0].gaveUp, true);
  assert.match(doc.patches[0].error, /no longer on the server/);
});
